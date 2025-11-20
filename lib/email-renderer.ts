import type { SavingsResult } from "@/app/api/analyse/route";

// --- Existing Savings Email Renderer ---
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

// --- New Order Form Renderer ---
export type OrderFormData = {
  // Step 1
  companyName: string;
  businessAddress: string;
  email: string;
  phone: string;
  companyType: string;
  
  // Step 2
  firstName: string;
  lastName: string;
  dobDay: string;
  dobMonth: string;
  dobYear: string;
  residentialAddress: string;
  
  // Step 3
  terminalChoice: string;
  turnoverBand: string;
};

export function renderOrderEmailHTML(data: OrderFormData): string {
  return `
    <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #5170ff;">New Card Terminal Order</h2>
      <p style="font-size: 16px;">A new order has been submitted via the website.</p>
      
      <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="margin-top: 0; border-bottom: 1px solid #ddd; padding-bottom: 10px;">1. Application Details</h3>
        <p><strong>Company Name:</strong> ${data.companyName}</p>
        <p><strong>Address:</strong> ${data.businessAddress}</p>
        <p><strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
        <p><strong>Phone:</strong> ${data.phone}</p>
        <p><strong>Company Type:</strong> ${data.companyType}</p>
      </div>

      <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="margin-top: 0; border-bottom: 1px solid #ddd; padding-bottom: 10px;">2. Owner Details</h3>
        <p><strong>Name:</strong> ${data.firstName} ${data.lastName}</p>
        <p><strong>Date of Birth:</strong> ${data.dobDay}/${data.dobMonth}/${data.dobYear}</p>
        <p><strong>Residential Address:</strong> ${data.residentialAddress}</p>
      </div>

      <div style="background: #eff6ff; padding: 15px; border-radius: 8px; border: 1px solid #bfdbfe;">
        <h3 style="margin-top: 0; border-bottom: 1px solid #93c5fd; padding-bottom: 10px; color: #1e3a8a;">3. Order Choice</h3>
        <p><strong>Terminal Option:</strong> ${data.terminalChoice}</p>
        <p><strong>Turnover Band / Rate:</strong> ${data.turnoverBand}</p>
      </div>
      
      <p style="font-size: 12px; color: #666; margin-top: 30px;">
        This email was sent automatically from CardMachineQuote.com order form.
      </p>
    </div>
  `;
}