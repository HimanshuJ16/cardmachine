import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json({ error: "Invalid Content-Type" }, { status: 400 });
    }

    const form = await req.formData();
    const file = form.get("file") as File;
    const email = form.get("email") as string;
    const businessName = form.get("businessName") as string;

    if (!file || !email) {
      return NextResponse.json({ error: "Missing file or email" }, { status: 400 });
    }

    // Read file buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Send to Admin
    await sendEmail({
      to: "quotes@cardmachinequote.com",
      // to: 'himanshujangir16@gmail.com',
      subject: `ACTION REQUIRED: Manual Review Request`,
      html: `
        <h2>Manual Quote Request</h2>
        <p>The user attempted to analyse this file but it failed validation (likely not a standard statement).</p>
        <ul>
          <li><strong>User Email:</strong> ${email}</li>
          <li><strong>Business Name:</strong> ${businessName || "Not provided"}</li>
          <li><strong>File Name:</strong> ${file.name}</li>
        </ul>
        <p>Please review the attachment and contact the user manually.</p>
      `,
      attachments: [{ filename: file.name, content: buffer }]
    });

    return NextResponse.json({ status: "ok" });

  } catch (err: any) {
    console.error("Manual Review Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}