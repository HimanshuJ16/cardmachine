import nodemailer from 'nodemailer'

// --- START MODIFICATION ---
type SendArgs = {
  to: string
  subject: string
  html: string
}

export async function sendEmail(args: SendArgs) {
// --- END MODIFICATION ---
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

  // --- START MODIFICATION ---
  // Updated to send HTML email
  await transporter.sendMail({
    from: SMTP_FROM || `CardMachineQuote.com <${SMTP_USER}>`,
    to: args.to,
    subject: args.subject,
    html: args.html,
  })
  // --- END MODIFICATION ---
}