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
// export const maxDuration = 60;

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

    // CASE A: Client sent raw text (Image OCR happened in browser)
    if (contentType.includes("application/json")) {
      const body = await req.json();
      const rawText = body.text;
      // If sending other fields via JSON
      businessName = body.businessName || "";
      userEmail = body.email || "";
      terminalOption = body.terminalOption || "none";
      terminalsCount = Number(body.terminalsCount || 1);

      if (!rawText) throw new Error("No text provided in JSON body");
      
      console.log("Received text from client-side OCR. Length:", rawText.length);
      fields = await analyzeTextWithOpenAI(rawText);
      console.log("AI extracted fields:", fields);
      
      // Create a dummy buffer for email attachment
      fileBuffer = Buffer.from("Text extracted from image:\n\n" + rawText);
      fileName = "extracted_text.txt";
    } 
    // CASE B: Client sent a PDF file (Standard upload)
    else if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("file") as File;
      
      businessName = (form.get("businessName") as string) || "";
      userEmail = (form.get("email") as string) || "";
      terminalOption = (form.get("terminalOption") as string) || "none";
      terminalsCount = Number(form.get("terminalsCount") || 1);

      if (!file) throw new Error("No file uploaded");
      
      fileName = file.name;
      const arrayBuffer = await file.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);

      console.log("Processing PDF on server:", fileName);
      const pdfText = await extractFromPdf(file);
      fields = await analyzeTextWithOpenAI(pdfText);
      console.log("AI extracted fields:", fields);
    } else {
      throw new Error("Unsupported Content-Type. Use JSON for text or Multipart for PDF.");
    }

    // --- Pricing Logic ---
    const pricingInput: QuoteInputs = {
      monthTurnover: fields.monthTurnover,
      mix: fields.mix,
      currentFeesMonthly: fields.currentFeesMonthly,
      currentFixedMonthly: fields.currentFixedMonthly,
      terminalOption: terminalOption as any,
      terminalsCount
    };

    if (!fields.monthTurnover || fields.monthTurnover < 1) {
        throw new Error("Invalid turnover extracted");
    }

    const tier = pickTier(RATES, pricingInput.monthTurnover);
    const savings = computeSavings(pricingInput);

    // Sanity Check for Consistency
    const currentCost = pricingInput.currentFeesMonthly ?? 0;
    const impliedCurrent = savings.cmqMonthly + (savings.monthlySaving ?? 0);
    if (Math.abs(impliedCurrent - currentCost) > 1.0 && pricingInput.currentFeesMonthly) {
        // Optional: Log warning but don't crash if possible
        console.warn('Savings maths inconsistent');
    }

    const result = {
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

    // --- Send Email ---
    try {
        await sendEmail({
        to: 'quotes@cardmachinequote.com',
        subject: `New Quote: £${fields.monthTurnover} T/O`,
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