// pdfText.ts
import { extractText, getDocumentProxy } from 'unpdf';

export async function extractPdfTextFromBytes(bytes: Uint8Array): Promise<string> {
  // Load PDF document
  const pdf = await getDocumentProxy(bytes); // accepts Uint8Array[web:29]

  // Extract text; mergePages=true gives single concatenated string
  const { text } = await extractText(pdf, { mergePages: true });

  return text;
}
