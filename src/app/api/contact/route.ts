import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const { name, email, message } = await req.json();

    const GMAIL_USER = 'myabacuspro@gmail.com';
    const GMAIL_PASS = process.env.GMAIL_APP_PASSWORD;

    // Critical configuration check
    if (!GMAIL_PASS) {
      console.error("CRITICAL: GMAIL_APP_PASSWORD is not present in the environment.");
      return NextResponse.json({ 
        error: 'Configuration Error',
        details: 'The server secret (GMAIL_APP_PASSWORD) is missing.' 
      }, { status: 500 });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: GMAIL_USER,
        pass: GMAIL_PASS,
      },
    });

    // 1. Send the Auto-Reply to the Customer
    await transporter.sendMail({
      from: `"My Abacus Pro" <${GMAIL_USER}>`,
      to: email,
      subject: "We received your message!",
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 600px; margin: auto;">
          <h2 style="color: #2563eb;">Hi ${name},</h2>
          <p>Thanks for reaching out to us at <a href="https://myabacuspro.com" style="color: #2563eb; text-decoration: none; font-weight: bold;">MyAbacusPro.com</a>.</p>
          <p>Our team has received your inquiry and we will get back to you within 24 hours.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 14px; color: #64748b;">Best regards,<br><strong>My Abacus Pro Team</strong></p>
        </div>
      `,
    });

    // 2. Send a notification to YOURSELF (Admin)
    await transporter.sendMail({
      from: `"Website Alert" <${GMAIL_USER}>`,
      to: GMAIL_USER,
      replyTo: email,
      subject: `New Contact Form Submission: ${name}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #2563eb; margin-top: 0;">New Website Lead</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #2563eb;">
            ${message.replace(/\n/g, '<br>')}
          </div>
        </div>
      `,
    });

    return NextResponse.json({ status: 'ok' });

  } catch (error: any) {
    console.error('SMTP ERROR:', error);
    
    if (error.code === 'EAUTH' || error.responseCode === 535) {
        return NextResponse.json({ 
            error: 'Authentication failed',
            details: 'The Gmail server rejected the App Password.'
        }, { status: 401 });
    }

    return NextResponse.json({ 
      error: 'Mail delivery failed',
      details: error.message || 'An unexpected error occurred.'
    }, { status: 500 });
  }
}
