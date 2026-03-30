
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
 * Helper to get the UTC Monday key (YYYY-MM-DD) for TODAY
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
 * Helper to get the UTC Monday key for the WEEK THAT JUST ENDED
 */
function getUTCPreviousMondayKey() {
    const now = new Date();
    const day = now.getUTCDay();
    const diff = (day === 0 ? 6 : day - 1) + 7; // Monday 7 days ago
    const prevMonday = new Date(now);
    prevMonday.setUTCDate(now.getUTCDate() - diff);
    prevMonday.setUTCHours(0, 0, 0, 0);
    return prevMonday.toISOString().split('T')[0];
}

/**
 * Helper to get the UTC Month key (YYYY-MM)
 */
function getUTCMonthKey() {
    const now = new Date();
    return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
}

/**
 * Helper to get the UTC Month key for the MONTH THAT JUST ENDED
 */
function getUTCPreviousMonthKey() {
    const now = new Date();
    now.setUTCMonth(now.getUTCMonth() - 1);
    return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
}

/**
 * Scheduled: Every Monday at 00:00 UTC
 */
exports.resetWeeklyPoints = onSchedule("0 0 * * 1", async (event) => {
    logger.info("Starting Weekly Points Reset & Winner Declaration");
    const currentWeekKey = getUTCMondayKey();
    const lastWeekKey = getUTCPreviousMondayKey();

    try {
        // 1. Declare Winner (highest weekly points from the period JUST ENDING)
        // We filter by lastWeekKey to ensure we use the correct index and ignore stale data
        const topUserSnap = await db.collection('users')
            .where('role', '==', 'student')
            .where('lastWeeklyReset', '==', lastWeekKey)
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
                        weekKey: lastWeekKey
                    }
                }, { merge: true });
                logger.info(`Weekly Winner declared: ${winner.firstName} with ${winner.weeklyPoints} pts.`);
            }
        } else {
            logger.info("No active students found for weekly winner declaration.");
        }

        // 2. Reset all students whose last reset was the previous week
        const usersSnap = await db.collection('users')
            .where('role', '==', 'student')
            .where('lastWeeklyReset', '==', lastWeekKey)
            .get();
            
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
        
        logger.info(`Successfully reset weekly points for ${usersSnap.size} students.`);
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
    const lastMonthKey = getUTCPreviousMonthKey();

    try {
        // Declare Monthly Winner
        const topUserSnap = await db.collection('users')
            .where('role', '==', 'student')
            .where('lastMonthlyReset', '==', lastMonthKey)
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
                        monthKey: lastMonthKey
                    }
                }, { merge: true });
                logger.info(`Monthly Winner declared: ${winner.firstName}`);
            }
        }

        const usersSnap = await db.collection('users')
            .where('role', '==', 'student')
            .where('lastMonthlyReset', '==', lastMonthKey)
            .get();
            
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
        
        logger.info(`Successfully reset monthly points for ${usersSnap.size} students.`);
    } catch (err) {
        logger.error("Monthly reset failed", err);
    }
});

/**
 * Transactional Email Transport
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
 * Birthday Wish Template (Server Side)
 */
const birthdayWishHTML = (userName) => `
  <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 2px solid #ec4899; border-radius: 20px; background: #fffafb;">
    <div style="text-align: center; margin-bottom: 25px;">
      <div style="font-size: 60px;">🎂</div>
      <h1 style="color: #ec4899; margin-top: 10px;">Happy Birthday, ${userName}!</h1>
    </div>
    <p style="font-size: 16px; color: #333; line-height: 1.6;">Hi ${userName},</p>
    <p style="font-size: 16px; color: #333; line-height: 1.6;">The entire MyAbacusPro team is wishing you a fantastic birthday! We hope your special day is filled with joy, celebration, and magic.</p>
    <div style="background: #fdf2f8; padding: 20px; border-radius: 15px; border: 1px solid #fbcfe8; margin: 25px 0; text-align: center;">
      <h3 style="margin-top: 0; color: #be185d;">A Birthday Gift for You!</h3>
      <p style="color: #9d174d; font-weight: bold; font-size: 18px;">We've credited +100 Mastery Points to your account!</p>
      <p style="font-size: 14px; color: #666;">Log in today to see your birthday surprise and keep your streak alive.</p>
    </div>
    <div style="text-align: center;">
      <a href="https://myabacuspro.com/dashboard" style="background: #ec4899; color: white; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block;">Go to My Dashboard</a>
    </div>
    <p style="font-size: 14px; color: #666; text-align: center; margin-top: 30px;">Keep practicing and reaching for the stars!</p>
    <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; text-align: center; color: #999; font-size: 12px;">
        <p>© 2026 MyAbacusPro. The ultimate abacus training ground.</p>
    </div>
  </div>
`;

/**
 * Scheduled: Daily at 03:30 UTC (09:00 AM IST)
 * Sends birthday wishes and credits points.
 */
exports.sendDailyBirthdayWishes = onSchedule({
    schedule: "30 3 * * *",
    secrets: ["GMAIL_APP_PASSWORD"]
}, async (event) => {
    logger.info("Starting Daily Birthday Wishes Job");
    const today = new Date();
    const currentMonth = today.getUTCMonth();
    const currentDay = today.getUTCDate();
    const currentYear = today.getUTCFullYear();

    try {
        const usersSnap = await db.collection('users').where('role', '==', 'student').get();
        const transporter = getTransporter(process.env.GMAIL_APP_PASSWORD);
        let count = 0;

        for (const userDoc of usersSnap.docs) {
            const data = userDoc.data();
            if (!data.dob || !data.email || data.isSuspended) continue;

            const dob = new Date(data.dob);
            // Check if month and day match today
            if (dob.getUTCMonth() === currentMonth && dob.getUTCDate() === currentDay) {
                // Check if already sent this year
                if (data.lastBirthdayWishedYear === currentYear) continue;

                try {
                    // 1. Send Email
                    await transporter.sendMail({
                        from: `"MyAbacusPro" <${GMAIL_USER}>`,
                        to: data.email,
                        subject: `Happy Birthday, ${data.firstName}! 🎂`,
                        html: birthdayWishHTML(data.firstName)
                    });

                    // 2. Credit Points and Update Record
                    await userDoc.ref.update({
                        totalPoints: admin.firestore.FieldValue.increment(100),
                        weeklyPoints: admin.firestore.FieldValue.increment(100),
                        monthlyPoints: admin.firestore.FieldValue.increment(100),
                        lastBirthdayWishedYear: currentYear,
                        updatedAt: admin.firestore.FieldValue.serverTimestamp()
                    });

                    count++;
                    logger.info(`Birthday wish sent & points credited to ${data.firstName} (${data.email})`);
                } catch (sendErr) {
                    logger.error(`Failed to send birthday email to ${data.email}`, sendErr);
                }
            }
        }
        logger.info(`Finished Birthday job. Celebrated ${count} students.`);
    } catch (err) {
        logger.error("Daily Birthday Job critical failure", err);
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
