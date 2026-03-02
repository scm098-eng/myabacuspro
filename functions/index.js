
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
// --- AUTOMATION: MONTHLY PROGRESS REPORTS ---
// ----------------------------------------------------

exports.sendMonthlyProgressReports = onSchedule({
    schedule: "30 4 1 * *",
    secrets: ["GMAIL_APP_PASSWORD"]
}, async (event) => {
    logger.info("Starting Monthly Progress Reports...");
    
    const usersSnapshot = await db.collection('users')
        .where('role', '==', 'student')
        .get();

    if (usersSnapshot.empty) return;

    const transporter = getTransporter();

    for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data();
        const points = userData.monthlyPoints || 0;

        const mailOptions = {
            from: `"My Abacus Pro Reports" <${GMAIL_USER}>`,
            to: userData.email,
            subject: `Your Monthly Progress Report: ${new Date().toLocaleString('default', { month: 'long' })} 📊`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
                    <h2 style="color: #2563eb; text-align: center;">Way to go, ${userData.firstName}!</h2>
                    <p>Here is how you performed on My Abacus Pro last month:</p>
                    <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                        <div style="display: inline-block; margin: 0 20px;">
                            <p style="font-size: 12px; color: #64748b; margin: 0;">Points Earned</p>
                            <p style="font-size: 24px; font-weight: bold; margin: 5px 0;">${points.toLocaleString()}</p>
                        </div>
                        <div style="display: inline-block; margin: 0 20px;">
                            <p style="font-size: 12px; color: #64748b; margin: 0;">Current Rank</p>
                            <p style="font-size: 24px; font-weight: bold; margin: 5px 0;">${userData.lastAwardedRank || 'Junior'}</p>
                        </div>
                    </div>
                    <p>Consistency is the secret to mental math mastery. Keep practicing every day to climb the Hall of Fame!</p>
                    <p style="text-align: center; margin-top: 30px;">
                        <a href="https://abacusace-mmnqw.web.app/dashboard" style="background: #2563eb; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Full Stats</a>
                    </p>
                </div>
            `
        };

        try {
            await transporter.sendMail(mailOptions);
        } catch (e) {
            logger.error(`Report failed for ${userData.email}:`, e);
        }
    }
});

// ----------------------------------------------------
// --- AUTOMATION: WEEKLY LEADERBOARD UPDATES ---
// ----------------------------------------------------

exports.sendWeeklyLeaderboardUpdates = onSchedule({
    schedule: "30 14 * * 0",
    secrets: ["GMAIL_APP_PASSWORD"]
}, async (event) => {
    const topPerformers = await db.collection('users')
        .where('role', '==', 'student')
        .orderBy('weeklyPoints', 'desc')
        .limit(3)
        .get();

    if (topPerformers.empty) return;

    const champions = topPerformers.docs.map((doc, i) => `${i+1}. ${doc.data().firstName} (${doc.data().weeklyPoints} pts)`).join('<br>');

    const subscribers = await db.collection('users')
        .where('role', '==', 'student')
        .get();

    const transporter = getTransporter();

    for (const sub of subscribers.docs) {
        const mailOptions = {
            from: `"My Abacus Pro Hall of Fame" <${GMAIL_USER}>`,
            to: sub.data().email,
            subject: `The Week's Champions are here! 🏆`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; text-align: center;">
                    <h2 style="color: #fbbf24;">Weekly Hall of Fame</h2>
                    <p>Meet this week's top performers:</p>
                    <div style="background: #fffbeb; padding: 20px; border-radius: 15px; border: 2px solid #fde68a;">
                        <p style="font-size: 18px; line-height: 1.6;">${champions}</p>
                    </div>
                    <p style="margin-top: 20px;">Ready to see your name here next week? Start your practice now!</p>
                    <a href="https://abacusace-mmnqw.web.app/game" style="color: #2563eb; font-weight: bold;">Play Bubble Game 🫧</a>
                </div>
            `
        };
        await transporter.sendMail(mailOptions).catch(e => logger.error("Leaderboard mail fail", e));
    }
});

// ----------------------------------------------------
// --- ADMIN: CUSTOM PROMOTIONAL CAMPAIGNS ---
// ----------------------------------------------------

exports.sendCustomPromotionalEmail = onCall({
    secrets: ["GMAIL_APP_PASSWORD"]
}, async (request) => {
    if (!request.auth || request.auth.token.role !== 'admin') {
        throw new HttpsError('permission-denied', "Admin only.");
    }

    const { subject, message, isTest, testEmail } = request.data;
    const transporter = getTransporter();

    if (isTest && testEmail) {
        await transporter.sendMail({
            from: `"My Abacus Pro" <${GMAIL_USER}>`,
            to: testEmail,
            subject: `[TEST] ${subject}`,
            html: `<div style="font-family: sans-serif;">${message}</div>`
        });
        return { status: "success", message: "Test sent." };
    }

    const targets = await db.collection('users')
        .where('role', '==', 'student')
        .get();

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
            logger.error(`Promo failed for ${doc.data().email}`);
        }
    }

    return { status: "success", recipients: count };
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

  if (freeUsersSnapshot.empty) {
    logger.info("No free users found for marketing.");
    return;
  }

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

  logger.info(`Campaign finished. Emails sent: ${sentCount}`);
});

exports.sendTestMarketingEmail = onCall({
    secrets: ["GMAIL_APP_PASSWORD"]
}, async (request) => {
    if (!request.auth || request.auth.token.role !== 'admin') {
        throw new HttpsError('permission-denied', "Only admins can trigger test emails.");
    }

    const testEmail = request.data.email || request.auth.token.email;
    const transporter = getTransporter();
    
    const mailOptions = {
        from: `"My Abacus Pro Test" <${GMAIL_USER}>`,
        to: testEmail,
        subject: "Marketing Campaign Test Email 🧪",
        html: `<p>This is a test of the automatic upgrade email system. If you see this, your Gmail App Password is working correctly!</p>`
    };

    try {
        await transporter.sendMail(mailOptions);
        return { status: "success", message: `Test email sent to ${testEmail}` };
    } catch (error) {
        logger.error("Test email failed:", error);
        throw new HttpsError('internal', error.message);
    }
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
    const dayOfMonth = new Date().getDate();
    
    const messages = {
        1: { en: "🚀 Day 1: New month, new goals! Let’s start with 15 mins.", mr: "नवीन महिना, नवीन ध्येय! १५ मिनिटे सराव करूया." },
        2: { en: "🧠 Feed your brain with some numbers today!", mr: "आज तुमच्या मेंदूला गणिताचे खाद्य द्या!" },
        3: { en: "🔥 Don't let your streak break! Log in now.", mr: "तुमची सरावाची लिंक तुटू देऊ नका! आताच लॉगिन करा." },
        4: { en: "⚡ Can you beat your time from yesterday? Try now!", mr: "कालचा तुमचा रेकॉर्ड तुम्ही आज मोडू शकता का? प्रयत्न करा!" },
        5: { en: "🐢 Slow and steady wins the race. Keep practicing!", mr: "सातत्य ठेवल्यानेच यश मिळते. सराव चालू ठेवा!" },
        6: { en: "🎯 Sharpen your focus with today's drill.", mr: "आजच्या सरावाने तुमची एकाग्रता वाढवा." },
        7: { en: "🏆 Finish today to unlock your Weekly Trophy!", mr: "साप्ताहिक ट्रॉफी मिळवण्यासाठी आजचा सराव पूर्ण करा!" },
        8: { en: "🆙 One step closer to the next Rank! Let's go.", mr: "पुढच्या रँकच्या दिशेने आणखी एक पाऊल! चला सुरुवात करूया." },
        9: { en: "🧩 Solve the puzzle of numbers today!", mr: "आज अंकांच्या कोड्यांचा सराव करा!" },
        10: { en: "✅ Aim for 100% accuracy today. You can do it!", mr: "आज १००% अचूकतेचे लक्ष्य ठेवा. तुम्हाला हे नक्की जमेल!" },
        11: { en: "🦸 Power up your super-brain on MyAbacusPro!", mr: "MyAbacusPro वर तुमच्या सुपर-ब्रेनची शक्ती वाढवा!" },
        12: { en: "🥊 Challenge yourself with 20 sums today.", mr: "आज स्वतःला २० गणिते सोडवण्याचे चॅलेंज द्या." },
        13: { en: "☁️ Imagine the beads. Visualize the success!", mr: "मणी डोळ्यासमोर आणा. यशाची कल्पना करा!" },
        14: { en: "✌️ Two weeks of greatness! Keep it up.", mr: "दोन आठवड्यांचे सातत्य! असेच चालू ठेवा." },
        15: { en: "🌗 Halfway through the month! Stay strong.", mr: "अर्धा महिना पूर्ण झाला! तुमचा उत्साह कमी होऊ देऊ नका." },
        16: { en: "💪 Success is built one day at a time.", mr: "यश हे दररोजच्या कष्टानेच मिळते." },
        17: { en: "🌱 Watch your math skills grow today.", mr: "आज तुमची गणितातील प्रगती पहा." },
        18: { en: "🥷 Time for Math Ninja practice! Log in now.", mr: "मॅथ निन्जा सरावाची वेळ झाली आहे! आताच लॉगिन करा." },
        19: { en: "🤔 What’s your new high score going to be?", mr: "तुमचा आजचा नवीन हाय-स्कोअर काय असेल?" },
        20: { en: "🎓 A 'Human Calculator' practices even on busy days.", mr: "'ह्युमन कॅल्क्युलेटर' कधीच सराव चुकवत नाहीत." },
        21: { en: "✅ 21 Days! Your habit is officially formed.", mr: "२१ दिवस पूर्ण! आता सराव ही तुमची सवय झाली आहे." },
        22: { en: "⭐ Excellence is not an act, but a habit.", mr: "उत्कृष्टता ही कृती नसून ती एक सवय आहे." },
        23: { en: "🏎️ Faster fingers, sharper mind! Start now.", mr: "वेगवान बोटे, तल्लख बुद्धी! आताच सुरू करा." },
        24: { en: "🎖️ Your hard work will pay off in class!", mr: "तुमचे कष्ट क्लासमध्ये फळाला येतील!" },
        25: { en: "🚩 Almost at the month-end goal! Push through.", mr: "महिन्याचे ध्येय जवळ आले आहे! जोमाने सराव करा." },
        26: { en: "📐 Discipline is the bridge to mastery.", mr: "शिस्त हाच प्रभुत्वाचा मार्ग आहे." },
        27: { en: "📝 Be ready for your next offline test!", mr: "तुमच्या पुढच्या ऑफलाइन परीक्षेसाठी तयार राहा!" },
        28: { en: "🏅 Climb higher on the leaderboard today!", mr: "आज लीडरबोर्डवर आणखी वरच्या स्थानी पोहोचा!" },
        29: { en: "🏃 Keep running towards your goal!", mr: "तुमच्या ध्येयाकडे धावत राहा!" },
        30: { en: "🎉 One day left! Celebrate with a great drill.", mr: "एकच दिवस उरला आहे! उत्साहाने सराव करा." },
        31: { en: "👑 Month Complete! You are an Abacus Hero.", mr: "महिना पूर्ण! तुम्ही 'ॲबॅकस हिरो' आहात." }
    };

    const currentMsg = messages[dayOfMonth] || messages[1];

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
                    body: `${currentMsg.en} / ${currentMsg.mr}`
                }
            });
        }
    });

    if (notifications.length > 0) {
        await admin.messaging().sendEach(notifications);
        logger.info(`Sent ${notifications.length} reminders.`);
    }
});

exports.createRazorpaySubscription = onCall(async (request) => {
    if (!request.auth || !request.auth.uid) {
        throw new HttpsError('unauthenticated', "User must be authenticated.");
    }
    if (!request.data.planId || !request.data.amountInRupees) {
        throw new HttpsError('invalid-argument', "Missing plan ID or amount.");
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
