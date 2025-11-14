import { NextRequest, NextResponse } from 'next/server'
import { extractFromFile } from '@/lib/providers'
import { priceCMQ, computeSavings } from '@/lib/pricing'

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
  

  const pricingInput = { monthTurnover:fields.monthTurnover, mix:fields.mix, currentFeesMonthly:fields.currentFeesMonthly, currentFixedMonthly:fields.currentFixedMonthly, terminalOption:terminalOption as any, terminalsCount }
  const { cmqMonthly, oneOff } = priceCMQ(pricingInput)
  const { monthlySaving, annualSaving } = computeSavings(pricingInput)

  // --- START MODIFICATION ---
  // Added 'currentMonthly' to the quote object per the spec
  return NextResponse.json({ 
    providerGuess:fields.providerGuess, 
    confidence:fields.confidence, 
    fields, 
    quote:{ 
      tierName:'auto', 
      currentMonthly: pricingInput.currentFeesMonthly, // <-- ADDED THIS
      cmqMonthly, 
      oneOff, 
      monthlySaving, 
      annualSaving 
    } 
  })
  // --- END MODIFICATION ---
}