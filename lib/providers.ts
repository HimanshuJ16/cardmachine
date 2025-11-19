// lib/providers.ts
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
  // We don't return reasoning to the frontend, but it's used internally for accuracy
}

export async function extractFromFile(file: File): Promise<ExtractedFields> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const fileName = file.name.toLowerCase();
  const fileType = file.type || "";

  // Check if it is a PDF
  if (fileType === "application/pdf" || fileName.endsWith(".pdf")) {
    return await processPdf(buffer, fileName);
  }
  // Check if it is an Image
  else if (
    fileType.startsWith("image/") ||
    /\.(jpg|jpeg|png|webp)$/.test(fileName)
  ) {
    return await processImage(buffer, fileType || "image/jpeg");
  } else {
    throw new Error("Unsupported file type. Please upload a PDF or Image (JPG, PNG).");
  }
}

// --- PDF Handling ---
async function processPdf(buffer: Buffer, originalName: string): Promise<ExtractedFields> {
  const tempDir = os.tmpdir();
  // Sanitize filename to prevent path issues
  const safeName = originalName.replace(/[^a-z0-9.]/gi, "_");
  const tempFilePath = path.join(tempDir, `upload-${Date.now()}-${safeName}`);

  try {
    await fs.writeFile(tempFilePath, buffer);

    const loader = new PDFLoader(tempFilePath, {
      splitPages: false,
    });

    const docs = await loader.load();
    const fullText = docs.map((doc) => doc.pageContent).join("\n\n");

    if (!fullText.trim() || fullText.length < 50) {
      throw new Error("PDF text is empty or too short. It might be a scanned image PDF. Try converting it to an image (JPG/PNG) or ensuring it is text-readable.");
    }

    return await analyzeTextWithOpenAI(fullText);
  } catch (error) {
    console.error("PDF Extraction failed:", error);
    throw error;
  } finally {
    try {
      await fs.unlink(tempFilePath);
    } catch (e) { /* ignore cleanup error */ }
  }
}

// --- Image Handling (Vision) ---
async function processImage(buffer: Buffer, mimeType: string): Promise<ExtractedFields> {
  const base64Image = buffer.toString("base64");
  const dataUrl = `data:${mimeType};base64,${base64Image}`;

  return await analyzeImageWithOpenAI(dataUrl);
}

// --- AI Analysis Functions ---

/* UPDATED PROMPT STRATEGY:
  1. We ask for a "_thought_process" field first. This forces the model to "think" before it answers,
     improving accuracy on complex layouts.
  2. We explicitly list terms to AVOID for fees (like "Net Settlement").
*/
const SYSTEM_PROMPT = `You are an expert financial auditor specializing in UK Merchant Services (Credit Card Processing) Statements.

Your goal is to extract precise financial data. You must be careful to distinguish between "Gross Sales", "Net Settlement", and "Total Fees".

Return a JSON object with EXACTLY this structure:
{
  "_thought_process": "Step-by-step reasoning describing where you found the data. e.g. 'I found the summary box on page 1. Total turnover is listed as X. Total charges are listed as Y...'",
  "monthTurnover": number,       // Total Sales Volume / Gross Amount Processed
  "currentFeesMonthly": number,  // Total Fees/Charges deduced (The bill).
  "currentFixedMonthly": number, // Sum of fixed costs (Terminal rental, PCI, Auth fees, Minimum charges). Exclude percentage rates.
  "providerGuess": string,       // e.g., Worldpay, Barclaycard, Elavon, Dojo, Zettle
  "mix": {
      "debitTurnover": number,
      "creditTurnover": number,
      "businessTurnover": number,
      "internationalTurnover": number,
      "amexTurnover": number,
      "txCount": number         // Total count of transactions
  }
}

GUIDELINES FOR ACCURACY:

1. **monthTurnover (Turnover):**
   - Look for "Total Card Turnover", "Total Sales", "Gross Value", or "Total Submitted".
   - Do NOT use "Net Settlement" (which is Sales minus Fees).

2. **currentFeesMonthly (Total Bill):**
   - CRITICAL: This is the amount the merchant PAYS.
   - Look for "Total Charges", "Total Fees", "Invoice Total", "Amount to be Debited", or "Total Service Charges".
   - It usually includes: Discount/MSC charges + Authorization Fees + Terminal Rental + PCI fees + VAT.
   - WARNING: Do NOT mistake "Net Deposit" or "Total Paid to Merchant" for the fees. 
   - SANITY CHECK: Fees are usually 0.5% to 5% of Turnover. If fees are > 20% of turnover, you are likely reading the wrong number.
   - If "Total Charges" is not explicitly summed, you MUST sum up the line items (MSC + Authorizations + Terminal Fees + Other).

3. **currentFixedMonthly:**
   - Look for fixed monthly line items: "Terminal Hire", "Terminal Rental", "PCI Compliance", "Management Fee", "Minimum Monthly Service Charge".
   - Do NOT include "Merchant Service Charges" (MSC) which are percentages.

4. **Mix (Breakdown):**
   - If the statement splits by "Debit" vs "Credit" vs "Commercial/Business", use those exact figures.
   - If specific numbers are missing, estimate: Debit ~80%, Credit ~18%, Other ~2%.
   - If "txCount" (number of transactions) is missing, estimate: Turnover / 30.

IMPORTANT: Return ONLY raw numbers (no currency symbols). Return 0 if a field is truly 100% missing.`;

async function analyzeTextWithOpenAI(text: string): Promise<ExtractedFields> {
  // Truncate extremely long PDFs to avoid context limits (approx 120k chars is safe for 4o)
  const truncatedText = text.slice(0, 100000);

  const completion = await openai.chat.completions.create({
    model: "gpt-4o", 
    temperature: 0, // Deterministic output for numbers
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: `Analyze this text extracted from a PDF statement:\n\n${truncatedText}` }
    ]
  });

  return parseOpenAIResponse(completion);
}

async function analyzeImageWithOpenAI(base64DataUrl: string): Promise<ExtractedFields> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    temperature: 0, // Deterministic output
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          { type: "text", text: "Analyze this image of a merchant statement. Focus on the Summary/Totals section to find the Total Fees and Turnover." },
          {
            type: "image_url",
            image_url: {
              url: base64DataUrl,
              detail: "high" // Essential for reading small print
            }
          }
        ]
      }
    ]
  });

  return parseOpenAIResponse(completion);
}

// Helper to parse and type-check the result
function parseOpenAIResponse(completion: any): ExtractedFields {
  const content = completion.choices[0].message.content;
  if (!content) throw new Error("AI response was empty");

  let raw: any;
  try {
    raw = JSON.parse(content);
  } catch (e) {
    throw new Error("AI did not return valid JSON");
  }

  // Log the thought process for debugging (Server-side only)
  if (raw._thought_process) {
    console.log("AI Reasoning:", raw._thought_process);
  }

  // Helper to safely parse numbers
  const n = (val: any) => {
    if (typeof val === 'number') return val;
    if (typeof val === 'string') {
      // Remove currency symbols and commas
      const clean = val.replace(/[^0-9.-]/g, '');
      return parseFloat(clean) || 0;
    }
    return 0;
  };

  return {
    monthTurnover: n(raw.monthTurnover),
    currentFeesMonthly: n(raw.currentFeesMonthly),
    currentFixedMonthly: n(raw.currentFixedMonthly),
    providerGuess: raw.providerGuess || "Unknown",
    mix: {
      debitTurnover: n(raw.mix?.debitTurnover),
      creditTurnover: n(raw.mix?.creditTurnover),
      businessTurnover: n(raw.mix?.businessTurnover),
      internationalTurnover: n(raw.mix?.internationalTurnover),
      amexTurnover: n(raw.mix?.amexTurnover),
      txCount: n(raw.mix?.txCount) || 1,
    }
  };
}