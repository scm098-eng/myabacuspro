
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
const { FieldValue } = require('firebase-admin/firestore');

if (admin.apps.length === 0) {
    admin.initializeApp();
}

// Set global defaults for all functions in this file
setGlobalOptions({ maxInstances: 10, timeoutSeconds: 540, memory: '1GiB', region: 'us-central1' });
const db = admin.firestore();

const GMAIL_USER = 'myabacuspro@gmail.com';

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
 * Helper to get the UTC Month key (YYYY-MM) for TODAY
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
 * Progress Report Email Template
 */
const progressReportHTML = (userName, type, metadata) => `
  <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 20px;">
    <div style="text-align: center; margin-bottom: 30px;">
      <span style="background: #f1f5f9; padding: 8px 16px; border-radius: 20px; font-size: 10px; font-weight: bold; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">Performance Summary</span>
      <h1 style="color: #0f172a; margin-top: 10px;">${type === 'weekly' ? 'Weekly' : 'Monthly'} Progress</h1>
      <p style="font-weight: bold; color: #2563eb;">Student: ${userName}</p>
    </div>
    
    <div style="margin-bottom: 30px;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td style="padding-right: 10px;">
            <div style="background: #f8fafc; padding: 20px; border-radius: 15px; text-align: center; border: 1px solid #f1f5f9;">
              <p style="margin: 0; font-size: 10px; color: #64748b; font-weight: bold; text-transform: uppercase;">Points Earned</p>
              <p style="margin: 5px 0 0; font-size: 24px; font-weight: 900; color: #2563eb;">+${metadata.periodPoints}</p>
            </div>
          </td>
          <td style="padding-left: 10px;">
            <div style="background: #f8fafc; padding: 20px; border-radius: 15px; text-align: center; border: 1px solid #f1f5f9;">
              <p style="margin: 0; font-size: 10px; color: #64748b; font-weight: bold; text-transform: uppercase;">Current Streak</p>
              <p style="margin: 5px 0 0; font-size: 24px; font-weight: 900; color: #f97316;">${metadata.streak} Days</p>
            </div>
          </td>
        </tr>
      </table>
    </div>

    <div style="background: #0f172a; color: white; padding: 25px; border-radius: 20px; margin-bottom: 30px;">
      <h3 style="margin-top: 0; color: #38bdf8; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Overall Standing</h3>
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 15px;">
        <tr>
          <td>
            <p style="margin: 0; font-size: 11px; opacity: 0.7;">Total Mastery Points</p>
            <p style="margin: 5px 0 0; font-size: 20px; font-weight: bold;">${(metadata.totalPoints || 0).toLocaleString()}</p>
          </td>
          <td align="right">
            <p style="margin: 0; font-size: 11px; opacity: 0.7;">Total Practice Days</p>
            <p style="margin: 5px 0 0; font-size: 20px; font-weight: bold;">${metadata.practiceDays}</p>
          </td>
        </tr>
      </table>
    </div>

    <div style="text-align: center;">
      <p style="color: #64748b; font-size: 14px; margin-bottom: 25px;">Consistency is the key to becoming a Human Calculator. Your dedication is paying off!</p>
      <a href="https://myabacuspro.com/dashboard" style="background: #2563eb; color: white; padding: 14px 30px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);">Open My Dashboard</a>
    </div>
    <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; text-align: center; color: #999; font-size: 12px;">
        <p>© 2026 MyAbacusPro. The ultimate abacus training ground.</p>
    </div>
  </div>
`;

/**
 * Shared logic for Weekly Reset
 */
async function performWeeklyReset() {
    logger.info("Starting Weekly Points Reset & Winner Declaration");
    const currentWeekKey = getUTCMondayKey();
    const lastWeekKey = getUTCPreviousMondayKey();

    // 1. Declare Winner
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
                    name: `${winner.firstName || ''} ${winner.surname || ''}`.trim(),
                    photo: winner.profilePhoto || '',
                    points: winner.weeklyPoints || 0,
                    declaredAt: FieldValue.serverTimestamp(),
                    weekKey: lastWeekKey
                }
            }, { merge: true });
            logger.info(`Weekly Winner declared: ${winner.firstName}`);
        }
    }

    // 2. Fetch all students to reset and send reports
    const usersSnap = await db.collection('users').where('role', '==', 'student').get();
    const transporter = getTransporter(process.env.GMAIL_APP_PASSWORD);
    let batch = db.batch();
    let count = 0;

    for (const userDoc of usersSnap.docs) {
        const data = userDoc.data();
        if (data.lastWeeklyReset === currentWeekKey) continue;

        if (data.email && (data.weeklyPoints || 0) > 0) {
            try {
                await transporter.sendMail({
                    from: '"MyAbacusPro" <myabacuspro@gmail.com>',
                    to: data.email,
                    subject: `Weekly Mastery Report: ${data.firstName} 📈`,
                    html: progressReportHTML(data.firstName, 'weekly', {
                        periodPoints: data.weeklyPoints || 0,
                        streak: data.currentStreak || 0,
                        totalPoints: data.totalPoints || 0,
                        practiceDays: data.totalDaysPracticed || 0
                    })
                });
            } catch (emailErr) {
                logger.error(`Failed to send weekly report to ${data.email}`, emailErr);
            }
        }

        batch.update(userDoc.ref, {
            weeklyPoints: 0,
            lastWeeklyReset: currentWeekKey,
            updatedAt: FieldValue.serverTimestamp()
        });
        count++;

        if (count % 500 === 0) {
            await batch.commit();
            batch = db.batch();
        }
    }

    if (count % 500 !== 0) {
        await batch.commit();
    }
    return count;
}

/**
 * Shared logic for Monthly Reset
 */
async function performMonthlyReset() {
    logger.info("Starting Monthly Points Reset & Winner Declaration");
    const currentMonthKey = getUTCMonthKey();
    const lastMonthKey = getUTCPreviousMonthKey();

    // 1. Declare Monthly Winner
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
                    name: `${winner.firstName || ''} ${winner.surname || ''}`.trim(),
                    photo: winner.profilePhoto || '',
                    points: winner.monthlyPoints || 0,
                    declaredAt: FieldValue.serverTimestamp(),
                    monthKey: lastMonthKey
                }
            }, { merge: true });
            logger.info(`Monthly Winner declared: ${winner.firstName}`);
        }
    }

    // 2. Reset and send reports
    const usersSnap = await db.collection('users').where('role', '==', 'student').get();
    const transporter = getTransporter(process.env.GMAIL_APP_PASSWORD);
    let batch = db.batch();
    let count = 0;

    for (const userDoc of usersSnap.docs) {
        const data = userDoc.data();
        if (data.lastMonthlyReset === currentMonthKey) continue;

        if (data.email && (data.monthlyPoints || 0) > 0) {
            try {
                await transporter.sendMail({
                    from: '"MyAbacusPro" <myabacuspro@gmail.com>',
                    to: data.email,
                    subject: `Monthly Mastery Report: ${data.firstName} 📈`,
                    html: progressReportHTML(data.firstName, 'monthly', {
                        periodPoints: data.monthlyPoints || 0,
                        streak: data.currentStreak || 0,
                        totalPoints: data.totalPoints || 0,
                        practiceDays: data.totalDaysPracticed || 0
                    })
                });
            } catch (emailErr) {
                logger.error(`Failed to send monthly report to ${data.email}`, emailErr);
            }
        }

        batch.update(userDoc.ref, {
            monthlyPoints: 0,
            lastMonthlyReset: currentMonthKey,
            updatedAt: FieldValue.serverTimestamp()
        });
        count++;

        if (count % 500 === 0) {
            await batch.commit();
            batch = db.batch();
        }
    }

    if (count % 500 !== 0) {
        await batch.commit();
    }
    return count;
}

/**
 * Scheduled: Every Monday at 00:00 UTC
 */
exports.resetWeeklyPoints = onSchedule({
    schedule: "0 0 * * 1",
    secrets: ["GMAIL_APP_PASSWORD"]
}, async (event) => {
    try {
        const count = await performWeeklyReset();
        logger.info(`Successfully reset and sent reports for ${count} students.`);
    } catch (err) {
        logger.error("Weekly reset failed", err);
    }
});

/**
 * Scheduled: 1st of every month at 00:00 UTC
 */
exports.resetMonthlyPoints = onSchedule({
    schedule: "0 0 1 * *",
    secrets: ["GMAIL_APP_PASSWORD"]
}, async (event) => {
    try {
        const count = await performMonthlyReset();
        logger.info(`Successfully reset monthly cycle for ${count} students.`);
    } catch (err) {
        logger.error("Monthly reset failed", err);
    }
});

/**
 * Manual Callable: Admin only
 */
exports.manualResetWeekly = onCall({
    secrets: ["GMAIL_APP_PASSWORD"],
    region: "us-central1"
}, async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', "Login required.");
    const userDoc = await db.collection('users').doc(request.auth.uid).get();
    if (userDoc.data()?.role !== 'admin') throw new HttpsError('permission-denied', "Admin only.");

    try {
        const count = await performWeeklyReset();
        return { status: "success", count };
    } catch (err) {
        logger.error("Manual Weekly reset failed", err);
        throw new HttpsError('internal', err.message || "Reset failed");
    }
});

/**
 * Manual Callable: Admin only
 */
exports.manualResetMonthly = onCall({
    secrets: ["GMAIL_APP_PASSWORD"],
    region: "us-central1"
}, async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', "Login required.");
    const userDoc = await db.collection('users').doc(request.auth.uid).get();
    if (userDoc.data()?.role !== 'admin') throw new HttpsError('permission-denied', "Admin only.");

    try {
        const count = await performMonthlyReset();
        return { status: "success", count };
    } catch (err) {
        logger.error("Manual Monthly reset failed", err);
        throw new HttpsError('internal', err.message || "Reset failed");
    }
});

/**
 * Force Declare a Specific Winner: Admin only
 */
exports.forceDeclareWinner = onCall({
    region: "us-central1"
}, async (request) => {
    const { data, auth } = request;
    logger.info("forceDeclareWinner triggered", { data });
    
    if (!auth) {
        throw new HttpsError('unauthenticated', "Authentication is required to perform this action.");
    }

    try {
        // 1. Verify Admin Status
        const adminDoc = await db.collection('users').doc(auth.uid).get();
        if (!adminDoc.exists || adminDoc.data()?.role !== 'admin') {
            throw new HttpsError('permission-denied', "Insufficient permissions. Administrators only.");
        }

        const { uid, type } = data; // type: 'weekly' | 'monthly'
        if (!uid || !type) {
            throw new HttpsError('invalid-argument', "Missing required parameters: student UID or period type.");
        }

        // 2. Fetch Student Data
        const winnerSnap = await db.collection('users').doc(uid).get();
        if (!winnerSnap.exists) {
            throw new HttpsError('not-found', `The student with ID ${uid} was not found.`);
        }
        
        const winner = winnerSnap.data();
        const periodKey = type === 'weekly' ? getUTCMondayKey() : getUTCMonthKey();
        const points = type === 'weekly' ? (winner.weeklyPoints || 0) : (winner.monthlyPoints || 0);
        const fullName = `${winner.firstName || ''} ${winner.surname || ''}`.trim() || 'Student';

        // 3. Update Global Leaderboard Stat
        const docRef = db.collection('stats').doc('leaderboard');
        const updateKey = type === 'weekly' ? 'lastWeeklyWinner' : 'lastMonthlyWinner';
        const periodField = type === 'weekly' ? 'weekKey' : 'monthKey';

        await docRef.set({
            [updateKey]: {
                uid: uid,
                name: fullName,
                photo: winner.profilePhoto || '',
                points: points,
                declaredAt: FieldValue.serverTimestamp(),
                [periodField]: periodKey
            }
        }, { merge: true });

        logger.info(`Manually declared ${fullName} as ${type} champion.`);
        return { status: "success", message: `Successfully declared ${fullName} as the ${type} winner.` };
    } catch (err) {
        logger.error("Manual declaration failed with error:", err);
        // Map known codes to descriptive messages
        if (err.code && typeof err.code === 'string') {
            const validCodes = ['unauthenticated', 'permission-denied', 'invalid-argument', 'not-found', 'failed-precondition'];
            if (validCodes.includes(err.code)) throw err;
        }
        throw new HttpsError('internal', `Server error during manual declaration: ${err.message || 'Unknown error'}`);
    }
});

/**
 * Scheduled: Daily at 03:30 UTC (09:00 AM IST)
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
            if (dob.getUTCMonth() === currentMonth && dob.getUTCDate() === currentDay) {
                if (data.lastBirthdayWishedYear === currentYear) continue;

                try {
                    await transporter.sendMail({
                        from: `"MyAbacusPro" <${GMAIL_USER}>`,
                        to: data.email,
                        subject: `Happy Birthday, ${data.firstName}! 🎂`,
                        html: `
                          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 2px solid #ec4899; border-radius: 20px; background: #fffafb;">
                            <div style="text-align: center; margin-bottom: 25px;">
                              <div style="font-size: 60px;">🎂</div>
                              <h1 style="color: #ec4899; margin-top: 10px;">Happy Birthday, ${data.firstName}!</h1>
                            </div>
                            <p style="font-size: 16px; color: #333; line-height: 1.6;">Hi ${data.firstName},</p>
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
                          </div>
                        `
                    });

                    await userDoc.ref.update({
                        totalPoints: admin.firestore.FieldValue.increment(100),
                        weeklyPoints: admin.firestore.FieldValue.increment(100),
                        monthlyPoints: admin.firestore.FieldValue.increment(100),
                        lastBirthdayWishedYear: currentYear,
                        updatedAt: FieldValue.serverTimestamp()
                    });

                    count++;
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
    secrets: ["GMAIL_APP_PASSWORD"],
    region: "us-central1"
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
exports.verifyEmailWithOTP = onCall({
    region: "us-central1"
}, async (request) => {
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
