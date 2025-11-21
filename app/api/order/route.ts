import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { renderOrderEmailHTML, OrderFormData } from "@/lib/email-renderer";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Basic validation to ensure required fields exist
    if (!body.email || !body.companyName || !body.firstName) {
      return NextResponse.json({ status: 'error', message: "Missing required fields" }, { status: 400 });
    }

    const formData: OrderFormData = {
      companyName: body.companyName || '',
      businessAddress: body.businessAddress || '',
      businessPostalCode: body.businessPostalCode || '', // NEW FIELD
      email: body.email || '',
      phone: body.phone || '',
      companyType: body.companyType || '',
      firstName: body.firstName || '',
      lastName: body.lastName || '',
      dobDay: body.dobDay || '',
      dobMonth: body.dobMonth || '',
      dobYear: body.dobYear || '',
      residentialAddress: body.residentialAddress || '',
      residentialPostalCode: body.residentialPostalCode || '', // NEW FIELD
      terminalChoice: body.terminalChoice || '',
      turnoverBand: body.turnoverBand || '',
    };

    // Generate HTML
    const emailHtml = renderOrderEmailHTML(formData);

    // Send Email
    await sendEmail({
      to: 'les@cardmachinequote.com',
      // to: 'himanshujangir16@gmail.com', // As requested in previous turns (or quotes@cardmachinequote.com)
      subject: `New Order: ${formData.companyName} (${formData.firstName} ${formData.lastName})`,
      html: emailHtml,
    });

    return NextResponse.json({ status: 'ok' });
  } catch (error: any) {
    console.error("Order submission failed:", error);
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}