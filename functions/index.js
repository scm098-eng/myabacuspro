
/**
 * Firebase Cloud Functions v2 (Node.js) Code
 * filename: functions/index.js
 */

// --- CORE V2 IMPORTS ---
const { setGlobalOptions } = require("firebase-functions/v2");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { onRequest, onCall, HttpsError } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const crypto = require('crypto');

// --- ADMIN SDK INITIALIZATION (REQUIRED) ---
const admin = require('firebase-admin');
if (admin.apps.length === 0) {
    admin.initializeApp();
}

// --- GLOBAL OPTIONS ---
setGlobalOptions({ maxInstances: 10 });
const db = admin.firestore();

// --- Configuration Setup (Standard Environment Variables) ---
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID; 
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

// 31 Unique Motivational Messages
const DAILY_MESSAGES = [
  { title: "New Start 🚀", body: "Day 1: New month, new goals! Let’s start with 15 mins. / नवीन महिना, नवीन ध्येय! १५ मिनिटे सराव करूया." },
  { title: "Brain Power 🧠", body: "Day 2: Feed your brain with some numbers today! / आज तुमच्या मेंदूला गणिताचे खाद्य द्या!" },
  { title: "Streak Alert 🔥", body: "Day 3: Don't let your streak break! Log in now. / तुमची सरावाची लिंक तुटू देऊ नका! आताच लॉगिन करा." },
  { title: "Speed Test ⚡", body: "Day 4: Can you beat your time from yesterday? Try now! / कालचा तुमचा रेकॉर्ड तुम्ही आज मोडू शकता का? प्रयत्न करा!" },
  { title: "Consistency 🐢", body: "Day 5: Slow and steady wins the race. Keep practicing! / सातत्य ठेवल्यानेच यश मिळते. सराव चालू ठेवा!" },
  { title: "Focus 🎯", body: "Day 6: Sharpen your focus with today's drill. / आजच्या सरावाने तुमची एकाग्रता वाढवा." },
  { title: "Weekly Goal 🏆", body: "Day 7: Finish today to unlock your Weekly Trophy! / साप्ताहिक ट्रॉफी मिळवण्यासाठी आजचा सराव पूर्ण करा!" },
  { title: "Level Up 🆙", body: "Day 8: One step closer to the next Rank! Let's go. / पुढच्या रँकच्या दिशेने आणखी एक पाऊल! चला सुरुवात करूया." },
  { title: "Logic 🧩", body: "Day 9: Solve the puzzle of numbers today! / आज अंकांच्या कोड्यांचा सराव करा!" },
  { title: "Accuracy ✅", body: "Day 10: Aim for 100% accuracy today. You can do it! / आज १००% अचूकतेचे लक्ष्य ठेवा. तुम्हाला हे नक्की जमेल!" },
  { title: "Super-Brain 🦸", body: "Day 11: Power up your super-brain on MyAbacusPro! / MyAbacusPro वर तुमच्या सुपर-ब्रेनची शक्ती वाढवा!" },
  { title: "Challenge 🥊", body: "Day 12: Challenge yourself with 20 sums today. / आज स्वतःला २० गणिते सोडवण्याचे चॅलेंज द्या." },
  { title: "Mind Math ☁️", body: "Day 13: Imagine the beads. Visualize the success! / मणी डोळ्यासमोर आणा. यशाची कल्पना करा!" },
  { title: "Fortnight ✌️", body: "Day 14: Two weeks of greatness! Keep it up. / दोन आठवड्यांचे सातत्य! असेच चालू ठेवा." },
  { title: "Halfway 🌗", body: "Day 15: Halfway through the month! Stay strong. / अर्धा महिना पूर्ण झाला! तुमचा उत्साह कमी होऊ देऊ नका." },
  { title: "Determination 💪", body: "Day 16: Success is built one day at a time. / यश हे दररोजच्या कष्टानेच मिळते." },
  { title: "Growth 🌱", body: "Day 17: Watch your math skills grow today. / आज तुमची गणितातील प्रगती पहा." },
  { title: "Ninja Mode 🥷", body: "Day 18: Time for Math Ninja practice! Log in now. / मॅथ निन्जा सरावाची वेळ झाली आहे!" },
  { title: "Curiosity 🤔", body: "Day 19: What’s your new high score going to be? / तुमचा आजचा नवीन हाय-स्कोअर काय असेल?" },
  { title: "Future Genius 🎓", body: "Day 20: A 'Human Calculator' practices even on busy days. / 'ह्युमन कॅल्क्युलेटर' कधीच सराव चुकवत नाहीत." },
  { title: "Habit ✅", body: "Day 21: 21 Days! Your habit is officially formed. / २१ दिवस पूर्ण! आता सराव ही तुमची सवय झाली आहे." },
  { title: "Excellence ⭐", body: "Day 22: Excellence is not an act, but a habit. / उत्कृष्टता ही कृती नसून ती एक सवय आहे." },
  { title: "Quickness 🏎️", body: "Day 23: Faster fingers, sharper mind! Start now. / वेगवान बोटे, तल्लख बुद्धी! आताच सुरू करा." },
  { title: "Dedication 🎖️", body: "Day 24: Your hard work will pay off in class! / तुमचे कष्ट क्लासमध्ये फळाला येतील!" },
  { title: "Victory 🚩", body: "Day 25: Almost at the month-end goal! Push through. / महिन्याचे ध्येय जवळ आले आहे! जोमाने सराव करा." },
  { title: "Discipline 📐", body: "Day 26: Discipline is the bridge to mastery. / शिस्त हाच प्रभुत्वाचा मार्ग आहे." },
  { title: "Preparation 📝", body: "Day 27: Be ready for your next offline test! / तुमच्या पुढच्या ऑफलाइन परीक्षेसाठी तयार राहा!" },
  { title: "Top Rank 🏅", body: "Day 28: Climb higher on the leaderboard today! / आज लीडरबोर्डवर आणखी वरच्या स्थानी पोहोचा!" },
  { title: "Endurance 🏃", body: "Day 29: Keep running towards your goal! / तुमच्या ध्येयाकडे धावत राहा!" },
  { title: "Celebration 🎉", body: "Day 30: One day left! Celebrate with a great drill. / एकच दिवस उरला आहे! उत्साहाने सराव करा." },
  { title: "Mission Met 👑", body: "Day 31: Month Complete! You are an Abacus Hero. / महिना पूर्ण! तुम्ही 'ॲबॅकस हिरो' आहात." }
];

// Scheduled Task: Daily at 7:00 PM IST (13:30 UTC)
exports.sendDailyReminders = onSchedule("30 13 * * *", async (event) => {
  logger.info("Starting Daily Reminder Dispatch...");
  const today = new Date();
  const dayOfMonth = today.getDate(); // 1-31
  const todayStr = today.toISOString().split('T')[0];
  const message = DAILY_MESSAGES[dayOfMonth - 1] || DAILY_MESSAGES[0];

  // Find students who haven't practiced today and have an FCM token
  const studentsRef = db.collection('users');
  const query = studentsRef
    .where('role', '==', 'student')
    .where('lastPracticeDate', '!=', todayStr);

  const snapshot = await query.get();
  if (snapshot.empty) {
    logger.info("No students found who need reminders today.");
    return;
  }

  const tokens = [];
  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.fcmToken) {
      tokens.push(data.fcmToken);
    }
  });

  if (tokens.length === 0) {
    logger.info("No FCM tokens registered for targeted students.");
    return;
  }

  const notification = {
    notification: {
      title: message.title,
      body: message.body,
    },
    tokens: tokens,
  };

  try {
    const response = await admin.messaging().sendEachForMulticast(notification);
    logger.info(`Successfully sent ${response.successCount} reminders.`);
    if (response.failureCount > 0) {
      logger.warn(`${response.failureCount} reminders failed to send.`);
    }
  } catch (error) {
    logger.error("Error sending multicast notification:", error);
  }
});

// Helper to create the auth header safely
function getRazorpayAuth() {
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
        logger.error("Missing Razorpay API Keys in environment variables.");
        return ""; 
    }
    return Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');
}

// ------------------------------------------
// --- 1. RAZORPAY WEBHOOK (HTTP FUNCTION) ---
// ------------------------------------------
exports.razorpaywebhook = onRequest(async (request, response) => {
    logger.info("Razorpay Webhook Triggered!", { structuredData: true });

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET; 
    const signature = request.headers['x-razorpay-signature'];

    if (!webhookSecret) {
        logger.error("Configuration Error: RAZORPAY_WEBHOOK_SECRET is missing.");
        return response.status(500).send("Configuration Error");
    }

    const rawBodyBuffer = request.rawBody; 
    if (!rawBodyBuffer) return response.status(400).send("Bad Request: Missing raw body");
    
    const rawBodyString = rawBodyBuffer;
    const expectedSignature = crypto.createHmac('sha256', webhookSecret).update(rawBodyString).digest('hex');

    if (expectedSignature !== signature) {
        logger.error("CRITICAL ERROR: Signature Mismatch!");
        return response.status(200).send('Validation Failed'); 
    }

    const payload = request.body;
    const eventType = payload.event;
    const eventId = request.headers['x-razorpay-event-id']; 

    const eventRef = db.collection('processedWebhooks').doc(eventId);
    const eventDoc = await eventRef.get();

    if (eventDoc.exists) {
        logger.warn(`Duplicate event skipped: ${eventId}`);
        return response.status(200).send('Already processed');
    }
    
    try {
        const notes = payload.payload?.order?.entity?.notes || 
                      payload.payload?.subscription?.entity?.notes || 
                      payload.payload?.payment?.entity?.notes || 
                      payload.payload?.refund?.entity?.notes || {};
        
        let userId = notes.userId || 'UNKNOWN';
        const subEntity = payload.payload?.subscription?.entity;
        const subId = subEntity?.id || payload.payload?.payment?.entity?.subscription_id;

        logger.info(`Processing ${eventType} for User: ${userId}`);

        switch (eventType) {
            case 'order.paid': {
                if (notes.paymentType === "one_time" && userId !== 'UNKNOWN') {
                    const monthsToAdd = parseInt(notes.planDuration) || 0;
                    let planTier = "monthly"; 
                    if (monthsToAdd === 6) planTier = "6months";
                    if (monthsToAdd === 12) planTier = "annual";
                    const expiryDate = new Date();
                    expiryDate.setMonth(expiryDate.getMonth() + monthsToAdd);

                    await db.collection('users').doc(userId).set({ 
                        subscriptionStatus: 'pro',
                        subscriptionType: 'one-time',
                        activeTier: planTier,
                        lastPaymentId: payload.payload?.payment?.entity?.id,
                        expiresAt: admin.firestore.Timestamp.fromDate(expiryDate),
                        updatedAt: admin.firestore.FieldValue.serverTimestamp()
                    }, { merge: true });

                    await admin.auth().setCustomUserClaims(userId, { subscription: 'pro' });
                    logger.info(`SUCCESS: One-time ${monthsToAdd}m activated for ${userId}`);
                }
                break;
            }

            case 'subscription.activated':
            case 'subscription.charged': {
                if (userId !== 'UNKNOWN') {
                    await db.collection('users').doc(userId).set({ 
                        subscriptionStatus: 'pro',
                        subscriptionType: 'recurring',
                        activeTier: 'monthly',
                        subscriptionId: subId,
                        updatedAt: admin.firestore.FieldValue.serverTimestamp()
                    }, { merge: true });
                    
                    await admin.auth().setCustomUserClaims(userId, { subscription: 'pro' });
                } 
                break;
            }

            case 'refund.processed': {
                const paymentId = payload.payload?.refund?.entity?.payment_id;
                if (userId === 'UNKNOWN') {
                    const userSnap = await db.collection('users').where('lastPaymentId', '==', paymentId).limit(1).get();
                    if (!userSnap.empty) userId = userSnap.docs[0].id;
                }

                if (userId !== 'UNKNOWN') {
                    await db.collection('users').doc(userId).update({
                        subscriptionStatus: 'free',
                        subscriptionType: 'none',
                        expiresAt: admin.firestore.FieldValue.delete(),
                        updatedAt: admin.firestore.FieldValue.serverTimestamp()
                    });
                    await admin.auth().setCustomUserClaims(userId, { subscription: null });
                    logger.info(`REFUND SUCCESS: User ${userId} downgraded to free.`);
                }
                break;
            }

            case 'subscription.cancelled':
            case 'subscription.expired': {
                if (userId !== 'UNKNOWN') {
                    await db.collection('users').doc(userId).update({ 
                        subscriptionStatus: 'free',
                        subscriptionId: admin.firestore.FieldValue.delete()
                    });
                    await admin.auth().setCustomUserClaims(userId, { subscription: null });
                }
                break;
            }
        }

        await eventRef.set({ timestamp: admin.firestore.FieldValue.serverTimestamp(), event: eventType, userId });
        return response.status(200).send("OK");

    } catch (error) {
        logger.error(`Fatal Error on ${eventType}:`, error);
        return response.status(200).send("Error logged"); 
    }
});

// ----------------------------------------------------
// --- 2. CREATE RAZORPAY SUBSCRIPTION (ORDER FLOW FIX) ---
// ----------------------------------------------------
exports.createRazorpaySubscription = onCall(async (request) => {
    if (!request.auth || !request.auth.uid) {
        throw new HttpsError('unauthenticated', "User must be authenticated to create a subscription.");
    }

    if (!request.data.planId || !request.data.amountInRupees) {
        throw new HttpsError('invalid-argument', "Missing plan ID or amount.");
    }

    const userId = request.auth.uid;
    const planId = request.data.planId;
    const amountInPaise = request.data.amountInRupees * 100;
    const authHeader = getRazorpayAuth(); 
    
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
        throw new HttpsError('internal', "Razorpay API keys are not configured correctly.");
    }
    
    try {
        const orderPayload = {
            amount: amountInPaise, 
            currency: "INR",
            receipt: userId, 
            notes: { userId: userId, purpose: "initial_subscription_payment" }
        };

        const createOrderResponse = await fetch('https://api.razorpay.com/v1/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${authHeader}`
            },
            body: JSON.stringify(orderPayload)
        });

        const orderData = await createOrderResponse.json();

        if (!createOrderResponse.ok) {
            logger.error("Razorpay API Error on Order Create:", { data: orderData });
            throw new HttpsError('unknown', `Razorpay Order API Error: ${orderData.error?.description || 'Unknown order error'}`);
        }
        const orderId = orderData.id;

        const subPayload = {
            plan_id: planId,
            customer_notify: 1, 
            total_count: 12, 
            notes: { userId: userId }
        };
        
        const createSubResponse = await fetch('https://api.razorpay.com/v1/subscriptions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${authHeader}`
            },
            body: JSON.stringify(subPayload)
        });

        const subData = await createSubResponse.json();

        if (!createSubResponse.ok) {
             logger.error("Razorpay API Error on Subscription Create:", { data: subData });
             throw new HttpsError('unknown', `Razorpay Subscription API Error: ${subData.error?.description || 'Unknown sub error'}`);
        }
        
        const subscriptionId = subData.id;

        return {
            status: "success",
            subscriptionId: subscriptionId,
            orderId: orderId, 
            amount: amountInPaise 
        };

    } catch (error) {
        if (error.code) throw error; 
        throw new HttpsError('internal', `Internal server error: Could not process subscription. > ${error.message}`);
    }
});

exports.createOneTimeOrder = onCall(async (request) => {
    if (!request.auth || !request.auth.uid) {
        throw new HttpsError('unauthenticated', "User must be authenticated.");
    }

    const { amountInRupees, planDuration } = request.data;
    const userId = request.auth.uid;
    const amountInPaise = amountInRupees * 100;
    const authHeader = getRazorpayAuth();

    try {
        const orderPayload = {
            amount: amountInPaise,
            currency: "INR",
            receipt: `ot_${userId.substring(0, 8)}_${Date.now()}`, 
            notes: { 
                userId: userId, 
                planDuration: planDuration.toString(),
                paymentType: "one_time" 
            }
        };

        const response = await fetch('https://api.razorpay.com/v1/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${authHeader}`
            },
            body: JSON.stringify(orderPayload)
        });

        const orderData = await response.json();

        if (!response.ok) {
            throw new HttpsError('unknown', `Razorpay Order Error: ${orderData.error?.description}`);
        }

        return {
            status: "success",
            orderId: orderData.id,
            amount: orderData.amount
        };

    } catch (error) {
        throw new HttpsError('internal', error.message);
    }
});

exports.updateUserProfile = onCall(async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', "The user is not authenticated.");
    }
    return { status: "success", message: "Profile updated successfully." };
});
