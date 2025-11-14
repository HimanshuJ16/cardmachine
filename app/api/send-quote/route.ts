import { NextRequest, NextResponse } from 'next/server'
import { buildQuotePDF } from '@/lib/pdf'
import { sendEmailWithAttachment } from '@/lib/email'

export const runtime = 'nodejs'

export async function POST(req: NextRequest){
  try {
    const body = await req.json()
    const { email, customerName, analysePayload, terminalOption } = body
    if(!email || !analysePayload) return NextResponse.json({error:'Missing fields'},{status:400})

    const buf = await buildQuotePDF({
      merchantName: customerName || 'Merchant',
      monthTurnover: analysePayload.fields.monthTurnover,
      txCount: analysePayload.fields.mix.txCount,
      tierName: analysePayload.quote.tierName || 'CardMachineQuote.com Tier',
      eventusMonthly: analysePayload.quote.cmqMonthly,
      monthlySaving: analysePayload.quote.monthlySaving,
      annualSaving: analysePayload.quote.annualSaving,
      terminalOption: terminalOption || 'none',
      oneOff: analysePayload.quote.oneOff || 0,
    })

    await sendEmailWithAttachment({
      to: email,
      subject: 'Your CardMachineQuote.com savings quote',
      text: 'Thanks for checking your savings — your personalised estimate is attached. Book a quick call to confirm your quote.',
      filename: 'CMQ-Savings-Quote.pdf',
      content: buf
    })

    return NextResponse.json({ ok:true })
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 })
  }
}
