import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getFirebaseAdmin } from '@/lib/firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

/**
 * Helper to pause execution for Gmail rate limiting
 */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    const subjectTemplate = formData.get('subject') as string;
    const messageTemplate = formData.get('message') as string;
    const targetAudience = formData.get('targetAudience') as string;
    const isTest = formData.get('isTest') === 'true';
    const testEmail = formData.get('testEmail') as string;
    const studentId = formData.get('studentId') as string;
    const files = formData.getAll('attachments') as File[];

    console.log("--- BLAST TRIGGERED ---", { 
      target: targetAudience, 
      isTest,
      attachmentsCount: files.length,
      studentId: studentId || 'N/A'
    });

    if (!subjectTemplate || !messageTemplate) {
      return NextResponse.json({ error: "Subject and Message are required" }, { status: 400 });
    }

    const GMAIL_PASS = process.env.GMAIL_APP_PASSWORD;
    if (!GMAIL_PASS || GMAIL_PASS === "undefined") {
      console.error("CRITICAL: GMAIL_APP_PASSWORD is missing");
      return NextResponse.json({ error: "Mail server configuration missing" }, { status: 500 });
    }

    const adminApp = getFirebaseAdmin();
    const db = getFirestore(adminApp);
    let recipients: { email: string; name: string }[] = [];

    // Build Recipient List with Names
    if (isTest && testEmail) {
      recipients = [{ email: testEmail, name: "Test User" }];
    } else {
      let userQuery: any = db.collection('users');
      
      if ((targetAudience === 'single' || targetAudience === 'staff_single') && studentId) {
        const userSnap = await db.collection('users').doc(studentId).get();
        if (userSnap.exists && userSnap.data()?.email) {
          const data = userSnap.data();
          recipients.push({ 
            email: data?.email, 
            name: data?.firstName || 'Student' 
          });
        }
      } else if (targetAudience === 'teachers') {
        const snapshot = await userQuery.where('role', '==', 'teacher').where('status', '==', 'approved').get();
        snapshot.forEach((doc: any) => {
          const data = doc.data();
          if (data.email) recipients.push({ email: data.email, name: data.firstName || 'Teacher' });
        });
      } else if (targetAudience === 'pro') {
        const snapshot = await userQuery.where('role', '==', 'student').where('subscriptionStatus', '==', 'pro').get();
        snapshot.forEach((doc: any) => {
          const data = doc.data();
          if (data.email) recipients.push({ email: data.email, name: data.firstName || 'Student' });
        });
      } else if (targetAudience === 'free') {
        const snapshot = await userQuery.where('role', '==', 'student').where('subscriptionStatus', '==', 'free').get();
        snapshot.forEach((doc: any) => {
          const data = doc.data();
          if (data.email) recipients.push({ email: data.email, name: data.firstName || 'Student' });
        });
      } else if (targetAudience === 'all') {
        const snapshot = await userQuery.where('role', '==', 'student').get();
        snapshot.forEach((doc: any) => {
          const data = doc.data();
          if (data.email) recipients.push({ email: data.email, name: data.firstName || 'Student' });
        });
      }
    }

    if (recipients.length === 0) {
      return NextResponse.json({ error: "No recipients found" }, { status: 404 });
    }

    // Process Attachments
    const emailAttachments = await Promise.all(files.map(async (file) => ({
      filename: file.name,
      content: Buffer.from(await file.arrayBuffer()),
      contentType: file.type
    })));

    // Setup Nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'myabacuspro@gmail.com',
        pass: GMAIL_PASS,
      },
    });

    let successCount = 0;
    let failCount = 0;

    for (const recipient of recipients) {
      try {
        // Dynamic Personalization Replacement
        const personalizedSubject = (isTest ? `[TEST] ` : '') + 
          subjectTemplate
            .replace(/\{\{name\}\}/gi, recipient.name)
            .replace(/<%= name %>/gi, recipient.name);

        const personalizedMessage = messageTemplate
          .replace(/\{\{name\}\}/gi, recipient.name)
          .replace(/<%= name %>/gi, recipient.name);

        const htmlContent = `
          <div style="font-family: sans-serif; padding: 30px; border: 1px solid #eee; border-radius: 12px; max-width: 600px; margin: auto;">
            <h2 style="color: #0070f3; text-align: center; margin-bottom: 20px;">MyAbacusPro</h2>
            <div style="line-height: 1.6; color: #333; font-size: 16px;">
              ${personalizedMessage}
            </div>
            <div style="text-align: center; margin-top: 30px;">
                <a href="https://myabacuspro.com/dashboard" style="background-color: #28a745; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                  Go to Dashboard
                </a>
            </div>
            <hr style="margin-top: 30px; border: 0; border-top: 1px solid #eee;" />
            <p style="font-size: 12px; color: #999; text-align: center;">© ${new Date().getFullYear()} MyAbacusPro Team. All rights reserved.</p>
          </div>
        `;

        await transporter.sendMail({
          from: '"MyAbacusPro" <myabacuspro@gmail.com>',
          to: recipient.email,
          subject: personalizedSubject,
          html: htmlContent,
          attachments: emailAttachments
        });
        
        successCount++;
        await sleep(250); // Gmail rate limiting safeguard
      } catch (err) {
        console.error(`FAILED to send to ${recipient.email}:`, err);
        failCount++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      count: successCount,
      failed: failCount
    });

  } catch (error: any) {
    console.error("BLAST API ERROR:", error.name, error.message);
    return NextResponse.json(
      { error: error.message || "Failed to process campaign" }, 
      { status: 500 }
    );
  }
}
