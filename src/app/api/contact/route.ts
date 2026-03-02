
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const { name, email, message } = await req.json();

    const GMAIL_USER = 'myabacuspro@gmail.com';
    const GMAIL_PASS = process.env.GMAIL_APP_PASSWORD;

    if (!GMAIL_PASS) {
      console.error("CRITICAL: GMAIL_APP_PASSWORD not configured in environment secrets.");
      return NextResponse.json({ 
        error: 'Server configuration error: Mail password missing. Please ensure GMAIL_APP_PASSWORD is set in Secret Manager.' 
      }, { status: 500 });
    }

    // Nodemailer's built-in 'gmail' service is the most reliable way to connect
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

    await transporter.sendMail(mailOptions);
    return NextResponse.json({ status: 'ok' });
  } catch (error: any) {
    console.error('SMTP ERROR:', error);
    
    // Check for common Gmail authentication errors
    if (error.code === 'EAUTH' || error.responseCode === 535) {
        return NextResponse.json({ 
            error: 'Mail authentication failed. Please verify the GMAIL_APP_PASSWORD is correct and 2FA is enabled.',
            details: error.message
        }, { status: 401 });
    }

    return NextResponse.json({ 
      error: 'Failed to send message via mail server.',
      details: error.message
    }, { status: 500 });
  }
}
