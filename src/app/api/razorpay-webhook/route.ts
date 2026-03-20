import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getFirebaseAdmin } from '@/lib/firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET!;

  try {
    const text = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Signature missing' }, { status: 400 });
    }

    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(text);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(text);

    if (event.event === 'subscription.charged') {
      const customerId = event.payload.subscription.entity.customer_id;
      
      const adminApp = getFirebaseAdmin();
      const db = getFirestore(adminApp);
      
      const usersRef = db.collection('users');
      const q = usersRef.where('razorpayCustomerId', '==', customerId);
      
      const querySnapshot = await q.get();

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();
        
        await userDoc.ref.update({
          subscriptionStatus: 'pro',
          updatedAt: new Date(),
        });
        
        console.log(`Upgraded user ${userDoc.id} to Pro.`);

        // Trigger Pro Welcome Auto-Email
        try {
          // Note: Webhooks run server-side, we can call our local auto-email API or use nodemailer directly.
          // Fetching the local route is safer for template consistency.
          const protocol = req.headers.get('x-forwarded-proto') || 'https';
          const host = req.headers.get('host');
          
          fetch(`${protocol}://${host}/api/email/auto`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'pro_welcome',
              userEmail: userData.email,
              userName: userData.firstName || 'Student'
            })
          }).catch(e => console.error("Webhook: Failed to trigger pro welcome email", e));
        } catch (emailErr) {
          console.error("Webhook: Email trigger block failed", emailErr);
        }

      } else {
        console.warn(`No user found with Razorpay Customer ID: ${customerId}`);
      }
    }

    return NextResponse.json({ status: 'ok' });

  } catch (error: any) {
    console.error('Razorpay webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
