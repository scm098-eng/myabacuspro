
import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebase-admin';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

/**
 * API Route to track marketing email clicks
 * URL: /api/track-click?userId=XYZ&campaign=ABC
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const campaign = searchParams.get('campaign');

  if (userId) {
    try {
      const adminApp = getFirebaseAdmin();
      const db = getFirestore(adminApp);

      // 1. Mark the user as having clicked the campaign
      await db.collection('users').doc(userId).update({
        marketingCampaignClicked: true,
        lastCampaignClicked: campaign,
        clickedAt: new Date()
      });

      // 2. Increment global click counter
      await db.collection('stats').doc('marketing').update({
        linkClicks: FieldValue.increment(1)
      });

    } catch (error) {
      console.error("Click tracking failed:", error);
    }
  }

  // Redirect to the pricing page
  return NextResponse.redirect(new URL('/pricing', req.url));
}
