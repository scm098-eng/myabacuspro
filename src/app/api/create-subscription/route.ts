
import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { getFirebaseAdmin } from '@/lib/firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

const getRazorpayInstance = () => {
  if (RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET) {
    return new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET,
    });
  }
  return null;
};

export async function POST(req: NextRequest) {
  const razorpay = getRazorpayInstance();

  if (!razorpay) {
    console.error('Razorpay keys missing - this is expected during Build but an error in Production.');
    return NextResponse.json(
      { error: 'Payment gateway configuration missing.' },
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
        try {
            customer = await razorpay.customers.fetch(userData.razorpayCustomerId);
        } catch (e) {
            // If fetch fails, we'll try to create a new one
            console.warn("Could not fetch existing customer, creating new one.");
        }
    }
    
    if (!customer) {
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
      total_count: 12,
      notes: {
        user_id: userId,
      },
    };

    const subscription = await razorpay.subscriptions.create(subscriptionOptions as any);

    return NextResponse.json({
      subscriptionId: subscription.id,
      customerId: customer.id,
      key_id: RAZORPAY_KEY_ID,
    });

  } catch (error: any) {
    console.error('Razorpay subscription creation failed:', error);
    return NextResponse.json(
      { error: `Failed to create subscription: ${error.message}` },
      { status: 500 }
    );
  }
}
