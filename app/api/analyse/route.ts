import { NextRequest, NextResponse } from "next/server";
import { priceCMQ, computeSavings, pickTier, QuoteInputs } from "@/lib/pricing";
import { RATES } from "@/config/rates";
import { extractFromPdf, analyzeTextWithOpenAI } from "@/lib/providers";
import { sendEmail } from "@/lib/email";
import { renderSavingsEmailHTML } from "@/lib/email-renderer";

// Defined per PDF spec
export type SavingsResult = {
  // Identification
  businessName?: string;
  userEmail?: string;
  providerName?: string;

  // Core savings numbers (per month)
  currentMonthlyCost: number;
  newMonthlyCost: number;
  monthlySaving: number;
  annualSaving: number;

  // Breakdown current provider
  currentTransactionFees: number;
  currentTerminalFees: number;
  currentOtherFees: number;

  // Breakdown CardMachineQuote.com quote
  cmqTransactionFees: number;
  cmqAuthFees: number;
  cmqOtherFees: number;

  // Qualified rate tier (Meta)
  matchedDebitRate: number;
  matchedCreditRate: number;
  matchedOtherRate: number;
  terminalFee: number;
  authFee: number;

  // Status
  parsingStatus: 'success' | 'failed';
  manualRequired: boolean;
};

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let fields;
  let businessName = "";
  let userEmail = "";
  let terminalOption = "none";
  let terminalsCount = 1;
  let fileName = "statement.txt";
  let fileBuffer: Buffer | null = null;

  try {
    const contentType = req.headers.get("content-type") || "";

    // We expect Multipart Form Data now for ALL requests (to ensure file attachment exists)
    if (!contentType.includes("multipart/form-data")) {
      throw new Error("Unsupported Content-Type. Expecting Multipart Form Data.");
    }

    const form = await req.formData();
    const file = form.get("file") as File;
    
    // Check for Client-Side OCR Text
    const extractedText = form.get("extractedText") as string;

    businessName = (form.get("businessName") as string) || "";
    userEmail = (form.get("email") as string) || "";
    terminalOption = (form.get("terminalOption") as string) || "none";
    terminalsCount = Number(form.get("terminalsCount") || 1);

    if (!file) throw new Error("No file uploaded");
    
    // Prepare File for Email (Always available now!)
    fileName = file.name;
    const arrayBuffer = await file.arrayBuffer();
    fileBuffer = Buffer.from(arrayBuffer);

    if (extractedText) {
        // CASE A: Image (Client performed OCR)
        console.log("Using client-side extracted text for analysis...");
        // We use the text for analysis, but we have the original file in 'fileBuffer' for email
        fields = await analyzeTextWithOpenAI(extractedText);
    } else {
        // CASE B: PDF (Server performs extraction)
        console.log("Processing PDF on server...");
        const pdfText = await extractFromPdf(file);
        fields = await analyzeTextWithOpenAI(pdfText);
    }
    
    console.log("AI extracted fields:", fields);

    // --- VALIDATION LOGIC ---
    // A valid merchant statement must have meaningful Turnover AND Fees.
    // If the AI found 0 for fees, it is likely a non-merchant document (e.g., gas bill).
    const isValidStatement = 
        fields.monthTurnover > 10 && 
        fields.currentFeesMonthly !== null && 
        fields.currentFeesMonthly > 0;

    if (!isValidStatement) {
        console.warn("Analysis failed validation (Turnover/Fees missing). Triggering manual review.");

        // 1. Send 'Review Needed' Email to Admin
        try {
            await sendEmail({
                to: 'quotes@cardmachinequote.com', // Internal notification
                subject: `ACTION REQUIRED: Manual Review for ${fileName}`,
                html: `
                    <h2>Analysis Failed - Manual Review Required</h2>
                    <p>A user uploaded a document that could not be automatically analysed (likely not a merchant statement or bad scan).</p>
                    <ul>
                        <li><strong>File Name:</strong> ${fileName}</li>
                        <li><strong>User Email:</strong> ${userEmail || 'Not provided'}</li>
                        <li><strong>Extracted Turnover:</strong> £${fields.monthTurnover}</li>
                        <li><strong>Extracted Fees:</strong> £${fields.currentFeesMonthly}</li>
                    </ul>
                    <p>Please review the attached file and contact the user manually if needed.</p>
                `,
                attachments: fileBuffer ? [{ filename: fileName, content: fileBuffer }] : []
            });
        } catch (e) { console.error("Manual review email failed", e); }

        // 2. Return 'Manual Required' result to frontend
        // We zero out the financial fields so the types stay consistent
        return NextResponse.json({ 
            status: 'ok', 
            result: { 
                manualRequired: true,
                parsingStatus: 'failed',
                businessName,
                userEmail,
                providerName: 'Unknown',
                currentMonthlyCost: 0, newMonthlyCost: 0, monthlySaving: 0, annualSaving: 0,
                currentTransactionFees: 0, currentTerminalFees: 0, currentOtherFees: 0,
                cmqTransactionFees: 0, cmqAuthFees: 0, cmqOtherFees: 0,
                matchedDebitRate: 0, matchedCreditRate: 0, matchedOtherRate: 0,
                terminalFee: 0, authFee: 0
            } 
        });
    }

    // --- Pricing Logic (Only runs if Valid) ---
    const pricingInput: QuoteInputs = {
      monthTurnover: fields.monthTurnover,
      mix: fields.mix,
      currentFeesMonthly: fields.currentFeesMonthly,
      currentFixedMonthly: fields.currentFixedMonthly,
      terminalOption: terminalOption as any,
      terminalsCount
    };

    // (Double check turnover just in case, though handled by isValidStatement)
    if (!fields.monthTurnover || fields.monthTurnover < 1) {
        throw new Error("Invalid turnover extracted");
    }

    const tier = pickTier(RATES, pricingInput.monthTurnover);
    const savings = computeSavings(pricingInput);

    // Sanity Check
    const currentCost = pricingInput.currentFeesMonthly ?? 0;
    const impliedCurrent = savings.cmqMonthly + (savings.monthlySaving ?? 0);
    if (Math.abs(impliedCurrent - currentCost) > 1.0 && pricingInput.currentFeesMonthly) {
        console.warn('Savings maths inconsistent');
    }

    const result: SavingsResult = {
      businessName,
      userEmail,
      providerName: fields.providerGuess || 'Unknown',
      currentMonthlyCost: currentCost,
      newMonthlyCost: savings.cmqMonthly,
      monthlySaving: savings.monthlySaving || 0,
      annualSaving: savings.annualSaving || 0,
      currentTransactionFees: (pricingInput.currentFeesMonthly || 0) - pricingInput.currentFixedMonthly, 
      currentTerminalFees: pricingInput.currentFixedMonthly,
      currentOtherFees: 0,
      cmqTransactionFees: savings.cmqTxnFees,
      cmqAuthFees: savings.cmqAuthFees,
      cmqOtherFees: savings.oneOff / 12,
      matchedDebitRate: tier.rates.debit_pct ?? 0,
      matchedCreditRate: tier.rates.credit_pct ?? 0,
      matchedOtherRate: tier.rates.intl_pct ?? 0,
      terminalFee: RATES.fixed_fees.terminal_monthly * terminalsCount, 
      authFee: tier.rates.auth_fee,
      parsingStatus: 'success',
      manualRequired: false
    };

    // --- Send Success Email ---
    try {
        await sendEmail({
        to: 'quotes@cardmachinequote.com',
        // to: 'himanshujangir16@gmail.com',
        subject: `New Quote: ${fields.providerGuess || 'Unknown'}`,
        html: renderSavingsEmailHTML(result as any),
        attachments: fileBuffer ? [{ filename: fileName, content: fileBuffer }] : []
        });
    } catch (e) { console.error("Email failed", e); }

    return NextResponse.json({ status: 'ok', result });

  } catch (err: any) {
    console.error("Analysis Error:", err);
    return NextResponse.json({ status: 'error', message: err.message }, { status: 500 });
  }
}