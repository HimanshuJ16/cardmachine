import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'
// We no longer need priceCMQ as the calculations are passed in the payload
// import { priceCMQ, QuoteInputs } from '@/lib/pricing' 

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
    <p style="margin-top:10px; color: #666; font-size:13px;">
      Use the link belor to book a call at a time that suits you or sign up.
    </p>
    <a href="{{calendlyUrl}}"
      style="background: #5170ff; color:#fff; padding: 14px 24px; border-radius:8px; text-decoration:none; display: inline-block; font-size:15px;">
      Book a Call
    </a>
    <a href="https://cardmachinequote.com/order"
      style="background: #5170ff; color:#fff; padding: 14px 24px; border-radius:8px; text-decoration:none; display: inline-block; font-size:15px;">
      Sign Up
    </a>
  </div>
</div>
`

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, analysePayload } = body

    if (!email || !analysePayload) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    // 1. Extract Data from the new Payload Structure
    // The frontend passes the full JSON response from /api/analyse, which is { status: 'ok', result: SavingsResult }
    // We handle both the wrapper and direct object just in case
    const data = analysePayload.result || analysePayload

    // Check if we have valid data
    if (!data || typeof data.newMonthlyCost === 'undefined') {
      return NextResponse.json({ error: 'Invalid data format in payload' }, { status: 400 })
    }

    // 2. Map SavingsResult fields to Template Variables
    const currentMonthly = data.currentMonthlyCost || 0
    const currentTxnFees = data.currentTransactionFees || 0
    const currentTerminalFees = data.currentTerminalFees || 0
    const currentOtherFees = data.currentOtherFees || 0
    
    const cmqMonthly = data.newMonthlyCost || 0
    const cmqTxnFees = data.cmqTransactionFees || 0
    const cmqAuthFees = data.cmqAuthFees || 0
    
    const monthlySaving = data.monthlySaving || 0
    const annualSaving = data.annualSaving || 0

    const calendlyUrl = process.env.NEXT_PUBLIC_CALENDLY_URL || 'https://calendly.com'

    // 3. Build Qualified Rates HTML
    // Using the matched rates from the result object
    const debitRate = data.matchedDebitRate || 0
    const creditRate = data.matchedCreditRate || 0
    const otherRate = data.matchedOtherRate || 0
    const authFee = data.authFee || 0
    const terminalFee = data.terminalFee || 0

    let ratesListHtml = ''
    
    if (debitRate > 0) ratesListHtml += `<li>Debit cards: <strong>${debitRate.toFixed(2)}%</strong></li>`
    if (creditRate > 0) ratesListHtml += `<li>Credit cards: <strong>${creditRate.toFixed(2)}%</strong></li>`
    if (otherRate > 0) ratesListHtml += `<li>International/Comm: <strong>${otherRate.toFixed(2)}%</strong></li>`
    
    ratesListHtml += `<li>Authorisation fee: <strong>£${authFee.toFixed(3)} per transaction</strong></li>`
    ratesListHtml += `<li>PCI fees: <strong>£0</strong></li>`
    ratesListHtml += `<li>Minimum monthly fee: <strong>£0</strong></li>`
    ratesListHtml += `<li>Terminal fee: <strong>£${terminalFee.toFixed(2)}</strong></li>`

    const qualifiedRatesHtml = `
      <h3 style="margin-top: 30px;">Your qualified CardMachineQuote.com rates</h3>
      <p style="margin:6px 0; font-size: 14px; color:#333;">
        Based on your statement volume, you qualify for our standard tier:
      </p>
      <ul style="margin: 4px 0 14px 18px; padding:0; font-size:14px; color:#333;">
        ${ratesListHtml}
      </ul>
    `

    // 4. Merge into Email Template
    const htmlBody = emailTemplate
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

    // 5. Send email
    await sendEmail({
      to: email,
      subject: 'Your CardMachineQuote.com savings quote',
      html: htmlBody
    })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('Send quote error:', e)
    return NextResponse.json(
      { error: e?.message || 'Unexpected error' },
      { status: 500 }
    )
  }
}