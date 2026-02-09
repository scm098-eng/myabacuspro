/**
 * Firebase Cloud Functions v2 (Node.js) Code
 * filename: functions/index.js
 * FIX APPLIED: createRazorpaySubscription now creates a standard ORDER ID for the first 
 * payment and returns it to the client, which fixes the 'id provided does not exist' 
 * error caused by mobile number prefill conflicts.
 */

// --- CORE V2 IMPORTS ---
const { setGlobalOptions } = require("firebase-functions/v2");
// IMPORTANT: Include HttpsError for proper client-side error handling
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

// Helper to create the auth header safely
function getRazorpayAuth() {
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
        logger.error("Missing Razorpay API Keys in environment variables.");
        return ""; 
    }
    return Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');
}

/**
 * Helper function to extract the Firebase userId from various potential locations 
 * within the Razorpay webhook payload.
 */
function extractUserId(payload) {
    let userId = payload.payload?.subscription?.entity?.notes?.userId;
    if (userId) return userId;
    userId = payload.payload?.payment?.entity?.notes?.userId;
    if (userId) return userId;
    userId = payload.payload?.order?.entity?.notes?.userId;
    if (userId) return userId;
    userId = payload.payload?.invoice?.entity?.notes?.userId;
    if (userId) return userId;
    return 'UNKNOWN';
}

// ------------------------------------------
// --- 1. RAZORPAY WEBHOOK (HTTP FUNCTION) ---
// ------------------------------------------
exports.razorpaywebhook = onRequest(async (request, response) => {
    logger.info("Razorpay Webhook Triggered!", { structuredData: true });

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET; 
    const signature = request.headers['x-razorpay-signature'];

    logger.info("Razorpay Webhook Triggered!");
        if (!webhookSecret) {
            logger.error("SECRET NOT FOUND! Check Firebase Secret Manager.");
        } else {
            // Logs first 3 chars and total length to verify match
            logger.info(`Secret Check: Starts with "${webhookSecret.substring(0, 3)}" | Length: ${webhookSecret.length}`);
        }

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
        // Extracting User ID from notes
        const notes = payload.payload?.order?.entity?.notes || 
                      payload.payload?.subscription?.entity?.notes || 
                      payload.payload?.payment?.entity?.notes || 
                      payload.payload?.refund?.entity?.notes || {}; // Added refund notes check
        
        let userId = notes.userId || 'UNKNOWN';
        const subEntity = payload.payload?.subscription?.entity;
        const subId = subEntity?.id || payload.payload?.payment?.entity?.subscription_id;

        logger.info(`Processing ${eventType} for User: ${userId}`);

        switch (eventType) {
            case 'order.paid': {
                if (notes.paymentType === "one_time" && userId !== 'UNKNOWN') {
                    const monthsToAdd = parseInt(notes.planDuration) || 0;
                    let planTier = "monthly"; // default
                    if (monthsToAdd === 6) planTier = "6months";
                    if (monthsToAdd === 12) planTier = "annual";
                    const expiryDate = new Date();
                    expiryDate.setMonth(expiryDate.getMonth() + monthsToAdd);

                    await db.collection('users').doc(userId).set({ 
                        subscriptionStatus: 'pro',
                        subscriptionType: 'one-time',
                        activeTier: planTier,
                        lastPaymentId: payload.payload?.payment?.entity?.id, // Store for refund tracking
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

            // --- NEW: HANDLE REFUNDS ---
            case 'refund.processed': {
                const paymentId = payload.payload?.refund?.entity?.payment_id;
                
                // If userId is UNKNOWN in notes, find user by paymentId
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
    // 1. Authentication Check
    if (!request.auth || !request.auth.uid) {
        throw new HttpsError('unauthenticated', "User must be authenticated to create a subscription.");
    }

    // Ensure client sends both planId AND amount in Rupees
    if (!request.data.planId || !request.data.amountInRupees) {
        throw new HttpsError('invalid-argument', "Missing plan ID or amount.");
    }

    const userId = request.auth.uid;
    const planId = request.data.planId;
    const amountInPaise = request.data.amountInRupees * 100; // Amount must be in paise
    const authHeader = getRazorpayAuth(); 
    
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
        throw new HttpsError('internal', "Razorpay API keys are not configured correctly.");
    }
    
    try {
        logger.info(`Starting subscription setup for user ${userId} with plan ${planId}`, { structuredData: true });

        // =================================================================
        // --- STEP 1: Create a standard Order (to handle the first payment) ---
        // =================================================================
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
        logger.info(`Order created successfully: ${orderId}`);


        // ==============================================================
        // --- STEP 2: Create Subscription ---
        // ==============================================================
        const subPayload = {
            plan_id: planId,
            customer_notify: 1, 
            total_count: 12, 
            notes: { userId: userId } // Critical for Webhook linking
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
        logger.info(`Subscription created: ${subscriptionId}`);

        // ==============================================================
        // --- STEP 3: Return required IDs to the client ---
        // ==============================================================
        return {
            status: "success",
            message: "Subscription and Order created",
            subscriptionId: subscriptionId,
            // CRITICAL: Return the new Order ID for the client checkout 'order_id'
            orderId: orderId, 
            amount: amountInPaise 
        };

    } catch (error) {
        if (error.code) throw error; 
        
        logger.error("Failed to process Razorpay subscription:", error);
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
            // FIX: Use only the first 8 chars of UID + timestamp to stay under 40 chars
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

// ------------------------------------------
// --- 3. OTHER CALLABLE FUNCTION (FIXED) ---
// ------------------------------------------
exports.updateUserProfile = onCall(async (request) => {
    if (!request.auth) {
        // Use unauthenticated HttpsError
        throw new HttpsError('unauthenticated', "The user is not authenticated.");
    }
    
    logger.info(`Updating profile for user: ${request.auth.uid}`, { structuredData: true });
    
    return { status: "success", message: "Profile updated successfully." };
});