import { extractGeneric } from '@/lib/parsers/generic'
// import { extractDojo } from '@/lib/parsers/dojo'
// import { extractElavon } from '@/lib/parsers/elavon'
// import { extractDNA } from '@/lib/parsers/dna'
import { openaiExtractFromFile } from '@/lib/ai-openai'

export type ExtractedFields = {
  providerGuess:string|null; confidence:number;
  monthTurnover:number; mix:{debitTurnover:number;creditTurnover:number;businessTurnover:number;internationalTurnover:number;amexTurnover:number;txCount:number};
  currentFeesMonthly:number|null; currentFixedMonthly:number;
}

export async function extractFromFile(file:Blob):Promise<ExtractedFields>{
  // Try specific providers first (add when available)
  // for(const p of [extractDojo, extractElavon, extractDNA]){ try{ const out:any=await (p as any)(file); if(out && out.confidence>=0.8) return out }catch{} }
  const generic = await extractGeneric(file)
  if(process.env.AI_PROVIDER==='openai' && generic.confidence < 0.5){
    try {
      const ai = await openaiExtractFromFile(file) as any
      return { providerGuess: ai.providerGuess, confidence: 0.85, monthTurnover: ai.monthTurnover, mix: ai.mix, currentFeesMonthly: ai.currentFeesMonthly, currentFixedMonthly: ai.currentFixedMonthly }
    } catch(e){ console.warn('AI fallback failed', e); }
  }
  return generic as any
}
