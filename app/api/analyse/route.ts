import { NextRequest, NextResponse } from 'next/server'
import { extractFromFile } from '@/lib/providers'
// --- START MODIFICATION ---
import { priceCMQ, computeSavings, pickTier, QuoteInputs } from '@/lib/pricing'
import { RATES } from '@/config/rates'
// --- END MODIFICATION ---

export const runtime = 'nodejs'

export async function POST(req: NextRequest){
  const form = await req.formData()
  const file = form.get('file')
  const terminalOption = (form.get('terminalOption') as string) || 'none'
  const terminalsCount = Number(form.get('terminalsCount') || 1)
  if(!(file instanceof Blob)) return NextResponse.json({error:'Missing file'},{status:400})

  const fields:any = await extractFromFile(file as Blob)

  const { monthTurnover, currentFeesMonthly, mix } = fields;
  const txCount = mix?.txCount;

  // Specific logging requested in debug instructions
  console.log("AI extracted fields:", fields); 

  // Specific parsed values logging
  console.log("Parsed values:", { 
    monthTurnover: monthTurnover, //
    currentFees: currentFeesMonthly, //
    txCount: txCount //
  });

  // Fallback logic/validation
  if (!monthTurnover || monthTurnover < 1) {
    return NextResponse.json({ error: 'Could not extract valid Turnover from statement.' }, { status: 400 });
  }
  if (!txCount || txCount < 1) {
    return NextResponse.json({ error: 'Could not extract valid Transaction Count from statement.' }, { status: 400 });
  }
  

  const pricingInput: QuoteInputs = { monthTurnover:fields.monthTurnover, mix:fields.mix, currentFeesMonthly:fields.currentFeesMonthly, currentFixedMonthly:fields.currentFixedMonthly, terminalOption:terminalOption as any, terminalsCount }
  const { cmqMonthly, oneOff } = priceCMQ(pricingInput)
  const { monthlySaving, annualSaving } = computeSavings(pricingInput)

  // --- START MODIFICATION ---
  // Determine pricing tier and qualified rates per CMQ_Email_Dev_Instructions_v2 [cite: 151-201]
  const tier = pickTier(RATES, pricingInput.monthTurnover);
  let pricingTier = "C"; // Default to High Volume
  let qualifiedRates: any = {};

  if (tier.turnover_max === 15000) { // Tier A [cite: 85-88]
    pricingTier = "A";
    qualifiedRates = {
      headline: "Based on your turnover, you qualify for our simple flat rate:",
      simpleAllCardsRate: tier.rates.all_cards_pct,
      debitRate: null,
      creditRate: null,
      businessRate: null,
      internationalRate: null,
      amexRate: null, // Covered by simpleAllCardsRate
      authFee: tier.rates.auth_fee
    };
  } else if (tier.turnover_max === 30000) { // Tier B [cite: 89-103]
    pricingTier = "B";
    qualifiedRates = {
      headline: "Based on your turnover, you qualify for our mid-volume pricing:",
      simpleAllCardsRate: null,
      debitRate: tier.rates.debit_pct,
      creditRate: tier.rates.credit_pct,
      businessRate: tier.rates.business_pct,
      internationalRate: tier.rates.intl_pct,
      amexRate: tier.rates.amex_pct,
      authFee: tier.rates.auth_fee
    };
  } else { // Tier C [cite: 105-119]
    pricingTier = "C";
    qualifiedRates = {
      headline: "Based on your turnover, you qualify for our high-volume pricing:",
      simpleAllCardsRate: null,
      debitRate: tier.rates.debit_pct,
      creditRate: tier.rates.credit_pct,
      businessRate: tier.rates.business_pct,
      internationalRate: tier.rates.intl_pct,
      amexRate: tier.rates.amex_pct,
      authFee: tier.rates.auth_fee
    };
  }

  // Added 'currentMonthly', 'pricingTier', and 'qualifiedRates' to the quote object
  return NextResponse.json({ 
    providerGuess:fields.providerGuess, 
    confidence:fields.confidence, 
    fields, 
    quote:{ 
      tierName:'auto', 
      currentMonthly: pricingInput.currentFeesMonthly,
      cmqMonthly, 
      oneOff, 
      monthlySaving, 
      annualSaving,
      pricingTier: pricingTier,
      qualifiedRates: qualifiedRates
    } 
  })
  // --- END MODIFICATION ---
}