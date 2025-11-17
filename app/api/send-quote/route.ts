import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'
import { priceCMQ, QuoteInputs } from '@/lib/pricing'

export const runtime = 'nodejs'

const emailTemplate = `
<div style="font-family: Arial, Helvetica, sans-serif; color: #111; max-width: 650px; margin:0 auto;">
  <h2>Your CardMachineQuote.com Savings Report</h2>
  <p style="color: #444; font-size: 14px; margin-top:0;">
    Thanks for uploading your statement. Here's your personalised breakdown.
  </p>
  <div style="border:1px solid #E5E7EB; border-radius: 12px; padding:16px; margin-top: 16px;">
    <h3 style="margin-top:0;">Estimated savings</h3>
    <p><strong>Monthly cost with current provider:</strong> £{{currentMonthly}}</p>
    <p><strong>Monthly with CardMachineQuote.com:</strong> £{{cmqMonthly}}</p>
    <p><strong>Monthly saving:</strong> £{{monthlySaving}}</p>
    <p><strong>Annual saving:</strong> £{{annualSaving}}</p>
  </div>
  <h3 style="margin-top: 30px;">Your cost breakdown</h3>
  <p><strong>Current provider fees:</strong></p>
  <ul>
    <li>Transaction fees: £{{currentTxnFees}}</li>
    <li>Terminal fees: £{{currentTerminalFees}}</li>
    <li>Other charges: £{{currentOtherFees}}</li>
    <li><strong>Total monthly cost: £{{currentMonthly}}</strong></li>
  </ul>
  <p><strong>Your new CardMachineQuote.com fees:</strong></p>
  <ul>
    <li>Transaction fees: £{{cmqTxnFees}}</li>
    <li>Authorisation fees: £{{cmqAuthFees}}</li>
    <li>No PCI fees &amp; no minimum monthly fee</li>
    <li><strong>Total monthly cost: £{{cmqMonthly}}</strong></li>
  </ul>

  {{qualifiedRatesHtml}}

  <h3 style="margin-top: 30px;">Your card machine options</h3>
  <img src="https://cardmachine.vercel.app/1.jpg" alt="Card machine" style="max-width:100%; border-radius:12px; margin:12px 0;" />
  <ul>
    <li>£20/month (12-month contract)</li>
    <li>£99 one-off buy-out</li>
  </ul>
  <h3 style="margin-top: 24px;">Device benefits</h3>
  <ul>
    <li><strong>All-in-one device</strong> accept payments, calculate totals, and run Mini POS.</li>
    <li><strong>&lt; 1 second approvals</strong> fast transactions keep queues moving.</li>
    <li><strong>Print on the go</strong> built-in printer, no extra hardware needed.</li>
    <li><strong>All-day battery</strong> 24-48 hours of active use.</li>
    <li><strong>Free 5G</strong> roaming included at no extra cost.</li>
    <li><strong>Daily & instant payouts</strong> next-day 1am by default, or instant 24/7.</li>
  </ul>
  <div style="margin-top: 30px; text-align:center;">
    <a href="{{calendlyUrl}}"
      style="background: #5170ff; color:#fff; padding: 14px 24px; border-radius:8px; text-decoration:none; display: inline-block; font-size:15px;">
      Book a Call
    </a>
    <p style="margin-top:10px; color: #666; font-size:13px;">
      Use the link above to book a call at a time that suits you.
    </p>
  </div>
</div>
`

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, customerName, analysePayload, terminalOption } = body

    if (!email || !analysePayload)
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    // 1. Pricing calculation
    const pricingInput: QuoteInputs = {
      monthTurnover: analysePayload.fields.monthTurnover,
      mix: analysePayload.fields.mix,
      currentFeesMonthly: analysePayload.fields.currentFeesMonthly,
      currentFixedMonthly: analysePayload.fields.currentFixedMonthly,
      terminalOption: terminalOption || 'none',
      terminalsCount: 1
    }

    const { cmqMonthly, cmqTxnFees, cmqAuthFees } = priceCMQ(pricingInput)

    const { monthlySaving, annualSaving, qualifiedRates } =
      analysePayload.quote

    const currentMonthly = analysePayload.fields.currentFeesMonthly ?? 0
    const currentTerminalFees = analysePayload.fields.currentFixedMonthly ?? 0
    const currentTxnFees = Math.max(0, currentMonthly - currentTerminalFees)
    const currentOtherFees = 0
    const calendlyUrl = process.env.NEXT_PUBLIC_CALENDLY_URL || ''

    // -----------------------------------------
    //  SAFE RATE FALLBACKS (THIS FIXES YOUR ERROR)
    // -----------------------------------------
    const safeRates = {
      simpleAllCardsRate: qualifiedRates?.simpleAllCardsRate ?? null,
      debitRate: qualifiedRates?.debitRate ?? null,
      creditRate: qualifiedRates?.creditRate ?? null,
      businessRate: qualifiedRates?.businessRate ?? null,
      internationalRate: qualifiedRates?.internationalRate ?? null,
      amexRate: qualifiedRates?.amexRate ?? null,
      authFee: qualifiedRates?.authFee ?? 0,
      headline:
        qualifiedRates?.headline ??
        'Based on your turnover, here are your CMQ rates:'
    }

    // -----------------------------------------
    // BUILD THE QUALIFIED RATES HTML
    // -----------------------------------------
    let ratesListHtml = ''

    if (safeRates.simpleAllCardsRate)
      ratesListHtml += `<li>All cards: <strong>${safeRates.simpleAllCardsRate}%</strong></li>`

    if (safeRates.debitRate)
      ratesListHtml += `<li>Debit cards: <strong>${safeRates.debitRate}%</strong></li>`

    if (safeRates.creditRate)
      ratesListHtml += `<li>Credit cards: <strong>${safeRates.creditRate}%</strong></li>`

    if (safeRates.businessRate)
      ratesListHtml += `<li>Business cards: <strong>${safeRates.businessRate}%</strong></li>`

    if (safeRates.internationalRate)
      ratesListHtml += `<li>International cards: <strong>${safeRates.internationalRate}%</strong></li>`

    if (safeRates.amexRate && !safeRates.simpleAllCardsRate)
      ratesListHtml += `<li>Amex: <strong>${safeRates.amexRate}%</strong></li>`

    ratesListHtml += `<li>Authorisation fee: <strong>£${safeRates.authFee.toFixed(
      3
    )} per transaction</strong></li>`
    ratesListHtml += `<li>PCI fees: <strong>£0</strong></li>`
    ratesListHtml += `<li>Minimum monthly fee: <strong>£0</strong></li>`
    ratesListHtml += `<li>Terminals: <strong>£20/month or £99 buy-out</strong></li>`

    const qualifiedRatesHtml = `
      <h3 style="margin-top: 30px;">Your qualified CardMachineQuote.com rates</h3>
      <p style="margin:6px 0; font-size: 14px; color:#333;">
        ${safeRates.headline}
      </p>
      <ul style="margin: 4px 0 14px 18px; padding:0; font-size:14px; color:#333;">
        ${ratesListHtml}
      </ul>
    `

    // -----------------------------------------
    // MERGE INTO EMAIL TEMPLATE
    // -----------------------------------------

    let htmlBody = emailTemplate
      .replace(/{{currentMonthly}}/g, currentMonthly.toFixed(2))
      .replace(/{{cmqMonthly}}/g, cmqMonthly.toFixed(2))
      .replace(/{{monthlySaving}}/g, monthlySaving.toFixed(2))
      .replace(/{{annualSaving}}/g, annualSaving.toFixed(2))
      .replace(/{{currentTxnFees}}/g, currentTxnFees.toFixed(2))
      .replace(/{{currentTerminalFees}}/g, currentTerminalFees.toFixed(2))
      .replace(/{{currentOtherFees}}/g, currentOtherFees.toFixed(2))
      .replace(/{{cmqTxnFees}}/g, cmqTxnFees.toFixed(2))
      .replace(/{{cmqAuthFees}}/g, cmqAuthFees.toFixed(2))
      .replace(/{{calendlyUrl}}/g, calendlyUrl)
      .replace(/{{qualifiedRatesHtml}}/g, qualifiedRatesHtml)

    // Send email
    await sendEmail({
      to: email,
      subject: 'Your CardMachineQuote.com savings quote',
      html: htmlBody
    })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || 'Unexpected error' },
      { status: 500 }
    )
  }
}
