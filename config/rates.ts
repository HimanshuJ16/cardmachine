// config/rates.ts
export const RATES = {
  tiers: [
    // CHANGED: turnover_max from 15000 to 14999. 
    // This ensures anyone with exactly £15,000 or more falls into the BETTER second tier.
    { name: 'Under £15k', turnover_max: 14999, rates: { all_cards_pct: 0.79, amex_pct: 0.79, auth_fee: 0.025, debit_pct: 0, credit_pct: 0, intl_pct: 0 } },
    
    { name: '£15k–£30k', turnover_max: 30000, rates: { debit_pct: 0.35, credit_pct: 0.45, intl_pct: 1.65, business_pct: 1.65, amex_pct: 1.99, auth_fee: 0.025 } },
    
    { name: 'Over £30k', turnover_max: null, rates: { debit_pct: 0.25, credit_pct: 0.45, intl_pct: 1.65, business_pct: 1.65, amex_pct: 1.99, auth_fee: 0.025 } }
  ],
  fixed_fees: { pci: 0, mmf: 0, terminal_monthly: 20, terminal_buyout: 99 },
} as const;

export type RatesConfig = typeof RATES;