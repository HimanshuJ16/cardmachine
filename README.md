# CardMachineQuote.com — Savings Checker (Dev Pack)

This bundle contains the starter code and config to deploy the Savings Checker with CardMachineQuote.com branding.

## Stack
- Next.js (App Router)
- Tailwind
- pdf-parse + Tesseract
- Optional OpenAI fallback for low-confidence parsing

## Env
```
OPENAI_API_KEY=
AI_PROVIDER=openai
AI_MODEL=gpt-4o-mini
AI_TIMEOUT_MS=240000
NEXT_PUBLIC_CALENDLY_URL=
```

## Quickstart
1. `npm i` (install usual Next + Tailwind deps)
2. Copy this folder into your Next project or use it as a new one.
3. Run `npm run dev` and test the upload flow.


## Email & PDF
This pack includes:
- `lib/pdf.ts` — builds a one‑page CMQ PDF using **pdfkit**
- `lib/email.ts` — sends the PDF via **nodemailer**

### Env (add to .env.local)
```
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM="CardMachineQuote.com <quotes@cardmachinequote.com>"
NEXT_PUBLIC_CALENDLY_URL=
OPENAI_API_KEY=
AI_PROVIDER=openai
AI_MODEL=gpt-4o-mini
AI_TIMEOUT_MS=240000
```

### Install
```
npm i pdfkit nodemailer
```
