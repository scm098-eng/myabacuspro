import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

/**
 * Transactional Email API
 * Handles: welcome, pro_welcome, achievement
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, userEmail, userName, metadata } = body;

    const GMAIL_USER = 'myabacuspro@gmail.com';
    const GMAIL_PASS = process.env.GMAIL_APP_PASSWORD;

    if (!GMAIL_PASS) {
      console.error("Auto-Email: Missing GMAIL_APP_PASSWORD");
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: GMAIL_USER,
        pass: GMAIL_PASS,
      },
    });

    let subject = '';
    let html = '';

    const footer = `
      <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; text-align: center; color: #999; font-size: 12px;">
        <p>© 2026 MyAbacusPro. The ultimate abacus training ground.</p>
        <p>If you have questions, reply to this email or contact support.</p>
      </div>
    `;

    switch (type) {
      case 'welcome':
        subject = `Welcome to MyAbacusPro, ${userName}! 🧮`;
        html = `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #eee; border-radius: 15px;">
            <h1 style="color: #0070f3; text-align: center; margin-bottom: 25px;">Welcome Aboard!</h1>
            <p style="font-size: 16px; color: #333; line-height: 1.6;">Hi ${userName},</p>
            <p style="font-size: 16px; color: #333; line-height: 1.6;">We're thrilled to have you join our global community of mental math masters. Whether you're here to ace an exam or sharpen your mind, we've got the tools to help you succeed.</p>
            <div style="background: #f0f7ff; padding: 20px; border-radius: 10px; margin: 25px 0;">
              <h3 style="margin-top: 0; color: #0070f3;">Quick Start Guide:</h3>
              <ul style="margin-bottom: 0; color: #444;">
                <li><strong>Practice:</strong> Start with Beads Value to master visualization.</li>
                <li><strong>Compete:</strong> Check the Weekly Hall of Fame on your dashboard.</li>
                <li><strong>Play:</strong> Unlock higher levels in the Bubble Game.</li>
              </ul>
            </div>
            <div style="text-align: center;">
              <a href="https://myabacuspro.com/dashboard" style="background: #0070f3; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Go to My Dashboard</a>
            </div>
            ${footer}
          </div>
        `;
        break;

      case 'pro_welcome':
        subject = `You're Pro! Welcome to the Elite, ${userName} 👑`;
        html = `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 2px solid #ffd700; border-radius: 15px; background: #fffdf0;">
            <h1 style="color: #b8860b; text-align: center; margin-bottom: 25px;">Pro Membership Active</h1>
            <p style="font-size: 16px; color: #333; line-height: 1.6;">Hi ${userName},</p>
            <p style="font-size: 16px; color: #333; line-height: 1.6;">Congratulations! You have successfully upgraded to <strong>MyAbacusPro Pro</strong>. You now have unlimited access to every corner of our platform.</p>
            <div style="background: white; padding: 20px; border-radius: 10px; border: 1px solid #ffe4b5; margin: 25px 0;">
              <h3 style="margin-top: 0; color: #b8860b;">Your Pro Perks:</h3>
              <ul style="color: #444;">
                <li>Unlimited timed tests (Hard & Medium modes)</li>
                <li>Full access to all 1000+ Bubble Game levels</li>
                <li>Advanced Progress Analytics & PDF Reports</li>
                <li>Priority WhatsApp Support & Rank Protection</li>
              </ul>
            </div>
            <div style="text-align: center;">
              <a href="https://myabacuspro.com/tests" style="background: #b8860b; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Start Pro Training</a>
            </div>
            ${footer}
          </div>
        `;
        break;

      case 'achievement':
        subject = `New Rank Unlocked: ${metadata.rankName}! 🌟`;
        html = `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #4ade80; border-radius: 15px;">
            <h1 style="color: #16a34a; text-align: center; margin-bottom: 25px;">Rank Up!</h1>
            <p style="font-size: 16px; color: #333; line-height: 1.6;">Outstanding performance, ${userName}!</p>
            <p style="font-size: 16px; color: #333; line-height: 1.6;">Your dedication to daily practice has earned you a new title on the global stage:</p>
            <div style="text-align: center; padding: 30px; background: #f0fdf4; border-radius: 20px; margin: 25px 0;">
              <div style="font-size: 60px; margin-bottom: 10px;">${metadata.rankIcon}</div>
              <h2 style="color: #16a34a; margin: 0; text-transform: uppercase; letter-spacing: 2px;">${metadata.rankName}</h2>
              <p style="color: #15803d; font-weight: bold; margin-top: 10px;">"${metadata.rankDesc}"</p>
            </div>
            <p style="font-size: 14px; color: #666; text-align: center;">Share your success with your teacher and parents! Keep practicing to reach <strong>Human Calculator</strong> status.</p>
            ${footer}
          </div>
        `;
        break;

      default:
        throw new Error("Invalid email type");
    }

    await transporter.sendMail({
      from: '"MyAbacusPro" <myabacuspro@gmail.com>',
      to: userEmail,
      subject,
      html,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Auto-Email API Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
