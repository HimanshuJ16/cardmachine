// app/api/analyse/route.ts
import { NextRequest, NextResponse } from "next/server";
import { priceCMQ, computeSavings, pickTier, QuoteInputs } from "@/lib/pricing";
import { RATES } from "@/config/rates";
import { sendEmail } from "@/lib/email";
import { renderSavingsEmailHTML } from "@/lib/email-renderer";
import { extractFromFile } from "@/lib/providers";

export const runtime = "nodejs";

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

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get("file");
  
  // User inputs from form
  const businessName = (form.get("businessName") as string) || "";
  const userEmail = (form.get("email") as string) || "";
  const terminalOption = (form.get("terminalOption") as string) || "none";
  const terminalsCount = Number(form.get("terminalsCount") || 1);

  if (!(file instanceof Blob)) {
    return NextResponse.json({ status: 'error', message: "Missing file" }, { status: 400 });
  }

  const fileName = (file as File).name || "statement.pdf";
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  let result: SavingsResult | null = null;
  let parsingStatus: 'success' | 'failed' = 'success';
  let manualRequired = false;

  try {
    // 1. Extract Data
    const fields = await extractFromFile(file);
    
    console.log("AI extracted fields:", fields);

    // 2. Prepare Pricing Inputs
    // Map extracted fields to pricing inputs
    const pricingInput: QuoteInputs = {
      monthTurnover: fields.monthTurnover,
      mix: fields.mix,
      currentFeesMonthly: fields.currentFeesMonthly,
      currentFixedMonthly: fields.currentFixedMonthly,
      terminalOption: terminalOption as any,
      terminalsCount
    };

    // 3. Sanity Checks & Calculation
    // Logic: Set manualRequired = true when parsing fails OR when calculated numbers clearly don't make sense.
    
    if (!fields.monthTurnover || fields.monthTurnover < 1) {
      throw new Error("Invalid turnover extracted");
    }
    
    // Spec Sanity Check: Turnover > 200 but currentMonthlyCost is 0
    if (fields.monthTurnover > 200 && (!fields.currentFeesMonthly || fields.currentFeesMonthly === 0)) {
      throw new Error('Turnover > £200 but currentMonthlyCost is £0 - treat as unreadable');
    }

    const tier = pickTier(RATES, pricingInput.monthTurnover);
    const savings = computeSavings(pricingInput);

    // Spec Sanity Check: Savings maths inconsistent
    // impliedCurrent = newMonthlyCost + monthlySaving
    const currentCost = pricingInput.currentFeesMonthly ?? 0;
    const impliedCurrent = savings.cmqMonthly + (savings.monthlySaving ?? 0);
    
    // Allow for small floating point differences (e.g. > 1.0)
    if (Math.abs(impliedCurrent - currentCost) > 1.0) {
       // Note: This throws if currentFeesMonthly was null/undefined which defaults to 0, likely triggering this.
       // This enforces that we MUST have a valid current cost to provide an automatic quote.
       throw new Error('Savings maths inconsistent - implied current cost differs from extracted cost');
    }

    // 4. Construct Success Result
    result = {
      businessName,
      userEmail,
      providerName: fields.providerGuess || 'Unknown',
      
      currentMonthlyCost: currentCost,
      newMonthlyCost: savings.cmqMonthly,
      monthlySaving: savings.monthlySaving || 0,
      annualSaving: savings.annualSaving || 0,

      currentTransactionFees: (pricingInput.currentFeesMonthly || 0) - pricingInput.currentFixedMonthly, // Approximation based on available data
      currentTerminalFees: pricingInput.currentFixedMonthly,
      currentOtherFees: 0, // Not explicitly extracted in current 'fields'

      cmqTransactionFees: savings.cmqTxnFees,
      cmqAuthFees: savings.cmqAuthFees,
      cmqOtherFees: savings.oneOff / 12, // Amortizing one-off for monthly view or just 0 if not strictly monthly

      // Tier Meta
      matchedDebitRate: tier.rates.debit_pct ?? 0,
      matchedCreditRate: tier.rates.credit_pct ?? 0,
      matchedOtherRate: tier.rates.intl_pct ?? 0,
      terminalFee: RATES.fixed_fees.terminal_monthly * terminalsCount, 
      authFee: tier.rates.auth_fee,

      parsingStatus: 'success',
      manualRequired: false
    };

  } catch (err) {
    console.warn('Statement parsing failed or sanity check failed:', err);
    parsingStatus = 'failed';
    manualRequired = true;

    // Construct Failed Result (Empty/Zeroed)
    result = {
      businessName,
      userEmail,
      providerName: 'Unknown',
      currentMonthlyCost: 0,
      newMonthlyCost: 0,
      monthlySaving: 0,
      annualSaving: 0,
      currentTransactionFees: 0,
      currentTerminalFees: 0,
      currentOtherFees: 0,
      cmqTransactionFees: 0,
      cmqAuthFees: 0,
      cmqOtherFees: 0,
      matchedDebitRate: 0,
      matchedCreditRate: 0,
      matchedOtherRate: 0,
      terminalFee: 0,
      authFee: 0,
      parsingStatus: 'failed',
      manualRequired: true,
    };
  }

  // 5. Send Email (ALWAYS)
  try {
    const emailSubject = parsingStatus === 'success'
      ? `New statement uploaded: ${businessName || 'Unknown business'}`
      : `UNREADABLE statement - manual quote required (${businessName || 'Unknown business'})`;

    await sendEmail({
      to: 'quotes@cardmachinequote.com',
      // to: "himanshujangir16@gmail.com",
      subject: emailSubject,
      html: renderSavingsEmailHTML(result),
      attachments: [
        {
          filename: fileName,
          content: buffer
        }
      ]
    });
  } catch (emailErr) {
    console.error("Failed to send email:", emailErr);
    // We continue to return the response even if email fails, but ideally this should be logged to an error service
  }

  // 6. Return Response
  // If success, return result. If failed/unreadable, return result with status 'unreadable' 
  // or 'ok' with manualRequired=true depending on frontend expectation.
  // The spec says: return NextResponse.json({ status: 'unreadable', result }); for errors.

  if (parsingStatus === 'success') {
    return NextResponse.json({ status: 'ok', result });
  } else {
    return NextResponse.json({ status: 'unreadable', result });
  }
}