import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'
import { priceCMQ, QuoteInputs } from '@/lib/pricing'

export const runtime = 'nodejs'

// --- START MODIFICATION ---
// Added {{qualifiedRatesHtml}} placeholder below the cost breakdown
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
// --- END MODIFICATION ---

export async function POST(req: NextRequest){
  try {
    const body = await req.json()
    const { email, customerName, analysePayload, terminalOption } = body
    if(!email || !analysePayload) return NextResponse.json({error:'Missing fields'},{status:400})

    // 1. Re-run pricing to get fee breakdown
    const pricingInput: QuoteInputs = { 
      monthTurnover: analysePayload.fields.monthTurnover, 
      mix: analysePayload.fields.mix, 
      currentFeesMonthly: analysePayload.fields.currentFeesMonthly, 
      currentFixedMonthly: analysePayload.fields.currentFixedMonthly, 
      terminalOption: terminalOption || 'none', 
      terminalsCount: 1 // Assuming 1 terminal, as count is not passed here
    }
    const { cmqMonthly, cmqTxnFees, cmqAuthFees } = priceCMQ(pricingInput)
    
    // 2. Get other values for template
    const { monthlySaving, annualSaving, qualifiedRates } = analysePayload.quote; // Get new rates object
    const currentMonthly = analysePayload.fields.currentFeesMonthly ?? 0;
    const currentTerminalFees = analysePayload.fields.currentFixedMonthly ?? 0;
    const currentTxnFees = Math.max(0, currentMonthly - currentTerminalFees);
    const currentOtherFees = 0; // Assumption
    const calendlyUrl = process.env.NEXT_PUBLIC_CALENDLY_URL || '';

    // --- START MODIFICATION ---
    // 3. Build Qualified Rates HTML from spec [cite: 202-227]
    let ratesListHtml = '';
    if (qualifiedRates.simpleAllCardsRate) {
      ratesListHtml += `<li>All cards: <strong>${qualifiedRates.simpleAllCardsRate}%</strong></li>`;
    }
    if (qualifiedRates.debitRate) {
      ratesListHtml += `<li>Debit cards: <strong>${qualifiedRates.debitRate}%</strong></li>`;
    }
    if (qualifiedRates.creditRate) {
      ratesListHtml += `<li>Credit cards: <strong>${qualifiedRates.creditRate}%</strong></li>`;
    }
    if (qualifiedRates.businessRate) {
      ratesListHtml += `<li>Business / corporate cards: <strong>${qualifiedRates.businessRate}%</strong></li>`;
    }
    if (qualifiedRates.internationalRate) {
      ratesListHtml += `<li>International cards: <strong>${qualifiedRates.internationalRate}%</strong></li>`;
    }
    if (qualifiedRates.amexRate && !qualifiedRates.simpleAllCardsRate) {
      ratesListHtml += `<li>Amex: <strong>${qualifiedRates.amexRate}%</strong></li>`;
    }
    
    ratesListHtml += `<li>Authorisation fee: <strong>£${qualifiedRates.authFee.toFixed(3)} per transaction</strong></li>`;
    ratesListHtml += `<li>PCI fees: <strong>£0</strong></li>`;
    ratesListHtml += `<li>Minimum monthly fee: <strong>£0</strong></li>`;
    ratesListHtml += `<li>Terminals: <strong>£20/month (12-month contract) or £99 buy-out</strong></li>`;

    const qualifiedRatesHtml = `
    <h3 style="margin-top: 30px;">Your qualified CardMachineQuote.com rates</h3>
    <p style="margin:6px 0; font-size: 14px; color:#333;">
      ${qualifiedRates.headline}
    </p>
    <ul style="margin: 4px 0 14px 18px; padding:0; font-size:14px; color:#333;">
      ${ratesListHtml}
    </ul>
    `;
    // --- END MODIFICATION ---


    // 4. Populate HTML template
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
      // --- START MODIFICATION ---
      .replace(/{{qualifiedRatesHtml}}/g, qualifiedRatesHtml); // Inject new HTML block
      // --- END MODIFICATION ---

    // 5. Send the HTML email
    await sendEmail({
      to: email,
      subject: 'Your CardMachineQuote.com savings quote',
      html: htmlBody
    })

    return NextResponse.json({ ok:true })
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 })
  }
}