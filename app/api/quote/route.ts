import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      firstName, 
      lastName, 
      businessName, 
      email, 
      phone, 
      turnover, 
      transaction 
    } = body

    // Basic validation
    if (!email || !firstName || !phone || !turnover || !transaction || !businessName || !lastName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Construct a clean HTML email for the admin
    const htmlBody = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Quote Request</h2>
        <p>You have received a new lead from the website quote form.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <tr style="background-color: #f8fafc;">
            <td style="padding: 12px; border: 1px solid #e2e8f0; font-weight: bold; width: 40%;">Name</td>
            <td style="padding: 12px; border: 1px solid #e2e8f0;">${firstName} ${lastName}</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #e2e8f0; font-weight: bold;">Business Name</td>
            <td style="padding: 12px; border: 1px solid #e2e8f0;">${businessName}</td>
          </tr>
          <tr style="background-color: #f8fafc;">
            <td style="padding: 12px; border: 1px solid #e2e8f0; font-weight: bold;">Email</td>
            <td style="padding: 12px; border: 1px solid #e2e8f0;">
              <a href="mailto:${email}" style="color: #2563eb;">${email}</a>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #e2e8f0; font-weight: bold;">Phone</td>
            <td style="padding: 12px; border: 1px solid #e2e8f0;">
              <a href="tel:${phone}" style="color: #2563eb;">${phone}</a>
            </td>
          </tr>
          <tr style="background-color: #f8fafc;">
            <td style="padding: 12px; border: 1px solid #e2e8f0; font-weight: bold;">Monthly Turnover</td>
            <td style="padding: 12px; border: 1px solid #e2e8f0;">${turnover}</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #e2e8f0; font-weight: bold;">Avg Transaction</td>
            <td style="padding: 12px; border: 1px solid #e2e8f0;">${transaction}</td>
          </tr>
        </table>

        <p style="margin-top: 30px; font-size: 14px; color: #64748b;">
          Sent from CardMachineQuote.com Lead Form
        </p>
      </div>
    `

    // Send the email
    await sendEmail({
      to: 'les@cardmachinequote.com',
      // to: 'himanshujangir16@gmail.com',
      subject: `New Lead: ${businessName || firstName}`,
      html: htmlBody,
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Quote submission error:', error)
    return NextResponse.json(
      { error: 'Failed to process quote request' },
      { status: 500 }
    )
  }
}