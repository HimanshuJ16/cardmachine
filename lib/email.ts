import nodemailer from 'nodemailer'

type SendArgs = {
  to: string
  subject: string
  html: string
  // Added attachments support
  attachments?: {
    filename: string
    content: Buffer | string
  }[]
}

export async function sendEmail(args: SendArgs) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    throw new Error('SMTP credentials missing: set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and optional SMTP_FROM')
  } 

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  })

  await transporter.sendMail({
    from: SMTP_FROM || `CardMachineQuote.com <${SMTP_USER}>`,
    to: args.to,
    subject: args.subject,
    html: args.html,
    attachments: args.attachments, // Pass attachments to nodemailer
  })
}