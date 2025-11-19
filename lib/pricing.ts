// lib/pricing.ts
import { RATES, RatesConfig } from '@/config/rates'

export type Mix = { debitTurnover:number; creditTurnover:number; businessTurnover:number; internationalTurnover:number; amexTurnover:number; txCount:number }
export type QuoteInputs = { monthTurnover:number; mix:Mix; currentFeesMonthly:number|null; currentFixedMonthly:number; terminalOption:'monthly'|'buyout'|'none'; terminalsCount:number }

export function pickTier(cfg:RatesConfig, monthTurnover:number){
  // Finds the first tier where the turnover fits. 
  // With the new config, 15000 <= 14999 is False, so it moves to Tier 2 (Correct).
  return cfg.tiers.find(t => t.turnover_max===null || monthTurnover <= (t.turnover_max ?? Infinity))! 
}

const pct = (p:number, a:number)=> (p/100)*a;

export function priceCMQ(inp:QuoteInputs, cfg:RatesConfig=RATES){
  const tierObj = pickTier(cfg, inp.monthTurnover);
  const tier: any = tierObj.rates; 
  const t = inp.mix;
  
  // Calculate Total Volume for flat rate application
  const totalVolume = t.debitTurnover + t.creditTurnover + t.businessTurnover + t.internationalTurnover + t.amexTurnover;
  
  // Check if Volume matches turnover (Sanity check)
  // If mix is significantly lower than monthTurnover, use monthTurnover base to prevent under-pricing
  const calculationBase = Math.max(totalVolume, inp.monthTurnover);

  let cmqTxnFees = 0;

  if (tier.all_cards_pct !== undefined) {
    // Flat Rate Tier (Tier 1)
    cmqTxnFees = pct(tier.all_cards_pct, calculationBase);
  } else {
    // Interchange++ / Blended Tier (Tier 2+)
    // Use the specific mix bucket, or fallback if mix is empty but turnover exists
    cmqTxnFees = 
      pct(tier.debit_pct, t.debitTurnover) + 
      pct(tier.credit_pct, t.creditTurnover) + 
      pct(tier.business_pct, t.businessTurnover) + 
      pct(tier.intl_pct, t.internationalTurnover) + 
      pct(tier.amex_pct, t.amexTurnover);
      
    // Safety: If the mix sum is 0 but we have turnover, apply a standard split to avoid £0 fees
    if (cmqTxnFees === 0 && inp.monthTurnover > 0) {
        const assumedDebit = inp.monthTurnover * 0.8;
        const assumedCredit = inp.monthTurnover * 0.2;
        cmqTxnFees = pct(tier.debit_pct, assumedDebit) + pct(tier.credit_pct, assumedCredit);
    }
  }
  
  const cmqAuthFees = t.txCount * tier.auth_fee;
  const terminal = inp.terminalOption==='monthly'? RATES.fixed_fees.terminal_monthly*inp.terminalsCount : 0;
  const oneOff   = inp.terminalOption==='buyout' ? RATES.fixed_fees.terminal_buyout*inp.terminalsCount : 0;
  const fixed = RATES.fixed_fees.pci + RATES.fixed_fees.mmf + terminal;
  const cmqMonthly = cmqTxnFees + cmqAuthFees + fixed;

  console.log(`--- PRICING (${tierObj.name}) ---`);
  console.log(`Turnover: £${inp.monthTurnover}`);
  console.log(`TxFees: £${cmqTxnFees.toFixed(2)} | AuthFees: £${cmqAuthFees.toFixed(2)} | Fixed: £${fixed.toFixed(2)}`);
  console.log(`Total CMQ: £${cmqMonthly.toFixed(2)}`);
  console.log("---------------------------");

  return { cmqMonthly, oneOff, cmqTxnFees, cmqAuthFees };
}

export function computeSavings(inp:QuoteInputs, cfg:RatesConfig=RATES){
  const {cmqMonthly, oneOff, cmqTxnFees, cmqAuthFees}=priceCMQ(inp, cfg); const current = inp.currentFeesMonthly ?? inp.currentFixedMonthly;
  const monthlySaving = current!=null ? (current - cmqMonthly) : null;
  const annualSaving = monthlySaving!=null ? monthlySaving*12 : null;
  return { cmqMonthly, oneOff, monthlySaving, annualSaving, cmqTxnFees, cmqAuthFees };
}