import PDFDocument from 'pdfkit'

type QuotePDFOpts = {
  merchantName: string
  monthTurnover: number
  txCount: number
  tierName: string
  eventusMonthly: number // reusing name for compatibility
  monthlySaving: number | null
  annualSaving: number | null
  terminalOption: 'none' | 'monthly' | 'buyout'
  oneOff: number
}

export async function buildQuotePDF(opts: QuotePDFOpts): Promise<Buffer> {
  return await new Promise((resolve) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 })
    const chunks: Buffer[] = []
    doc.on('data', (c) => chunks.push(c as Buffer))
    doc.on('end', () => resolve(Buffer.concat(chunks)))

    const blue = '#5170ff'
    doc.fillColor('#000000').fontSize(18).text('CardMachineQuote.com', { continued: false })
    doc.moveDown(0.5)
    doc.fontSize(22).fillColor('#000000').text('Your Savings Estimate', { underline: false })
    doc.moveDown(0.25)
    doc.fontSize(10).fillColor('#666').text('This estimate is based on the data extracted from your uploaded statement and our standard rates. Subject to verification.')

    doc.moveDown(1)

    // Merchant summary
    doc.fontSize(12).fillColor('#000')
    doc.text(`Merchant: ${opts.merchantName}`)
    doc.text(`Monthly Turnover: £${(opts.monthTurnover || 0).toLocaleString(undefined,{minimumFractionDigits:2, maximumFractionDigits:2})}`)
    doc.text(`Transactions: ${opts.txCount}`)
    doc.text(`Package: ${opts.tierName}`)

    doc.moveDown(0.8)
    doc.rect(50, doc.y, 495, 1).fill('#e5e7eb').fillColor('#000')
    doc.moveDown(0.8)

    // Savings table
    const cmqMonthly = opts.eventusMonthly || 0
    const monthlySaving = opts.monthlySaving ?? 0
    const annualSaving = opts.annualSaving ?? (monthlySaving ? monthlySaving * 12 : 0)

    doc.fontSize(14).text('Estimated Costs', { continued: false })
    doc.moveDown(0.5)
    doc.fontSize(12)
    doc.fillColor('#000').text(`CardMachineQuote.com monthly: £${cmqMonthly.toFixed(2)}`)
    doc.fillColor('#000').text(`Monthly saving: £${monthlySaving.toFixed(2)}`)
    doc.fillColor('#000').text(`Annual saving: £${annualSaving.toFixed(2)}`)

    if (opts.terminalOption !== 'none') {
      doc.moveDown(0.5)
      doc.fillColor('#000').text(`Terminal option: ${opts.terminalOption} (${opts.terminalOption === 'buyout' ? 'one-off' : 'monthly'})`)
      if (opts.oneOff) doc.text(`One-off: £${opts.oneOff.toFixed(2)}`)
    }

    doc.moveDown(1)
    doc.fillColor(blue).fontSize(12).text('Book a free 10‑minute call to confirm your quote →', { continued: true })
    doc.fillColor('#0000EE').text(' Calendly link', { link: process.env.NEXT_PUBLIC_CALENDLY_URL || undefined, underline: true })

    doc.moveDown(1.2)
    doc.fontSize(9).fillColor('#888').text('© CardMachineQuote.com  •  This estimate is indicative and may change following a full review of your statement and card mix.', { align: 'left' })

    doc.end()
  })
}
