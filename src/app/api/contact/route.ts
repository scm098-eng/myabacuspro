
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  const { name, email, message } = await req.json();

  const GMAIL_USER = 'myabacuspro@gmail.com';
  const GMAIL_PASS = process.env.GMAIL_APP_PASSWORD;

  if (!GMAIL_PASS) {
    console.error("GMAIL_APP_PASSWORD not configured in environment.");
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"${name}" <${email}>`,
    to: GMAIL_USER,
    replyTo: email,
    subject: `New Contact Form Submission from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    html: `
      <h3>New Contact Form Submission</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, '<br>')}</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return NextResponse.json({ status: 'ok' });
  } catch (error: any) {
    console.error('Failed to send contact email:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
