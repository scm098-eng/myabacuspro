import { NextRequest, NextResponse } from "next/server";
// import { getFirestore } from "@/lib/firebaseAdmin";
import { getFirebaseAdmin } from '@/lib/firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { subscriptionId, userId } = body;

    if (!subscriptionId || !userId) {
      return NextResponse.json(
        { error: "Missing subscriptionId or userId" },
        { status: 400 }
      );
    }

    const db = getFirestore();

    await db.collection("subscriptions")
      .doc(subscriptionId)
      .set({
        userId,
        createdAt: Date.now()
      });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error saving subscription:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
