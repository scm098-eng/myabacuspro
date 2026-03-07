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

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID; 
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;
const GMAIL_USER = 'myabacuspro@gmail.com';

function getTransporter() {
    const GMAIL_PASS = process.env.GMAIL_APP_PASSWORD;
    if (!GMAIL_PASS) logger.error("CRITICAL: GMAIL_APP_PASSWORD missing.");
    return nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // Use SSL
        auth: {
            user: GMAIL_USER,
            pass: GMAIL_PASS,
        },
    });
}

exports.sendCustomPromotionalEmail = onCall({
    secrets: ["GMAIL_APP_PASSWORD"]
}, async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', "Login required.");
    try {
        const userDoc = await db.collection('users').doc(request.auth.uid).get();
        if (!userDoc.exists || userDoc.data().role !== 'admin') throw new HttpsError('permission-denied', "Admin only.");
        
        const { subject, message, isTest, testEmail, targetAudience } = request.data;
        const transporter = getTransporter();
        
        if (isTest && testEmail) {
            await transporter.sendMail({ from: `"My Abacus Pro" <${GMAIL_USER}>`, to: testEmail, subject: `[TEST] ${subject}`, html: message });
            return { status: "success" };
        }
        
        let query = db.collection('users');
        if (targetAudience === 'teachers') {
            query = query.where('role', '==', 'teacher').where('status', '==', 'approved');
        } else if (targetAudience === 'pro') {
            query = query.where('subscriptionStatus', '==', 'pro');
        } else if (targetAudience === 'free') {
            query = query.where('subscriptionStatus', '==', 'free');
        }
        
        const targets = await query.get();
        let count = 0;
        const sendPromises = [];

        for (const doc of targets.docs) {
            const data = doc.data();
            if (!data.email) continue;
            sendPromises.push(
                transporter.sendMail({ from: `"My Abacus Pro" <${GMAIL_USER}>`, to: data.email, subject, html: message })
                .then(() => { count++; })
                .catch(e => { logger.error(`Email failed for ${data.email}`, e); })
            );
        }
        
        await Promise.all(sendPromises);
        
        // Log campaign stats
        await db.collection('stats').doc('marketing').set({
            emailsSent: admin.firestore.FieldValue.increment(count),
            lastCampaignAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        return { status: "success", recipients: count };
    } catch (err) { 
        logger.error("Failed to send promo email", err);
        throw new HttpsError('internal', err.message); 
    }
});

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
        const notes = payload.payload?.order?.entity?.notes || payload.payload?.subscription?.entity?.notes || payload.payload?.payment?.entity?.notes || {};
        let userId = notes.userId || 'UNKNOWN';
        if (eventType === 'subscription.activated' || eventType === 'order.paid') {
            if (userId !== 'UNKNOWN') {
                await db.collection('users').doc(userId).set({ subscriptionStatus: 'pro', updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
                await admin.auth().setCustomUserClaims(userId, { subscription: 'pro' });
            } 
        }
        await eventRef.set({ timestamp: admin.firestore.FieldValue.serverTimestamp(), event: eventType, userId });
        return response.status(200).send("OK");
    } catch (error) { return response.status(200).send("Error logged"); }
});

exports.sendDailyReminders = onSchedule("30 13 * * *", async (event) => {
    const today = new Date().toISOString().split('T')[0];
    const usersSnapshot = await db.collection('users').where('fcmToken', '!=', null).get();
    const notifications = [];
    usersSnapshot.forEach(doc => {
        const user = doc.data();
        if (user.lastPracticeDate !== today) {
            notifications.push({ token: user.fcmToken, notification: { title: "Time to Practice! 🧮", body: "Keep your streak alive!" } });
        }
    });
    if (notifications.length > 0) await admin.messaging().sendEach(notifications);
});

exports.createRazorpaySubscription = onCall(async (request) => {
    if (!request.auth || !request.auth.uid) throw new HttpsError('unauthenticated', "Auth required.");
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
    } catch (error) { throw new HttpsError('internal', error.message); }
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
            body: JSON.stringify({ amount: amountInPaise, currency: "INR", receipt: `ot_${userId.substring(0, 8)}_${Date.now()}`, notes: { userId: userId, planDuration: planDuration.toString(), paymentType: "one_time" } })
        });
        const orderData = await response.json();
        return { status: "success", orderId: orderData.id, amount: orderData.amount };
    } catch (error) { throw new HttpsError('internal', error.message); }
});