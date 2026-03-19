import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getFirebaseAdmin } from '@/lib/firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
  try {
    // 1. Next.js 14+ standard way to get JSON. 
    // Do NOT use JSON.parse(await req.text()) anywhere.
    const body = await req.json();

    // 2. Immediate Logging to confirm we have the data
    console.log("--- BLAST START ---", { 
      target: body.targetAudience, 
      isTest: body.isTest 
    });

    const { subject, message, targetAudience, isTest, testEmail } = body;

    // 3. Validation
    if (!subject || !message) {
      return NextResponse.json({ error: "Subject and Message are required" }, { status: 400 });
    }

    const GMAIL_PASS = process.env.GMAIL_APP_PASSWORD;
    if (!GMAIL_PASS) {
      throw new Error("GMAIL_APP_PASSWORD is not defined in environment");
    }

    // 4. Setup Nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'myabacuspro@gmail.com',
        pass: GMAIL_PASS,
      },
    });

    const adminApp = getFirebaseAdmin();
    const db = getFirestore(adminApp);
    let emailList: string[] = [];

    // 5. Target Logic
    if (isTest && testEmail) {
      emailList = [testEmail];
    } else {
      let query: any = db.collection('users');
      if (targetAudience === 'teachers') {
        query = query.where('role', '==', 'teacher').where('status', '==', 'approved');
      } else if (targetAudience === 'pro') {
        query = query.where('subscriptionStatus', '==', 'pro');
      } else if (targetAudience === 'free') {
        query = query.where('subscriptionStatus', '==', 'free');
      } else if (targetAudience === 'all') {
        query = query.where('role', '==', 'student');
      }

      const snapshot = await query.get();
      snapshot.forEach((doc: any) => {
        const data = doc.data();
        if (data.email) emailList.push(data.email);
      });
    }

    if (emailList.length === 0) {
      return NextResponse.json({ error: "No recipients found" }, { status: 404 });
    }

    // 6. Template & Send
    const html = `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 600px; margin: auto;">
        <h2 style="color: #0070f3; text-align: center;">MyAbacusPro</h2>
        <div style="line-height: 1.6; color: #333;">
          ${message.replace(/\n/g, '<br>')}
        </div>
        <div style="text-align: center; margin-top: 30px;">
            <a href="https://myabacuspro.com/pricing" style="background-color: #28a745; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Unlock Full Access
            </a>
        </div>
        <hr style="margin-top: 30px; border: 0; border-top: 1px solid #eee;" />
        <p style="font-size: 12px; color: #666; text-align: center;">© 2026 MyAbacusPro. All rights reserved.</p>
      </div>
    `;

    await Promise.all(
      emailList.map(email => 
        transporter.sendMail({
          from: '"MyAbacusPro" <myabacuspro@gmail.com>',
          to: email,
          subject: isTest ? `[TEST] ${subject}` : subject,
          html: html
        })
      )
    );

    return NextResponse.json({ success: true, count: emailList.length });

  } catch (error: any) {
    // This will catch the "SyntaxError" specifically if it happens
    console.error("CRITICAL BLAST ERROR:", error.name, error.message);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" }, 
      { status: 500 }
    );
  }
}
