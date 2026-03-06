
/**
 * Firebase Cloud Functions v2 (Node.js) Code
 * filename: functions/index.js
 */

const { setGlobalOptions } = require("firebase-functions/v2");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { onRequest, onCall, HttpsError } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const admin = require('firebase-admin');
if (admin.apps.length === 0) {
    admin.initializeApp();
}

setGlobalOptions({ maxInstances: 10 });
const db = admin.firestore();

// --- Configuration ---
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID; 
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

// GMAIL CONFIGURATION
const GMAIL_USER = 'myabacuspro@gmail.com';

// Helper to get transporter lazily
function getTransporter() {
    const GMAIL_PASS = process.env.GMAIL_APP_PASSWORD;
    if (!GMAIL_PASS) {
        logger.error("CRITICAL: GMAIL_APP_PASSWORD not found in environment.");
    }
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: GMAIL_USER,
            pass: GMAIL_PASS,
        },
    });
}

// ----------------------------------------------------
// --- ADMIN: CUSTOM PROMOTIONAL CAMPAIGNS ---
// ----------------------------------------------------

exports.sendCustomPromotionalEmail = onCall({
    secrets: ["GMAIL_APP_PASSWORD"]
}, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', "User must be logged in.");
    }

    try {
        // Verify Admin role from Firestore (more robust than claims)
        const userDoc = await db.collection('users').doc(request.auth.uid).get();
        if (!userDoc.exists || userDoc.data().role !== 'admin') {
            throw new HttpsError('permission-denied', "Only admins can perform this action.");
        }

        const { subject, message, isTest, testEmail, targetAudience } = request.data;
        const transporter = getTransporter();

        if (isTest && testEmail) {
            try {
                await transporter.sendMail({
                    from: `"My Abacus Pro" <${GMAIL_USER}>`,
                    to: testEmail,
                    subject: `[TEST] ${subject}`,
                    html: `<div style="font-family: sans-serif;">${message}</div>`
                });
                return { status: "success", message: "Test email sent successfully." };
            } catch (e) {
                logger.error("Test email failed:", e);
                throw new HttpsError('internal', `Gmail Error: ${e.message}`);
            }
        }

        let query = db.collection('users');
        
        // Filter based on target audience
        if (targetAudience === 'teachers') {
            query = query.where('role', '==', 'teacher').where('status', '==', 'approved');
        } else {
            query = query.where('role', '==', 'student');
            if (targetAudience === 'pro') {
                query = query.where('subscriptionStatus', '==', 'pro');
            } else if (targetAudience === 'free') {
                query = query.where('subscriptionStatus', '==', 'free');
            }
        }

        const targets = await query.get();

        if (targets.empty) {
            return { status: "success", recipients: 0, message: "No users found matching this criteria." };
        }

        let count = 0;
        for (const doc of targets.docs) {
            try {
                await transporter.sendMail({
                    from: `"My Abacus Pro" <${GMAIL_USER}>`,
                    to: doc.data().email,
                    subject: subject,
                    html: `<div style="font-family: sans-serif;">${message}</div>`
                });
                count++;
            } catch (e) {
                logger.error(`Promo failed for ${doc.data().email}:`, e);
            }
        }

        return { status: "success", recipients: count };
    } catch (err) {
        logger.error("Global crash in promotional email function:", err);
        throw new HttpsError('internal', err.message || "Failed to process email campaign.");
    }
});

// ----------------------------------------------------
// --- MARKETING: AUTOMATIC UPGRADE EMAILS ---
// ----------------------------------------------------

exports.sendWeeklyMarketingEmails = onSchedule({
    schedule: "30 4 * * 1",
    secrets: ["GMAIL_APP_PASSWORD"]
}, async (event) => {
  logger.info("Starting Weekly Marketing Campaign...");
  
  const freeUsersSnapshot = await db.collection('users')
    .where('role', '==', 'student')
    .where('subscriptionStatus', '==', 'free')
    .limit(100)
    .get();

  if (freeUsersSnapshot.empty) return;

  const transporter = getTransporter();
  let sentCount = 0;

  for (const doc of freeUsersSnapshot.docs) {
    const user = doc.data();
    const userId = doc.id;

    if (user.lastMarketingEmailSent) {
        const lastSent = user.lastMarketingEmailSent.toDate();
        const diffDays = (new Date() - lastSent) / (1000 * 60 * 60 * 24);
        if (diffDays < 14) continue;
    }

    const trackingLink = `https://abacusace-mmnqw.web.app/api/track-click?userId=${userId}&campaign=pro_upgrade_v1`;

    const mailOptions = {
      from: `"My Abacus Pro" <${GMAIL_USER}>`,
      to: user.email,
      subject: `Unlock Your Full Math Potential, ${user.firstName}! 🚀`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
          <h2 style="color: #2563eb;">Ready to become a Math Whiz?</h2>
          <p>Hi ${user.firstName},</p>
          <p>You've been practicing hard on <strong>My Abacus Pro</strong>! Did you know that Pro members get 5x more practice material and climb the leaderboard 2x faster?</p>
          <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">What you get with Pro:</h3>
            <ul style="color: #475569;">
              <li>Unlimited Practice Tests</li>
              <li>Unlock All 50+ Game Levels</li>
              <li>Advanced Performance Analytics</li>
              <li>Ad-Free Experience</li>
            </ul>
          </div>
          <p style="text-align: center;">
            <a href="${trackingLink}" style="background: #2563eb; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">🚀 Upgrade to Pro Now</a>
          </p>
        </div>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      await doc.ref.update({
        lastMarketingEmailSent: admin.firestore.FieldValue.serverTimestamp()
      });
      sentCount++;
    } catch (error) {
      logger.error(`Failed to send marketing email to ${user.email}:`, error);
    }
  }

  await db.collection('stats').doc('marketing').set({
    emailsSent: admin.firestore.FieldValue.increment(sentCount)
  }, { merge: true });
});

// ------------------------------------------
// --- RAZORPAY WEBHOOK (ATTRIBUTION FIX) ---
// ------------------------------------------
exports.razorpaywebhook = onRequest(async (request, response) => {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET; 
    const signature = request.headers['x-razorpay-signature'];
    const rawBodyBuffer = request.rawBody; 
    const expectedSignature = crypto.createHmac('sha256', webhookSecret).update(rawBodyBuffer).digest('hex');

    if (expectedSignature !== signature) return response.status(200).send('Validation Failed'); 

    const payload = request.body;
    const eventType = payload.event;
    const eventId = request.headers['x-razorpay-event-id']; 

    const eventRef = db.collection('processedWebhooks').doc(eventId);
    const eventDoc = await eventRef.get();
    if (eventDoc.exists) return response.status(200).send('Already processed');
    
    try {
        const notes = payload.payload?.order?.entity?.notes || 
                      payload.payload?.subscription?.entity?.notes || 
                      payload.payload?.payment?.entity?.notes || {};
        
        let userId = notes.userId || 'UNKNOWN';

        if (eventType === 'subscription.activated' || eventType === 'order.paid') {
            if (userId !== 'UNKNOWN') {
                const userRef = db.collection('users').doc(userId);
                const userSnap = await userRef.get();
                const userData = userSnap.data();

                if (userData && userData.marketingCampaignClicked) {
                    await db.collection('stats').doc('marketing').set({
                        conversions: admin.FieldValue.increment(1)
                    }, { merge: true });
                    await userRef.update({ marketingCampaignClicked: false });
                }

                await userRef.set({ 
                    subscriptionStatus: 'pro',
                    updatedAt: admin.FieldValue.serverTimestamp()
                }, { merge: true });
                
                await admin.auth().setCustomUserClaims(userId, { subscription: 'pro' });
            } 
        }

        await eventRef.set({ timestamp: admin.FieldValue.serverTimestamp(), event: eventType, userId });
        return response.status(200).send("OK");
    } catch (error) {
        logger.error(`Fatal Error on ${eventType}:`, error);
        return response.status(200).send("Error logged"); 
    }
});

exports.sendDailyReminders = onSchedule("30 13 * * *", async (event) => {
    const today = new Date().toISOString().split('T')[0];
    const usersSnapshot = await db.collection('users')
        .where('fcmToken', '!=', null)
        .get();

    const notifications = [];
    usersSnapshot.forEach(doc => {
        const user = doc.data();
        if (user.lastPracticeDate !== today) {
            notifications.push({
                token: user.fcmToken,
                notification: {
                    title: "Time to Practice! 🧮",
                    body: "Keep your streak alive! 15 minutes of practice is all it takes."
                }
            });
        }
    });

    if (notifications.length > 0) {
        await admin.messaging().sendEach(notifications);
    }
});

exports.createRazorpaySubscription = onCall(async (request) => {
    if (!request.auth || !request.auth.uid) {
        throw new HttpsError('unauthenticated', "User must be authenticated.");
    }
    const userId = request.auth.uid;
    const planId = request.data.planId;
    const amountInPaise = request.data.amountInRupees * 100;
    const authHeader = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');
    
    try {
        const orderRes = await fetch('https://api.razorpay.com/v1/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Basic ${authHeader}` },
            body: JSON.stringify({ amount: amountInPaise, currency: "INR", receipt: userId, notes: { userId: userId } })
        });
        const orderData = await orderRes.json();

        const subRes = await fetch('https://api.razorpay.com/v1/subscriptions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Basic ${authHeader}` },
            body: JSON.stringify({ plan_id: planId, customer_notify: 1, total_count: 12, notes: { userId: userId } })
        });
        const subData = await subRes.json();

        return { status: "success", subscriptionId: subData.id, orderId: orderData.id, amount: amountInPaise };
    } catch (error) {
        throw new HttpsError('internal', error.message);
    }
});

exports.createOneTimeOrder = onCall(async (request) => {
    if (!request.auth || !request.auth.uid) throw new HttpsError('unauthenticated', "Auth required.");
    const { amountInRupees, planDuration } = request.data;
    const userId = request.auth.uid;
    const amountInPaise = amountInRupees * 100;
    const authHeader = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');

    try {
        const response = await fetch('https://api.razorpay.com/v1/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Basic ${authHeader}` },
            body: JSON.stringify({
                amount: amountInPaise,
                currency: "INR",
                receipt: `ot_${userId.substring(0, 8)}_${Date.now()}`, 
                notes: { userId: userId, planDuration: planDuration.toString(), paymentType: "one_time" }
            })
        });
        const orderData = await response.json();
        return { status: "success", orderId: orderData.id, amount: orderData.amount };
    } catch (error) {
        throw new HttpsError('internal', error.message);
    }
});

exports.updateUserProfile = onCall(async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', "Auth required.");
    return { status: "success", message: "Update permitted." };
});
