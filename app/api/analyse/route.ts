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
  const pricingInput = { monthTurnover:fields.monthTurnover, mix:fields.mix, currentFeesMonthly:fields.currentFeesMonthly, currentFixedMonthly:fields.currentFixedMonthly, terminalOption:terminalOption as any, terminalsCount }
  const { cmqMonthly, oneOff } = priceCMQ(pricingInput)
  const { monthlySaving, annualSaving } = computeSavings(pricingInput)
  return NextResponse.json({ providerGuess:fields.providerGuess, confidence:fields.confidence, fields, quote:{ tierName:'auto', cmqMonthly, oneOff, monthlySaving, annualSaving } })
}
