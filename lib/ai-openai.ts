import { AiExtractSchema, AiExtract } from './ai'

export async function openaiExtractFromFile(file: Blob): Promise<AiExtract> {
  if(!process.env.OPENAI_API_KEY) throw new Error('Missing OPENAI_API_KEY')
  const bytes = Buffer.from(await file.arrayBuffer())

  const system = `You extract structured finance data from UK merchant services statements. Return ONLY valid JSON.`
  const user = `Extract monthly turnover, transaction count, current total monthly fees (if present), sum of fixed monthly fees, providerGuess, and card mix (debit, credit, business, international, amex). JSON only.`

  const res = await fetch('https://api.openai.com/v1/responses', {
    method:'POST', headers:{ 'Authorization':`Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type':'application/json' },
    body: JSON.stringify({
      model: process.env.AI_MODEL || 'gpt-4o-mini',
      input: [
        { role: 'system', content: system },
        { role: 'user', content: [
          { type: 'input_text', text: user },
          { type: 'input_image', image_url: null, mime_type: 'application/pdf', data: bytes.toString('base64') }
        ]}
      ],
      response_format: { type:'json_schema', json_schema: {
        name: 'MerchantExtraction',
        schema: {
          type: 'object',
          properties: {
            providerGuess: { type: ['string','null'] },
            monthTurnover: { type:'number', minimum:0 },
            mix: { type:'object', properties: {
              debitTurnover:{type:'number',minimum:0}, creditTurnover:{type:'number',minimum:0},
              businessTurnover:{type:'number',minimum:0}, internationalTurnover:{type:'number',minimum:0},
              amexTurnover:{type:'number',minimum:0}, txCount:{type:'integer',minimum:0}
            }, required:['debitTurnover','creditTurnover','businessTurnover','internationalTurnover','amexTurnover','txCount'] },
            currentFeesMonthly: { type:['number','null'] },
            currentFixedMonthly: { type:'number', minimum:0 }
          },
          required: ['monthTurnover','mix','currentFeesMonthly','currentFixedMonthly']
        }
      }}
    }),
    signal: AbortSignal.timeout(parseInt(process.env.AI_TIMEOUT_MS || '240000'))
  })
  console.log(res);
  if(!res.ok) throw new Error(`OpenAI error ${res.status}`)
  const body = await res.json()
  const text = (typeof body === 'object' && body !== null && 'output_text' in body) ? (body as any).output_text : null
  const raw = text ?? body
  return AiExtractSchema.parse(typeof raw === 'string' ? JSON.parse(raw) : raw)
}
