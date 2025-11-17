/**
 * Defines the shared data structure for savings results.
 * This is used for both the API response and the email template.
 * Based on CardMachineQuote_Email_Savings_DevSpec.pdf.
 */
export interface SavingsResult {
  // Identification
  businessName?: string;
  userEmail?: string; // email the user typed on the site (optional at upload time)
  providerName?: string; // e.g. Dojo, Teya, Elavon (if detected)

  // Core savings numbers (per month)
  currentMonthlyCost: number; // e.g. 369.16
  newMonthlyCost: number; // e.g. 69.55
  monthlySaving: number; // currentMonthlyCost - newMonthlyCost
  annualSaving: number; // monthlySaving * 12

  // Breakdown - current provider
  currentTransactionFees: number;
  currentTerminalFees: number;
  currentOtherFees: number;

  // Breakdown - CardMachineQuote.com quote
  cmqTransactionFees: number;
  cmqAuthFees: number;
  cmqOtherFees: number; // Includes terminal fee

  // Qualified rate tier
  matchedDebitRate: number; // e.g. 0.35 (percent)
  matchedCreditRate: number; // e.g. 0.45
  matchedOtherRate: number; // e.g. 1.65
  terminalFee: number; // e.g. 20 (per month)
  authFee: number; // e.g. 0.025 (per transaction)

  // Meta
  parsingStatus: 'success' | 'failed';
  manualRequired: boolean; // true when parsingStatus == 'failed' or sanity check fails
}