import { AiExtractSchema, AiExtract } from './ai'
import { extractPdfTextFromBytes } from '@/lib/parsers/pdfText'

export async function openaiExtractFromFile(file: Blob): Promise<AiExtract> {
  if (!process.env.OPENAI_API_KEY) throw new Error('Missing OPENAI_API_KEY')
  
  const bytes = Buffer.from(await file.arrayBuffer())
  const mimeType = file.type || 'application/pdf';
  
  // --- START MODIFICATION ---
  // Check if the file is a PDF
  const isPdfFile = mimeType === 'application/pdf';

  const system = `You extract structured finance data from UK merchant services statements. Return ONLY valid JSON.`
  
  // --- START MODIFICATION ---
  // Added explicit fallback rules for the 'mix' object
  const user = `Extract the following fields from the merchant statement. You MUST find the grand total for each.
- Total turnover (total value of all transactions). Note: If you see a table "Card transaction rates" with a "Total value of transactions", that value IS the total turnover.
- Total transaction count
- Total amount charged in fees by the provider (this is the total 'Net amount' or 'Total due' before VAT)
- providerGuess
- sum of fixed monthly fees
- card mix (debit, credit, business, international, amex turnovers and total txCount).
- **MIX FALLBACK RULE:** If you cannot find a detailed card mix, find the 'amexTurnover' (if any), subtract it from 'monthTurnover' to get 'otherTurnover', then set 'debitTurnover' = 'otherTurnover' * 0.5 and 'creditTurnover' = 'otherTurnover' * 0.5. Set 'businessTurnover' and 'internationalTurnover' to 0.

Return ONLY valid JSON.`
  // --- END MODIFICATION ---

  let requestBody: any;

  if (isPdfFile) {
    // PDF: Extract text and send text-only request
    console.log("File is PDF, extracting text for AI...");
    const extractedText = await extractPdfTextFromBytes(bytes);
    
    requestBody = {
      model: process.env.AI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: system },
        {
          role: 'user',
          content: [
            { type: 'text', text: "Here is the text extracted from the PDF:\n\n" + extractedText },
            { type: 'text', text: user }
          ]
        }
      ],
      response_format: { type: 'json_object' }
    };

  } else {
    // IMAGE: Send image data URL request
    console.log("File is Image, sending base64 data for AI...");
    const base64data = bytes.toString('base64');
    requestBody = {
      model: process.env.AI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: system },
        {
          role: 'user',
          content: [
            { type: 'text', text: user },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64data}`
              }
            }
          ]
        }
      ],
      response_format: { type: 'json_object' }
    };
  }

  // ... (rest of the file remains the same) ...
  
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody), 
    signal: AbortSignal.timeout(parseInt(process.env.AI_TIMEOUT_MS || '240000'))
  })

  if (!res.ok) {
    const errorBody = await res.text();
    console.error("OpenAI API Error Body:", errorBody);
    throw new Error(`OpenAI error ${res.status}`)
  }

  const body = await res.json()

  const text = body.choices[0].message.content;
  const raw = text; 
  
  return AiExtractSchema.parse(typeof raw === 'string' ? JSON.parse(raw) : raw)
}