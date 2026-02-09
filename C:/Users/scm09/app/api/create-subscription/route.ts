
import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { getFirebaseAdmin } from '@/lib/firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

// This logic prevents the build from crashing
let razorpay: Razorpay | null;

if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
} else {
  // During build, we just use a dummy or null
  console.warn("Razorpay keys missing. Skipping initialization for build.");
  razorpay = null;
}


export async function POST(req: NextRequest) {
  if (!razorpay) {
    console.error('Razorpay has not been initialized. Check your environment variables.');
    return NextResponse.json(
      { error: 'Payment provider is not configured on the server.' },
      { status: 500 }
    );
  }
  
  const adminApp = getFirebaseAdmin();
  const db = getFirestore(adminApp);
  
  const headersList = req.headers;
  const userId = headersList.get('x-user-id');

  if (!userId) {
    return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
  }

  try {
    const { planId } = await req.json();
    const userDocRef = db.collection('users').doc(userId);
    const userDoc = await userDocRef.get();
    const userData = userDoc.data();

    // 1. Create a customer in Razorpay if one doesn't exist
    let customer;
    if (userData?.razorpayCustomerId) {
        customer = await razorpay.customers.fetch(userData.razorpayCustomerId);
    } else {
        const customerOptions = {
          name: userData?.displayName || `${userData?.firstName} ${userData?.surname}` || `User ${userId}`,
          email: userData?.email || `user_${userId}@example.com`,
          fail_existing: 0 as 0 | 1,
        };
        customer = await razorpay.customers.create(customerOptions);
        await userDocRef.update({ razorpayCustomerId: customer.id });
    }
    
    // 2. Create a subscription with userId in notes
    const subscriptionOptions = {
      plan_id: planId,
      customer_id: customer.id,
      customer_notify: 1 as 0 | 1,
      total_count: 12, // For a yearly plan, adjust as needed
      notes: {
        user_id: userId, // Pass the Firebase UID here
      },
    };

    const subscription = await razorpay.subscriptions.create(subscriptionOptions as any);

    return NextResponse.json({
      subscriptionId: subscription.id,
      customerId: customer.id,
      key_id: process.env.RAZORPAY_KEY_ID,
    });

  } catch (error: any) {
    console.error('Razorpay subscription creation failed:', error);
    return NextResponse.json(
      { error: `Failed to create subscription: ${error.message}` },
      { status: 500 }
    );
  }
}
