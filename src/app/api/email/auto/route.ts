import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

/**
 * Transactional Email API
 * Handles: welcome, pro_welcome, achievement, weekly_report, monthly_report, birthday
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

    const statsBlock = metadata ? `
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td align="center">
              <p style="margin: 0; font-size: 10px; color: #64748b; font-weight: bold; text-transform: uppercase;">Streak</p>
              <p style="margin: 5px 0 0; font-size: 18px; font-weight: bold; color: #f97316;">${metadata.streak || 0} Days</p>
            </td>
            <td align="center" style="border-left: 1px solid #e2e8f0;">
              <p style="margin: 0; font-size: 10px; color: #64748b; font-weight: bold; text-transform: uppercase;">Practice Days</p>
              <p style="margin: 5px 0 0; font-size: 18px; font-weight: bold; color: #2563eb;">${metadata.practiceDays || 0}</p>
            </td>
            <td align="center" style="border-left: 1px solid #e2e8f0;">
              <p style="margin: 0; font-size: 10px; color: #64748b; font-weight: bold; text-transform: uppercase;">Points</p>
              <p style="margin: 5px 0 0; font-size: 18px; font-weight: bold; color: #0f172a;">${(metadata.totalPoints || 0).toLocaleString()}</p>
            </td>
          </tr>
        </table>
      </div>
    ` : '';

    switch (type) {
      case 'welcome':
        subject = `Welcome to MyAbacusPro, ${userName}! 🧮`;
        html = `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #eee; border-radius: 15px;">
            <h1 style="color: #0070f3; text-align: center; margin-bottom: 25px;">Welcome Aboard!</h1>
            <p style="font-size: 16px; color: #333; line-height: 1.6;">Hi ${userName},</p>
            <p style="font-size: 16px; color: #333; line-height: 1.6;">We're thrilled to have you join our community! This email is specifically for <strong>${userName}</strong>'s abacus training progress.</p>
            <p style="font-size: 16px; color: #333; line-height: 1.6;">Whether you're here to ace an exam or sharpen your mind, we've got the tools to help you succeed.</p>
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
            <p style="font-size: 16px; color: #333; line-height: 1.6;">Congratulations! <strong>${userName}</strong>'s account has successfully upgraded to <strong>MyAbacusPro Pro</strong>. You now have unlimited access to every corner of our platform.</p>
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
            <p style="font-size: 16px; color: #333; line-height: 1.6;"><strong>${userName}</strong>'s dedication to daily practice has earned a new title on the global stage:</p>
            <div style="text-align: center; padding: 30px; background: #f0fdf4; border-radius: 20px; margin: 25px 0;">
              <div style="font-size: 60px; margin-bottom: 10px;">${metadata.rankIcon}</div>
              <h2 style="color: #16a34a; margin: 0; text-transform: uppercase; letter-spacing: 2px;">${metadata.rankName}</h2>
              <p style="color: #15803d; font-weight: bold; margin-top: 10px;">"${metadata.rankDesc}"</p>
            </div>
            <p style="font-size: 14px; color: #666; text-align: center; margin-bottom: 20px;">Current Progress Snapshot:</p>
            ${statsBlock}
            <p style="font-size: 14px; color: #666; text-align: center;">Keep practicing to reach <strong>Human Calculator</strong> status.</p>
            ${footer}
          </div>
        `;
        break;

      case 'weekly_report':
      case 'monthly_report':
        const isWeekly = type === 'weekly_report';
        subject = `${isWeekly ? 'Weekly' : 'Monthly'} Mastery Report: ${userName} 📈`;
        html = `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <span style="background: #f1f5f9; padding: 8px 16px; border-radius: 20px; font-size: 10px; font-weight: bold; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">Performance Summary</span>
              <h1 style="color: #0f172a; margin-top: 10px;">${isWeekly ? 'Weekly' : 'Monthly'} Progress</h1>
              <p style="font-weight: bold; color: #2563eb;">Student: ${userName}</p>
            </div>
            
            <div style="margin-bottom: 30px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding-right: 10px;">
                    <div style="background: #f8fafc; padding: 20px; border-radius: 15px; text-align: center; border: 1px solid #f1f5f9;">
                      <p style="margin: 0; font-size: 10px; color: #64748b; font-weight: bold; text-transform: uppercase;">Points Earned</p>
                      <p style="margin: 5px 0 0; font-size: 24px; font-weight: 900; color: #2563eb;">+${metadata.periodPoints}</p>
                    </div>
                  </td>
                  <td style="padding-left: 10px;">
                    <div style="background: #f8fafc; padding: 20px; border-radius: 15px; text-align: center; border: 1px solid #f1f5f9;">
                      <p style="margin: 0; font-size: 10px; color: #64748b; font-weight: bold; text-transform: uppercase;">Current Streak</p>
                      <p style="margin: 5px 0 0; font-size: 24px; font-weight: 900; color: #f97316;">${metadata.streak} Days</p>
                    </div>
                  </td>
                </tr>
              </table>
            </div>

            <div style="background: #0f172a; color: white; padding: 25px; border-radius: 20px; margin-bottom: 30px;">
              <h3 style="margin-top: 0; color: #38bdf8; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Overall Standing</h3>
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 15px;">
                <tr>
                  <td>
                    <p style="margin: 0; font-size: 11px; opacity: 0.7;">Total Mastery Points</p>
                    <p style="margin: 5px 0 0; font-size: 20px; font-weight: bold;">${(metadata.totalPoints || 0).toLocaleString()}</p>
                  </td>
                  <td align="right">
                    <p style="margin: 0; font-size: 11px; opacity: 0.7;">Total Practice Days</p>
                    <p style="margin: 5px 0 0; font-size: 20px; font-weight: bold;">${metadata.practiceDays}</p>
                  </td>
                </tr>
              </table>
            </div>

            <div style="text-align: center;">
              <p style="color: #64748b; font-size: 14px; margin-bottom: 25px;">Consistency is the key to becoming a Human Calculator. Your dedication is paying off!</p>
              <a href="https://myabacuspro.com/dashboard" style="background: #2563eb; color: white; padding: 14px 30px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);">Open My Dashboard</a>
            </div>
            ${footer}
          </div>
        `;
        break;

      case 'birthday':
        subject = `Happy Birthday, ${userName}! 🎂 Gift Inside!`;
        html = `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 2px solid #ec4899; border-radius: 20px; background: #fffafb;">
            <div style="text-align: center; margin-bottom: 25px;">
              <div style="font-size: 60px;">🎂</div>
              <h1 style="color: #ec4899; margin-top: 10px;">Happy Birthday, ${userName}!</h1>
            </div>
            <p style="font-size: 16px; color: #333; line-height: 1.6;">Hi ${userName},</p>
            <p style="font-size: 16px; color: #333; line-height: 1.6;">The entire MyAbacusPro team is wishing you a fantastic birthday! We hope your special day is filled with joy, celebration, and magic.</p>
            <div style="background: #fdf2f8; padding: 20px; border-radius: 15px; border: 1px solid #fbcfe8; margin: 25px 0; text-align: center;">
              <h3 style="margin-top: 0; color: #be185d;">A Birthday Gift for You!</h3>
              <p style="color: #9d174d; font-weight: bold; font-size: 18px;">We've credited +100 Mastery Points to your account!</p>
              <p style="font-size: 14px; color: #666;">Log in today to see your birthday surprise and keep your streak alive.</p>
            </div>
            <div style="text-align: center;">
              <a href="https://myabacuspro.com/dashboard" style="background: #ec4899; color: white; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block;">Go to My Dashboard</a>
            </div>
            <p style="font-size: 14px; color: #666; text-align: center; margin-top: 30px;">Keep practicing and reaching for the stars!</p>
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
