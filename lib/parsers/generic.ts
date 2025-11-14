import Tesseract from 'tesseract.js';
import { extractText as unpdfExtractText, getDocumentProxy } from 'unpdf';

const money = (s: string) => {
  const m = s.replace(/[,£]/g, '').match(/(-?\d+(?:\.\d{1,2})?)/);
  return m ? parseFloat(m[1]) : null;
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

  const tx = parseInt(
    (text.match(/(transactions|tx\s*count)[^\d]{0,10}(\d{2,8})/i)?.[2] || '0'),
    10
  );

  let monthTurnover = 0;
  for (const r of [
    /(total\s+turnover|gross\s+sales|total\s+card\s+sales)[^£\d]{0,30}([£]?[\d,]+(?:\.\d{1,2})?)/i,
    /(processed\s+volume|total\s+volume)[^£\d]{0,30}([£]?[\d,]+(?:\.\d{1,2})?)/i,
  ]) {
    const m = text.match(r);
    if (m) {
      monthTurnover = money(m[2]) || 0;
      break;
    }
  }

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
  ];

  let fixed = 0;
  for (const lab of labels) {
    const m = new RegExp(
      `${lab}[^£\\n]{0,40}([£]?[\\d,]+(?:\\.\\d{1,2})?)`,
      'i'
    ).exec(text);
    if (m) fixed += money(m[1]) || 0;
  }

  const totalFees = text.match(
    /(total\s+fees|fees\s+total|grand\s+total)[^£\d]{0,20}([£]?[\d,]+(?:\.\d{1,2})?)/i
  );
  const currentFeesMonthly = totalFees ? money(totalFees[2]) : null;

  const amex = text.match(
    /(amex|american express)[^£\d]{0,20}([£]?[\d,]+(?:\.\d{1,2})?)/i
  );
  const amexTurnover = amex ? money(amex[2]) || 0 : 0;
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
