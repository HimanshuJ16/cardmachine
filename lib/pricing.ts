import { RATES, RatesConfig } from '@/config/rates'

export type Mix = { debitTurnover:number; creditTurnover:number; businessTurnover:number; internationalTurnover:number; amexTurnover:number; txCount:number }
export type QuoteInputs = { monthTurnover:number; mix:Mix; currentFeesMonthly:number|null; currentFixedMonthly:number; terminalOption:'monthly'|'buyout'|'none'; terminalsCount:number }

export function pickTier(cfg:RatesConfig, monthTurnover:number){ return cfg.tiers.find(t => t.turnover_max===null || monthTurnover <= (t.turnover_max ?? Infinity))! }
const pct = (p:number, a:number)=> (p/100)*a;

export function priceCMQ(inp:QuoteInputs, cfg:RatesConfig=RATES){
  const tier:any = pickTier(cfg, inp.monthTurnover).rates; const t=inp.mix;
  
  const cmqTxnFees = tier.all_cards_pct!==undefined
    ? pct(tier.all_cards_pct, t.debitTurnover+t.creditTurnover+t.businessTurnover+t.internationalTurnover+t.amexTurnover)
    : pct(tier.debit_pct, t.debitTurnover)+pct(tier.credit_pct, t.creditTurnover)+pct(tier.business_pct, t.businessTurnover)+pct(tier.intl_pct, t.internationalTurnover)+pct(tier.amex_pct, t.amexTurnover);
  
  const cmqAuthFees = t.txCount * tier.auth_fee;
  const terminal = inp.terminalOption==='monthly'? RATES.fixed_fees.terminal_monthly*inp.terminalsCount : 0;
  const oneOff   = inp.terminalOption==='buyout' ? RATES.fixed_fees.terminal_buyout*inp.terminalsCount : 0;
  const fixed = RATES.fixed_fees.pci + RATES.fixed_fees.mmf + terminal;
  const cmqMonthly = cmqTxnFees + cmqAuthFees + fixed;

  // --- START MODIFICATION ---
  // Added logging per debug instructions 
  console.log("--- PRICING CALCULATION ---");
  console.log("turnover:", inp.monthTurnover);
  console.log("txCount:", t.txCount);
  console.log("mscCost (variable):", cmqTxnFees);
  console.log("authCost (perTx):", cmqAuthFees);
  console.log("fixedCost (pci/mmf/terminal):", fixed);
  console.log("final cmqMonthly:", cmqMonthly);
  console.log("---------------------------");
  // --- END MODIFICATION ---

  return { cmqMonthly, oneOff, cmqTxnFees, cmqAuthFees };
}

export function computeSavings(inp:QuoteInputs, cfg:RatesConfig=RATES){
  const {cmqMonthly, oneOff, cmqTxnFees, cmqAuthFees}=priceCMQ(inp, cfg); const current = inp.currentFeesMonthly ?? inp.currentFixedMonthly;
  const monthlySaving = current!=null ? (current - cmqMonthly) : null;
  const annualSaving = monthlySaving!=null ? monthlySaving*12 : null;
  return { cmqMonthly, oneOff, monthlySaving, annualSaving, cmqTxnFees, cmqAuthFees };
}