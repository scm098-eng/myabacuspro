import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

/**
 * Transactional Email API
 * Handles: welcome, pro_welcome, achievement, weekly_report, monthly_report, birthday, winner_alert
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
            <p style="font-size: 16px; color: #333; line-height: 1.6;">Congratulations! <strong>${userName}</strong>'s account has successfully upgraded to <strong>MyAbacusPro Pro</strong>.</p>
            <div style="background: white; padding: 20px; border-radius: 10px; border: 1px solid #ffe4b5; margin: 25px 0;">
              <h3 style="margin-top: 0; color: #b8860b;">Your Pro Perks:</h3>
              <ul style="color: #444;">
                <li>Unlimited timed tests & all difficulty levels</li>
                <li>Full access to all 1000+ Bubble Game levels</li>
                <li>Advanced Progress Analytics & Hall of Fame status</li>
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
            <div style="text-align: center; padding: 30px; background: #f0fdf4; border-radius: 20px; margin: 25px 0;">
              <div style="font-size: 60px; margin-bottom: 10px;">${metadata.rankIcon}</div>
              <h2 style="color: #16a34a; margin: 0; text-transform: uppercase; letter-spacing: 2px;">${metadata.rankName}</h2>
              <p style="color: #15803d; font-weight: bold; margin-top: 10px;">"${metadata.rankDesc}"</p>
            </div>
            ${statsBlock}
            ${footer}
          </div>
        `;
        break;

      case 'winner_alert':
        subject = `🏆 Official Champion: You are the ${metadata.periodType} Winner!`;
        html = `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 40px; border: 4px solid #fbbf24; border-radius: 30px; background: #fffcf0;">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="font-size: 70px;">🏆</div>
              <h1 style="color: #92400e; margin: 10px 0 0; text-transform: uppercase;">Hail the Champion!</h1>
              <p style="font-size: 18px; font-weight: bold; color: #b45309;">${metadata.periodType} Winner Announced</p>
            </div>
            <div style="background: white; padding: 30px; border-radius: 20px; border: 2px solid #fde68a; text-align: center; margin-bottom: 30px;">
              <h2 style="font-size: 32px; color: #1f2937; margin: 0 0 15px;">${userName}</h2>
              <div style="display: inline-block; background: #fbbf24; color: #92400e; padding: 10px 25px; font-weight: 900; font-size: 20px; border-radius: 50px;">
                ${(metadata.points || 0).toLocaleString()} Mastery Points
              </div>
            </div>
            <div style="text-align: center;">
              <a href="https://myabacuspro.com/dashboard" style="background: #92400e; color: white; padding: 16px 35px; text-decoration: none; border-radius: 12px; font-weight: bold; display: inline-block;">Claim Your Glory</a>
            </div>
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
            <h1 style="color: #0f172a; text-align: center;">${isWeekly ? 'Weekly' : 'Monthly'} Progress</h1>
            <p style="text-align: center; font-weight: bold; color: #2563eb;">Student: ${userName}</p>
            <div style="background: #f8fafc; padding: 20px; border-radius: 15px; text-align: center; border: 1px solid #f1f5f9; margin: 25px 0;">
              <p style="margin: 0; font-size: 10px; color: #64748b; font-weight: bold; text-transform: uppercase;">Points Earned</p>
              <p style="margin: 5px 0 0; font-size: 24px; font-weight: 900; color: #2563eb;">+${metadata.periodPoints}</p>
            </div>
            <div style="text-align: center;">
              <a href="https://myabacuspro.com/dashboard" style="background: #2563eb; color: white; padding: 14px 30px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block;">Open My Dashboard</a>
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
            <div style="background: #fdf2f8; padding: 20px; border-radius: 15px; border: 1px solid #fbcfe8; margin: 25px 0; text-align: center;">
              <h3 style="margin-top: 0; color: #be185d;">A Birthday Gift for You!</h3>
              <p style="color: #9d174d; font-weight: bold; font-size: 18px;">We've credited +100 Mastery Points to your account!</p>
            </div>
            <div style="text-align: center;">
              <a href="https://myabacuspro.com/dashboard" style="background: #ec4899; color: white; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block;">Go to My Dashboard</a>
            </div>
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
