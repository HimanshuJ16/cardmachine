import type { SavingsResult } from "@/app/api/analyse/route";

export function renderSavingsEmailHTML(data: SavingsResult): string {
  const {
    businessName,
    userEmail,
    providerName,
    parsingStatus,
    manualRequired,
    currentMonthlyCost,
    newMonthlyCost,
    monthlySaving,
    annualSaving,
    currentTransactionFees,
    currentTerminalFees,
    currentOtherFees,
    cmqTransactionFees,
    cmqAuthFees,
    cmqOtherFees,
    matchedDebitRate,
    matchedCreditRate,
    matchedOtherRate,
    terminalFee,
    authFee,
  } = data;

  return `
    <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size:14px; line-height:1.5; color:#333;">
      <h2>New CardMachineQuote.com Statement Upload</h2>
      <p>
        <strong>Business name:</strong> ${businessName || 'Not provided'}<br/>
        <strong>User email:</strong> ${userEmail || 'Not provided'}<br/>
        <strong>Provider (detected):</strong> ${providerName || 'Unknown'}<br/>
        <strong>Parsing status:</strong> ${parsingStatus.toUpperCase()}<br/>
        <strong>Manual quote required:</strong> ${manualRequired ? 'YES' : 'NO'}
      </p>

      <hr style="margin:16px 0; border:0; border-top:1px solid #eee;" />

      <h3>Estimated savings</h3>
      <p>
        <strong>Current monthly cost:</strong> £${currentMonthlyCost.toFixed(2)}<br/>
        <strong>New monthly cost with CardMachineQuote.com:</strong> £${newMonthlyCost.toFixed(2)}<br/>
        <strong>Monthly saving:</strong> £${monthlySaving.toFixed(2)}<br/>
        <strong>Annual saving:</strong> £${annualSaving.toFixed(2)}
      </p>

      <h3>Current provider fees</h3>
      <ul>
        <li>Transaction fees: £${currentTransactionFees.toFixed(2)}</li>
        <li>Terminal fees: £${currentTerminalFees.toFixed(2)}</li>
        <li>Other charges: £${currentOtherFees.toFixed(2)}</li>
        <li><strong>Total:</strong> £${currentMonthlyCost.toFixed(2)}</li>
      </ul>

      <h3>CardMachineQuote.com quote (based on standard tiers)</h3>
      <ul>
        <li>Transaction fees: £${cmqTransactionFees.toFixed(2)}</li>
        <li>Authorisation fees: £${cmqAuthFees.toFixed(2)}</li>
        <li>Other fees: £${cmqOtherFees.toFixed(2)}</li>
        <li>Qualified debit rate: ${matchedDebitRate.toFixed(2)}%</li>
        <li>Qualified credit rate: ${matchedCreditRate.toFixed(2)}%</li>
        <li>Other/International rate: ${matchedOtherRate.toFixed(2)}%</li>
        <li>Terminal fee (per month): £${terminalFee.toFixed(2)}</li>
        <li>Authorisation fee (per tx): £${authFee.toFixed(3)}</li>
        <li><strong>Total estimated monthly cost:</strong> £${newMonthlyCost.toFixed(2)}</li>
      </ul>

      <p style="margin-top:16px; font-size:12px; color: #666;">
        The customer's original statement is attached to this email.<br/>
        If manualRequired YES, please review the statement yourself, recalculate if needed,
        and email a manual quote to the customer.
      </p>
    </div>
  `;
}