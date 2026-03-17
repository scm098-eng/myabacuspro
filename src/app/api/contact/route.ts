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

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
        <div style="background-color: #0070f3; padding: 20px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 24px;">MyAbacusPro</h1>
        </div>
        
        <div style="padding: 30px; line-height: 1.6; color: #333;">
          <h2 style="color: #0070f3;">Hi ${name},</h2>
          <p>Thank you for reaching out! We've received your message and our team will get back to you within 24 hours.</p>
          
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          
          <p><b>Platform Updates:</b> We have updated our timer sounds for a better practice experience and added <b>new game levels</b>!</p>
          
          <p>Since your 3-day free trial has ended, we encourage you to upgrade to a <b>Pro Account</b> to unlock these new levels and continue your speed building.</p>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="https://myabacuspro.com/pricing" style="background-color: #28a745; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Get MyAbacusPro PRO
            </a>
          </div>
        </div>
        
        <div style="background-color: #f9f9f9; padding: 15px; text-align: center; font-size: 12px; color: #777;">
          © 2026 MyAbacusPro. All rights reserved.
        </div>
      </div>
    `;

    // 1. Send the Branded Auto-Reply to the Customer
    await transporter.sendMail({
      from: `"MyAbacusPro" <${GMAIL_USER}>`,
      to: email,
      subject: "Message Received - MyAbacusPro",
      html: emailHtml,
    });

    // 2. Send a notification to YOURSELF (Admin)
    await transporter.sendMail({
      from: `"Website Alert" <${GMAIL_USER}>`,
      to: GMAIL_USER,
      replyTo: email,
      subject: `New Lead: ${name}`,
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

    return NextResponse.json({ success: true });

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
