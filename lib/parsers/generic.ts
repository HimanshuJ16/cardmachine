import Tesseract from 'tesseract.js';
import { extractText as unpdfExtractText, getDocumentProxy } from 'unpdf';

const money = (s: string) => {
  const m = s.replace(/[,£]/g, '').match(/(-?\d+(?:\.\d{1,2})?)/);
  return m ? parseFloat(m[1]) : 0; // Default to 0 instead of null
};

const isPDF = (b: Uint8Array) =>
  b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46;

async function pdfTextFromBytes(bytes: Uint8Array): Promise<string> {
  const pdf = await getDocumentProxy(bytes);          // load PDF[web:29]
  const { text } = await unpdfExtractText(pdf, {
    mergePages: true,                                 // single big string[web:29]
  });
  return text;
}

export async function extractGeneric(file: Blob) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  let text = '';

  if (isPDF(bytes)) {
    // use unpdf instead of pdf-parse
    text = await pdfTextFromBytes(bytes);
  } else {
    const {
      data: { text: t },
    } = await Tesseract.recognize(Buffer.from(bytes), 'eng');
    text = t;
  }

  // --- START MODIFICATION ---

  let tx = 0;
  let monthTurnover = 0;

  // Strategy 1: Find the Dojo summary line which has both values
  // This regex matches: "Subtotal" OR "Total" ... "8169" ... "£190,828.37"
  const dojoSummaryRegex = /(Subtotal|Total)\s*(\d{2,8})\s*([£]?[\d,]+\.\d{2})/i;
  const dojoMatch = text.match(dojoSummaryRegex);

  if (dojoMatch && dojoMatch[2] && dojoMatch[3]) {
    tx = parseInt(dojoMatch[2].replace(/,/g, ''), 10) || 0;
    monthTurnover = money(dojoMatch[3]);
  } else {
    // Strategy 2: If Strategy 1 failed, try other regexes
    for (const r of [
      /(transactions|tx\s*count)[^\d]{0,10}(\d{2,8})/i,
      /(Number\s+of\s+transactions)[\s",]+(\d{2,8})/i
    ]) {
      const m = text.match(r);
      if (m && m[2]) {
        tx = parseInt(m[2].replace(/,/g, ''), 10);
        if (tx > 0) break;
      }
    }

    for (const r of [
      /(total\s+value\s+of\s+transactions)[^£\d]{0,30}([£]?[\d,]+(?:\.\d{1,2})?)/i, // Per instructions
      /(total\s+turnover|gross\s+sales|total\s+card\s+sales)[^£\d]{0,30}([£]?[\d,]+(?:\.\d{1,2})?)/i,
      /(processed\s+volume|total\s+volume)[^£\d]{0,30}([£]?[\d,]+(?:\.\d{1,2})?)/i,
    ]) {
      const m = text.match(r);
      if (m) {
        monthTurnover = money(m[2]);
        if (monthTurnover > 0) break;
      }
    }
  }
  
  // Updated labels to include fees from both Dojo PDFs
  const labels = [
    'terminal',
    'pci',
    'security',
    'mmf',
    'minimum monthly',
    'monthly service',
    'gateway',
    'statement fee',
    'chargeback',
    'services for dojo go',   // From first Dojo PDF
    'Dojo Go',                // From new "Prosecco House" PDF
    'Hardware care',          // From new "Prosecco House" PDF
    'Platform',               // From new "Prosecco House" PDF
    'Card machine & account services' // Header from new PDF
  ];
  // --- END MODIFICATION ---

  let fixed = 0;
  for (const lab of labels) {
    // This regex is intentionally broad to catch values after the label
    const m = new RegExp(
      `${lab}[^£\\n]{0,40}([£]?[\\d,]+(?:\\.\\d{1,2})?)`,
      'i'
    ).exec(text);
    if (m) fixed += money(m[1]); 
  }

  // --- START MODIFICATION ---
  // Added "Net amount" regex from Prosecco PDF [cite: 235]
  const totalFeesMatch = text.match(
    /(Net\s+amount)[^£\d]{0,20}([£]?[\d,]+(?:\.\d{1,2})?)/i
  ) || text.match(
    /(total\s+fees|fees\s+total|grand\s+total)[^£\d]{0,20}([£]?[\d,]+(?:\.\d{1,2})?)/i
  );
  // --- END MODIFICATION ---
  const currentFeesMonthly = totalFeesMatch ? money(totalFeesMatch[2]) : null;

  const amex = text.match(
    /(amex|american express)[^£\d]{0,20}([£]?[\d,]+(?:\.\d{1,2})?)/i
  );
  const amexTurnover = amex ? money(amex[2]) : 0;
  const other = Math.max(0, monthTurnover - amexTurnover);

  const mix = {
    debitTurnover: other * 0.5,
    creditTurnover: other * 0.5,
    businessTurnover: 0,
    internationalTurnover: 0,
    amexTurnover,
    txCount: tx,
  };

  const present = [
    monthTurnover > 0,
    tx > 0,
    fixed > 0,
    currentFeesMonthly != null,
  ].filter(Boolean).length;

  // Calculate confidence. If we found all 4 key values, confidence will be 1.
  const confidence = Math.min(1, present / 4);

  return {
    providerGuess: null,
    confidence,
    monthTurnover,
    mix,
    currentFeesMonthly,
    currentFixedMonthly: fixed,
  };
}