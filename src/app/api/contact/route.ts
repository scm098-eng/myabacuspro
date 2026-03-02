
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const { name, email, message } = await req.json();

    const GMAIL_USER = 'myabacuspro@gmail.com';
    const GMAIL_PASS = process.env.GMAIL_APP_PASSWORD;

    // Diagnostic check for environment variables
    if (!GMAIL_PASS) {
      console.error("CRITICAL: GMAIL_APP_PASSWORD is not present in the environment.");
      return NextResponse.json({ 
        error: 'Configuration Error',
        details: 'The mail server password (GMAIL_APP_PASSWORD) is missing from the server environment. Please check Secret Manager and apphosting.yaml mappings.' 
      }, { status: 500 });
    }

    if (GMAIL_PASS.length < 10) {
       console.error("CRITICAL: GMAIL_APP_PASSWORD seems too short or malformed.");
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: GMAIL_USER,
        pass: GMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"My Abacus Pro Contact" <${GMAIL_USER}>`,
      to: GMAIL_USER,
      replyTo: email,
      subject: `New Contact Form Submission from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #2563eb; margin-top: 0;">New Contact Form Submission</h2>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #2563eb;">
            ${message.replace(/\n/g, '<br>')}
          </div>
          <p style="margin-top: 30px; font-size: 12px; color: #64748b;">This message was sent from the contact form on MyAbacusPro.com</p>
        </div>
      `,
    };

    // Attempt to send
    await transporter.sendMail(mailOptions);
    return NextResponse.json({ status: 'ok' });

  } catch (error: any) {
    console.error('SMTP ERROR:', error);
    
    // Detailed error responses for the UI
    if (error.code === 'EAUTH' || error.responseCode === 535) {
        return NextResponse.json({ 
            error: 'Authentication failed',
            details: 'The Gmail SMTP server rejected the App Password. Please verify that the GMAIL_APP_PASSWORD in Secret Manager matches your 16-character Google App Password.'
        }, { status: 401 });
    }

    return NextResponse.json({ 
      error: 'Mail delivery failed',
      details: error.message || 'An unexpected error occurred while connecting to the mail server.'
    }, { status: 500 });
  }
}
