import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getFirebaseAdmin } from '@/lib/firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
  try {
    // 1. Smart Parse Logic: Safely retrieve the body
    let body;
    try {
      // Try to get JSON directly first
      body = await req.json();
    } catch (e) {
      // If that fails, the body might be empty or raw text
      const rawText = await req.text();
      if (!rawText) {
        return NextResponse.json({ error: "No data sent from frontend" }, { status: 400 });
      }
      try {
        body = JSON.parse(rawText);
      } catch (jsonErr) {
        console.error("JSON Parse Error:", jsonErr);
        return NextResponse.json({ error: "Invalid JSON format" }, { status: 400 });
      }
    }

    // 2. DEBUG LOG: Monitor the incoming data structure
    console.log("--- MyAbacusPro Blast Debug ---");
    console.log("Final Body Object:", body);

    const { subject, message, targetAudience, isTest, testEmail } = body;

    // 3. Validate essential fields
    if (!subject || !message) {
      return NextResponse.json({ error: "Subject and Message are required" }, { status: 400 });
    }

    const GMAIL_USER = 'myabacuspro@gmail.com';
    const GMAIL_PASS = process.env.GMAIL_APP_PASSWORD;

    if (!GMAIL_PASS) {
      console.error("CRITICAL: GMAIL_APP_PASSWORD missing in environment.");
      return NextResponse.json({ error: 'Mail server not configured.' }, { status: 500 });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: GMAIL_USER,
        pass: GMAIL_PASS,
      },
    });

    const adminApp = getFirebaseAdmin();
    const db = getFirestore(adminApp);

    let emailList: string[] = [];

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
      return NextResponse.json({ success: true, count: 0, message: "No recipients found for the selected audience." });
    }

    const htmlTemplate = (content: string) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
        <div style="background-color: #0070f3; padding: 20px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 24px;">MyAbacusPro</h1>
        </div>
        <div style="padding: 30px; line-height: 1.6; color: #333;">
          ${content.replace(/\n/g, '<br>')}
          <div style="text-align: center; margin-top: 30px;">
            <a href="https://myabacuspro.com/pricing" style="background-color: #28a745; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Unlock Full Access
            </a>
          </div>
        </div>
        <div style="background-color: #f9f9f9; padding: 15px; text-align: center; font-size: 12px; color: #777;">
          © 2026 MyAbacusPro. All rights reserved.
        </div>
      </div>
    `;

    // Process in parallel
    const sendPromises = emailList.map((email) =>
      transporter.sendMail({
        from: `"MyAbacusPro" <${GMAIL_USER}>`,
        to: email,
        subject: isTest ? `[TEST] ${subject}` : subject,
        html: htmlTemplate(message),
      })
    );

    await Promise.all(sendPromises);

    return NextResponse.json({ success: true, count: emailList.length });
  } catch (error: any) {
    console.error('Blast API Global Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
