import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getFirebaseAdmin } from '@/lib/firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
  try {
    // 1. Use App Router's native JSON parsing
    const body = await req.json();

    console.log("--- BLAST START ---", { 
      target: body.targetAudience, 
      isTest: body.isTest 
    });

    const { subject, message, targetAudience, isTest, testEmail } = body;

    // 2. Validation
    if (!subject || !message) {
      return NextResponse.json({ error: "Subject and Message are required" }, { status: 400 });
    }

    const GMAIL_PASS = process.env.GMAIL_APP_PASSWORD;
    if (!GMAIL_PASS) {
      console.error("CRITICAL: GMAIL_APP_PASSWORD missing from Environment Variables");
      return NextResponse.json({ error: "Mail server configuration missing" }, { status: 500 });
    }

    // 3. Setup Firebase Admin & Firestore
    const adminApp = getFirebaseAdmin();
    const db = getFirestore(adminApp);
    let emailList: string[] = [];

    // 4. Build Recipient List
    if (isTest && testEmail) {
      emailList = [testEmail];
    } else {
      let userQuery: any = db.collection('users');
      
      if (targetAudience === 'teachers') {
        userQuery = userQuery.where('role', '==', 'teacher').where('status', '==', 'approved');
      } else if (targetAudience === 'pro') {
        userQuery = userQuery.where('subscriptionStatus', '==', 'pro');
      } else if (targetAudience === 'free') {
        userQuery = userQuery.where('subscriptionStatus', '==', 'free');
      } else if (targetAudience === 'all') {
        userQuery = userQuery.where('role', '==', 'student');
      }

      const snapshot = await userQuery.get();
      snapshot.forEach((doc: any) => {
        const data = doc.data();
        if (data.email) emailList.push(data.email);
      });
    }

    if (emailList.length === 0) {
      return NextResponse.json({ error: "No recipients found for this target group" }, { status: 404 });
    }

    // 5. Setup Nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'myabacuspro@gmail.com',
        pass: GMAIL_PASS,
      },
    });

    const htmlContent = `
      <div style="font-family: sans-serif; padding: 30px; border: 1px solid #eee; border-radius: 12px; max-width: 600px; margin: auto;">
        <h2 style="color: #0070f3; text-align: center; margin-bottom: 20px;">MyAbacusPro</h2>
        <div style="line-height: 1.6; color: #333; font-size: 16px;">
          ${message.replace(/\n/g, '<br>')}
        </div>
        <div style="text-align: center; margin-top: 30px;">
            <a href="https://myabacuspro.com/pricing" style="background-color: #28a745; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Unlock Full Access
            </a>
        </div>
        <hr style="margin-top: 30px; border: 0; border-top: 1px solid #eee;" />
        <p style="font-size: 12px; color: #999; text-align: center;">© 2026 MyAbacusPro Team. All rights reserved.</p>
      </div>
    `;

    // 6. Send Emails
    await Promise.all(
      emailList.map(email => 
        transporter.sendMail({
          from: '"MyAbacusPro" <myabacuspro@gmail.com>',
          to: email,
          subject: isTest ? `[TEST] ${subject}` : subject,
          html: htmlContent
        })
      )
    );

    return NextResponse.json({ success: true, count: emailList.length });

  } catch (error: any) {
    console.error("BLAST API ERROR:", error.name, error.message);
    return NextResponse.json(
      { error: error.message || "Failed to process campaign" }, 
      { status: 500 }
    );
  }
}
