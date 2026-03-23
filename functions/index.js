
/**
 * Firebase Cloud Functions v2 (Node.js) Code
 * filename: functions/index.js
 */

const { setGlobalOptions } = require("firebase-functions/v2");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const nodemailer = require('nodemailer');

const admin = require('firebase-admin');
if (admin.apps.length === 0) {
    admin.initializeApp();
}

setGlobalOptions({ maxInstances: 10, timeoutSeconds: 540, memory: '1GiB' });
const db = admin.firestore();

const GMAIL_USER = 'myabacuspro@gmail.com';

/**
 * Safely creates a transporter using the provided password.
 */
function getTransporter(password) {
    if (!password) {
        logger.error("CRITICAL: GMAIL_APP_PASSWORD missing.");
        throw new Error("SMTP Auth failed");
    }
    return nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, 
        auth: {
            user: GMAIL_USER,
            pass: password,
        },
    });
}

/**
 * Helper to get the UTC Monday key (YYYY-MM-DD)
 */
function getUTCMondayKey() {
    const now = new Date();
    const day = now.getUTCDay();
    const diff = (day === 0 ? 6 : day - 1); 
    const monday = new Date(now);
    monday.setUTCDate(now.getUTCDate() - diff);
    monday.setUTCHours(0, 0, 0, 0);
    return monday.toISOString().split('T')[0];
}

/**
 * Helper to get the UTC Month key (YYYY-MM)
 */
function getUTCMonthKey() {
    const now = new Date();
    return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
}

/**
 * Scheduled: Every Monday at 00:00 UTC
 */
exports.resetWeeklyPoints = onSchedule("0 0 * * 1", async (event) => {
    logger.info("Starting Weekly Points Reset & Winner Declaration");
    const currentWeekKey = getUTCMondayKey();

    try {
        // 1. Declare Winner (highest weekly points from the period JUST ENDING)
        const topUserSnap = await db.collection('users')
            .where('role', '==', 'student')
            .orderBy('weeklyPoints', 'desc')
            .limit(1)
            .get();

        if (!topUserSnap.empty) {
            const winner = topUserSnap.docs[0].data();
            if ((winner.weeklyPoints || 0) > 0) {
                await db.collection('stats').doc('leaderboard').set({
                    lastWeeklyWinner: {
                        uid: topUserSnap.docs[0].id,
                        name: `${winner.firstName} ${winner.surname}`,
                        photo: winner.profilePhoto || '',
                        points: winner.weeklyPoints || 0,
                        declaredAt: admin.firestore.FieldValue.serverTimestamp(),
                        weekKey: currentWeekKey
                    }
                }, { merge: true });
                logger.info(`Winner declared: ${winner.firstName} ${winner.surname} with ${winner.weeklyPoints} pts.`);
            }
        }

        // 2. Reset all students
        const usersSnap = await db.collection('users').where('role', '==', 'student').get();
        let batch = db.batch();
        let count = 0;

        for (const userDoc of usersSnap.docs) {
            batch.update(userDoc.ref, {
                weeklyPoints: 0,
                lastWeeklyReset: currentWeekKey,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            count++;

            if (count === 500) {
                await batch.commit();
                batch = db.batch();
                count = 0;
            }
        }

        if (count > 0) {
            await batch.commit();
        }
        
        logger.info(`Successfully reset weekly points for ${usersSnap.size} students for week ${currentWeekKey}.`);
    } catch (err) {
        logger.error("Weekly reset failed", err);
    }
});

/**
 * Scheduled: 1st of every month at 00:00 UTC
 */
exports.resetMonthlyPoints = onSchedule("0 0 1 * *", async (event) => {
    logger.info("Starting Monthly Points Reset");
    const currentMonthKey = getUTCMonthKey();

    try {
        // Declare Monthly Winner
        const topUserSnap = await db.collection('users')
            .where('role', '==', 'student')
            .orderBy('monthlyPoints', 'desc')
            .limit(1)
            .get();

        if (!topUserSnap.empty) {
            const winner = topUserSnap.docs[0].data();
            if ((winner.monthlyPoints || 0) > 0) {
                await db.collection('stats').doc('leaderboard').set({
                    lastMonthlyWinner: {
                        uid: topUserSnap.docs[0].id,
                        name: `${winner.firstName} ${winner.surname}`,
                        photo: winner.profilePhoto || '',
                        points: winner.monthlyPoints || 0,
                        declaredAt: admin.firestore.FieldValue.serverTimestamp(),
                        monthKey: currentMonthKey
                    }
                }, { merge: true });
            }
        }

        const usersSnap = await db.collection('users').where('role', '==', 'student').get();
        let batch = db.batch();
        let count = 0;

        for (const userDoc of usersSnap.docs) {
            batch.update(userDoc.ref, {
                monthlyPoints: 0,
                lastMonthlyReset: currentMonthKey,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            count++;

            if (count === 500) {
                await batch.commit();
                batch = db.batch();
                count = 0;
            }
        }

        if (count > 0) {
            await batch.commit();
        }
        
        logger.info(`Successfully reset monthly points for ${usersSnap.size} students for ${currentMonthKey}.`);
    } catch (err) {
        logger.error("Monthly reset failed", err);
    }
});

/**
 * Generates a 6-digit OTP and sends it via email.
 */
exports.sendVerificationOTP = onCall({
    secrets: ["GMAIL_APP_PASSWORD"]
}, async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', "Login required.");
    const userId = request.auth.uid;
    const email = request.auth.token.email;
    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    try {
        await db.collection('users').doc(userId).set({
            pendingOTP: otp,
            otpExpiresAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 10 * 60 * 1000))
        }, { merge: true });

        const transporter = getTransporter(process.env.GMAIL_APP_PASSWORD);
        await transporter.sendMail({
            from: `"My Abacus Pro Verification" <${GMAIL_USER}>`,
            to: email,
            subject: `${otp} is your verification code`,
            html: `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 500px; margin: auto;">
                    <h2 style="color: #2563eb; text-align: center;">Verify Your Account</h2>
                    <p>Welcome to My Abacus Pro! Please use the following code to verify your email address:</p>
                    <div style="background: #f8fafc; padding: 20px; border-radius: 8px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1e293b; border: 1px solid #e2e8f0;">
                        ${otp}
                    </div>
                    <p style="margin-top: 20px; font-size: 14px; color: #64748b; text-align: center;">This code will expire in 10 minutes.</p>
                </div>
            `
        });

        return { status: "success" };
    } catch (err) {
        logger.error("Failed to send OTP", err);
        throw new HttpsError('internal', "Could not send verification code.");
    }
});

/**
 * Validates the OTP and updates Auth/Firestore status.
 */
exports.verifyEmailWithOTP = onCall(async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', "Login required.");
    const { otp } = request.data;
    const userId = request.auth.uid;

    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) throw new HttpsError('not-found', "User not found.");

    const data = userDoc.data();
    if (!data.pendingOTP || data.pendingOTP !== otp) {
        throw new HttpsError('invalid-argument', "Invalid verification code.");
    }

    if (data.otpExpiresAt.toDate() < new Date()) {
        throw new HttpsError('deadline-exceeded', "Code has expired. Please request a new one.");
    }

    try {
        await admin.auth().updateUser(userId, { emailVerified: true });
        
        await db.collection('users').doc(userId).update({
            emailVerified: true,
            pendingOTP: admin.firestore.FieldValue.delete(),
            otpExpiresAt: admin.firestore.FieldValue.delete()
        });

        return { status: "success" };
    } catch (err) {
        logger.error("OTP Verification failed", err);
        throw new HttpsError('internal', "Verification process failed.");
    }
});
