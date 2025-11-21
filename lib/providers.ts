import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import OpenAI from "openai";
import fs from "fs/promises";
import os from "os";
import path from "path";
import { Mix } from "@/lib/pricing";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ExtractedFields {
  monthTurnover: number;
  mix: Mix;
  currentFeesMonthly: number | null;
  currentFixedMonthly: number;
  providerGuess: string;
}

// Only handles PDFs on Server
export async function extractFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const fileName = file.name.toLowerCase();

  if (!fileName.endsWith(".pdf") && file.type !== "application/pdf") {
     throw new Error("Server only handles PDFs. Images must be processed on client.");
  }

  const tempDir = os.tmpdir();
  const safeName = fileName.replace(/[^a-z0-9.]/gi, "_");
  const tempFilePath = path.join(tempDir, `upload-${Date.now()}-${safeName}`);

  try {
    await fs.writeFile(tempFilePath, buffer);
    const loader = new PDFLoader(tempFilePath, { splitPages: false });
    const docs = await loader.load();
    const fullText = docs.map((doc) => doc.pageContent).join("\n\n");

    if (!fullText.trim() || fullText.length < 50) {
      throw new Error("PDF text is empty. It might be a scanned image PDF.");
    }
    return fullText;
  } catch (error) {
    console.error("PDF Extraction failed:", error);
    throw error;
  } finally {
    try { await fs.unlink(tempFilePath); } catch (e) {}
  }
}

// Analyzes Text (Shared by both PDF and Client-side OCR text)
export async function analyzeTextWithOpenAI(text: string): Promise<ExtractedFields> {
  const SYSTEM_PROMPT = `
You are an expert UK Merchant Services Statement auditor.

Your job: Extract ONE MONTH'S financial results from any merchant service statement format.

STRICT JSON OUTPUT ONLY:
{
  "_thought_process": "exact calculations and source rows",
  "monthTurnover": number,
  "currentFeesMonthly": number,
  "currentFixedMonthly": number,
  "providerGuess": string,
  "mix": {
    "debitTurnover": number,
    "creditTurnover": number,
    "businessTurnover": number,
    "internationalTurnover": number,
    "amexTurnover": number,
    "txCount": number
  }
}

════════════════════════════
PROVIDER AUTODETECTION
════════════════════════════
If branding text contains:
- "Worldpay" → providerGuess = "Worldpay"
- "EVO" → "EVO Payments"
- "Barclaycard" → "Barclaycard"
- "Elavon" → "Elavon"
- "First Data", "FD" → "First Data"
- "Clover" → "Clover"
- "Zettle" → "Zettle"
- "SumUp" → "SumUp"
Else → match nearest competitor brand shown

════════════════════════════
TURNOVER EXTRACTION (Priority)
════════════════════════════
Look in this order:

1️⃣ Explicit monthly total e.g. “Total Turnover”, “Total Net Value”, “Total Sales”
2️⃣ Date-bounded period (01/MM — 30/MM)
3️⃣ If only annual totals exist → fallback:
   monthTurnover = annualTurnover / 12
   Note this in _thought_process.

ALWAYS use NET value (after refunds) where available.

════════════════════════════
MONTHLY FEES (KEY RULE)
════════════════════════════
Find monthly Merchant Service Charge (MSC) TOTAL:

Preferred phrases:
- “Total MSC”
- “Merchant Service Charge Total”
- “Total Charges”
- “Total Fees”
- “Net Fees Due”
- “Payable This Month”

If missing:
➜ SUM variable MSC + scheme fees + interchange + margin
➜ Include Visa, MasterCard, Amex, Other schemes

If still missing but daily MSC exists:
➜ SUM “Total MSC” in daily sections

currentFeesMonthly must NOT be zero if fee rows exist.

════════════════════════════
FIXED FEES SEPARATION
════════════════════════════
Fixed recurring fees → currentFixedMonthly
Examples:
- Terminal rental/hosting/service fee
- PCI DSS fee
- Accelerated settlement fee
- Monthly Minimum Service Charge
- Authorisation fee if recurring

Do NOT include:
- per-transaction MSC
- scheme fees
- margin
- interchange

If ANY MSC line exists anywhere:
currentFeesMonthly must NOT be 0.

Fee Extraction Priority:
1) Monthly MSC summary
2) Invoice monthly total
3) Sum of fee category totals:
   - Variable MSC
   - Scheme fees
   - Interchange
   - Margin
4) Sum of daily “Total MSC” values
5) If only fixed recurring fees exist:
   → currentFeesMonthly = 0
6) If absolutely no MSC data:
   → Estimate currentFeesMonthly using:
      estimatedFee = monthTurnover * 0.012
   → Include note: “Estimated due to no MSC rows”

════════════════════════════
TRANSACTION COUNT
════════════════════════════
Priority:
1️⃣ “Transactions: ###”
2️⃣ Card category totals
3️⃣ Daily totals  sum
4️⃣ Fallback: turnover / 35

════════════════════════════
TURNOVER MIX
════════════════════════════
Debit = Visa Debit + MasterCard Debit + Maestro
Credit = Visa Credit + MasterCard Credit
Business = “Business”, “Commercial” labels only
International = “non-EEA”, “World”, “Inter-Region”
Amex = Specific Amex lines
If category absent → assume 0

Validate:
(debit + credit + business + international + amex)
≈ monthTurnover ± 8%

If mismatch → adjust thousands formatting based on majority pattern.

════════════════════════════
NUMBER NORMALISATION
════════════════════════════
- Remove spaces as thousand separators
- Convert decimal comma to point
- £ optional
Examples:
"8 285,70" → 8285.70
"7.559,49" → 7559.49

════════════════════════════
STRICT REQUIREMENTS
════════════════════════════
- JSON ONLY — no narrative outside JSON
- All extracted fields must be numbers (default 0 if truly absent)
- If using a fallback → note it inside _thought_process
`;


  const truncatedText = text.slice(0, 120000);

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: `Analyze this extracted text:\n\n${truncatedText}` }
    ]
  });

  const content = completion.choices[0].message.content;
  if (!content) throw new Error("AI response was empty");

  let raw: any;
  try {
    raw = JSON.parse(content);
  } catch {
    throw new Error("AI did not return valid JSON");
  }

  if (raw._thought_process) console.log("AI Reasoning:", raw._thought_process);

  const parseNumber = (val: any) => {
    if (typeof val === "number") return val;
    if (typeof val === "string") {
      const clean = val
        .replace(/[^0-9.,\- ]/g, "")
        .replace(/ /g, "") // remove spacial thousands
        .replace(/,(\d{1,2})$/, ".$1") // comma decimals → dot
        .replace(/,/g, ""); // remove leftover commas
      return parseFloat(clean) || 0;
    }
    return 0;
  };

  return {
    monthTurnover: parseNumber(raw.monthTurnover),
    currentFeesMonthly: parseNumber(raw.currentFeesMonthly),
    currentFixedMonthly: parseNumber(raw.currentFixedMonthly),
    providerGuess: raw.providerGuess || "Unknown",
    mix: {
      debitTurnover: parseNumber(raw.mix?.debitTurnover),
      creditTurnover: parseNumber(raw.mix?.creditTurnover),
      businessTurnover: parseNumber(raw.mix?.businessTurnover),
      internationalTurnover: parseNumber(raw.mix?.internationalTurnover),
      amexTurnover: parseNumber(raw.mix?.amexTurnover),
      txCount: parseNumber(raw.mix?.txCount) || 1
    }
  };
}