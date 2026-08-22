/**
 * Firebase Cloud Functions v2 (Node.js) Code
 * filename: functions/index.js
 */

const { setGlobalOptions } = require("firebase-functions/v2");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { onCall, HttpsError, onRequest } = require("firebase-functions/v2/https");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const logger = require("firebase-functions/logger");
const nodemailer = require('nodemailer');
const Razorpay = require('razorpay');
// Use node: prefix and unique variable name to avoid collision with global Web Crypto API in Node 22+
const nodeCryptoSvc = require('node:crypto');

const admin = require('firebase-admin');

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
        throw new Error("SMTP Auth failed: GMAIL_APP_PASSWORD is not set in environment secrets.");
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
 * Razorpay Helpers
 */
function getRazorpay() {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    
    if (!keyId || !keySecret) {
        logger.error("Razorpay Init Error: Missing environment variables", { 
            hasKeyId: !!keyId, 
            hasKeySecret: !!keySecret 
        });
        throw new Error("Razorpay configuration missing in backend secrets. Ensure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are set.");
    }
    return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

/**
 * Helpers to get UTC keys for resetting points
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

function getUTCPreviousMondayKey() {
    const now = new Date();
    const day = now.getUTCDay();
    const diff = (day === 0 ? 6 : day - 1) + 7; 
    const prevMonday = new Date(now);
    prevMonday.setUTCDate(now.getUTCDate() - diff);
    prevMonday.setUTCHours(0, 0, 0, 0);
    return prevMonday.toISOString().split('T')[0];
}

function getUTCMonthKey() {
    const now = new Date();
    return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
}

function getUTCPreviousMonthKey() {
    const now = new Date();
    now.setUTCMonth(now.getUTCMonth() - 1);
    return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
}

/**
 * Email Templates
 */
const progressReportHTML = (userName, type, metadata) => `
  <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 20px;">
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #0f172a;">${type === 'weekly' ? 'Weekly' : 'Monthly'} Progress</h1>
      <p style="font-weight: bold; color: #2563eb;">Student: ${userName}</p>
    </div>
    <div style="margin-bottom: 30px;">
      <div style="background: #f8fafc; padding: 20px; border-radius: 15px; border: 1px solid #f1f5f9; text-align: center;">
        <p style="margin: 0; font-size: 10px; color: #64748b; font-weight: bold;">Points Earned</p>
        <p style="margin: 5px 0 0; font-size: 24px; font-weight: 900; color: #2563eb;">+${metadata.periodPoints}</p>
      </div>
    </div>
    <div style="text-align: center;">
      <a href="https://myabacuspro.com/dashboard" style="background: #2563eb; color: white; padding: 14px 30px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block;">View Dashboard</a>
    </div>
  </div>
`;

const birthdayEmailHTML = (userName) => `
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
  </div>
`;

const winnerAnnouncementHTML = (userName, type, points) => `
  <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 40px; border: 4px solid #fbbf24; border-radius: 30px; background: #fffcf0;">
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="font-size: 70px; margin-bottom: 10px;">🏆</div>
      <h1 style="color: #92400e; margin: 0; text-transform: uppercase; letter-spacing: 2px;">Hail the Champion!</h1>
      <p style="font-size: 18px; font-weight: bold; color: #b45309; margin-top: 10px;">${type} Winner Announced</p>
    </div>
    
    <div style="background: white; padding: 30px; border-radius: 20px; border: 2px solid #fde68a; text-align: center; margin-bottom: 30px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
      <p style="font-size: 16px; color: #4b5563; margin-bottom: 5px;">Congratulations</p>
      <h2 style="font-size: 32px; color: #1f2937; margin: 0 0 15px;">${userName}</h2>
      <div style="display: inline-block; background: #fbbf24; color: #92400e; padding: 10px 25px; border-radius: 50px; font-weight: 900; font-size: 20px;">
        ${points.toLocaleString()} Mastery Points
      </div>
    </div>

    <p style="font-size: 16px; color: #374151; line-height: 1.6; text-align: center;">
      Your incredible dedication and speed have placed you at the very top of our global community. You are officially the <strong>${type} Champion</strong>!
    </p>

    <div style="text-align: center; margin-top: 40px;">
      <a href="https://myabacuspro.com/dashboard" style="background: #92400e; color: white; padding: 16px 35px; text-decoration: none; border-radius: 12px; font-weight: bold; display: inline-block; font-size: 18px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">Claim Your Glory</a>
    </div>
    
    <p style="font-size: 12px; color: #9ca3af; text-align: center; margin-top: 40px;">
      Keep practicing to defend your title next week!
    </p>
  </div>
`;

/**
 * Utility to wait (for rate limiting)
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function performWeeklyReset() {
    const currentWeekKey = getUTCMondayKey();
    const lastWeekKey = getUTCPreviousMondayKey();
    const transporter = getTransporter(process.env.GMAIL_APP_PASSWORD);

    const topUserSnap = await db.collection('users')
        .where('role', '==', 'student')
        .where('lastWeeklyReset', '==', lastWeekKey)
        .orderBy('weeklyPoints', 'desc')
        .limit(1)
        .get();

    if (!topUserSnap.empty) {
        const winner = topUserSnap.docs[0].data();
        const winnerId = topUserSnap.docs[0].id;
        if ((winner.weeklyPoints || 0) > 0) {
            const fullName = `${winner.firstName || ''} ${winner.surname || ''}`.trim();
            
            await db.collection('stats').doc('leaderboard').set({
                lastWeeklyWinner: {
                    uid: winnerId,
                    name: fullName,
                    photo: winner.profilePhoto || '',
                    points: winner.weeklyPoints || 0,
                    declaredAt: admin.firestore.FieldValue.serverTimestamp(),
                    weekKey: lastWeekKey
                }
            }, { merge: true });

            // Send Winner Email
            if (winner.email) {
                try {
                    await transporter.sendMail({
                        from: '"MyAbacusPro" <myabacuspro@gmail.com>',
                        to: winner.email,
                        subject: `🎉 CHAMPION! You won the Weekly Race!`,
                        html: winnerAnnouncementHTML(winner.firstName || 'Champion', 'Weekly', winner.weeklyPoints || 0)
                    });
                } catch (e) { logger.error(`Weekly Winner Email failed for ${winner.email}`, e); }
            }
        }
    }

    const usersSnap = await db.collection('users').where('role', '==', 'student').get();
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
                    subject: `Weekly Mastery Report`,
                    html: progressReportHTML(data.firstName, 'weekly', { periodPoints: data.weeklyPoints || 0 })
                });
                await sleep(200); 
            } catch (e) {
                logger.error(`Weekly Report Email failed for ${data.email}`, e);
            }
        }

        batch.update(userDoc.ref, {
            weeklyPoints: 0,
            lastWeeklyReset: currentWeekKey,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        count++;

        if (count % 500 === 0) {
            await batch.commit();
            batch = db.batch();
            count = 0;
        }
    }

    if (count > 0) await batch.commit();
    return count;
}

async function performMonthlyReset() {
    const currentMonthKey = getUTCMonthKey();
    const lastMonthKey = getUTCPreviousMonthKey();
    const transporter = getTransporter(process.env.GMAIL_APP_PASSWORD);

    const topUserSnap = await db.collection('users')
        .where('role', '==', 'student')
        .where('lastMonthlyReset', '==', lastMonthKey)
        .orderBy('monthlyPoints', 'desc')
        .limit(1)
        .get();

    if (!topUserSnap.empty) {
        const winner = topUserSnap.docs[0].data();
        const winnerId = topUserSnap.docs[0].id;
        if ((winner.monthlyPoints || 0) > 0) {
            const fullName = `${winner.firstName || ''} ${winner.surname || ''}`.trim();
            
            await db.collection('stats').doc('leaderboard').set({
                lastMonthlyWinner: {
                    uid: winnerId,
                    name: fullName,
                    photo: winner.profilePhoto || '',
                    points: winner.monthlyPoints || 0,
                    declaredAt: admin.firestore.FieldValue.serverTimestamp(),
                    monthKey: lastMonthKey
                }
            }, { merge: true });

            // Send Winner Email
            if (winner.email) {
                try {
                    await transporter.sendMail({
                        from: '"MyAbacusPro" <myabacuspro@gmail.com>',
                        to: winner.email,
                        subject: `🏆 Monthly Master! You are #1!`,
                        html: winnerAnnouncementHTML(winner.firstName || 'Champion', 'Monthly', winner.monthlyPoints || 0)
                    });
                } catch (e) { logger.error(`Monthly Winner Email failed for ${winner.email}`, e); }
            }
        }
    }

    const usersSnap = await db.collection('users').where('role', '==', 'student').get();
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
                    subject: `Monthly Mastery Report`,
                    html: progressReportHTML(data.firstName, 'monthly', { periodPoints: data.monthlyPoints || 0 })
                });
                await sleep(200);
            } catch (e) {
                logger.error(`Monthly Report Email failed for ${data.email}`, e);
            }
        }

        batch.update(userDoc.ref, {
            monthlyPoints: 0,
            lastMonthlyReset: currentMonthKey,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        count++;

        if (count % 500 === 0) {
            await batch.commit();
            batch = db.batch();
            count = 0;
        }
    }

    if (count > 0) await batch.commit();
    return count;
}

exports.resetWeeklyPoints = onSchedule({ schedule: "0 0 * * 1", secrets: ["GMAIL_APP_PASSWORD"] }, async (event) => {
    try { await performWeeklyReset(); } catch (err) { logger.error("Weekly reset failed", err); }
});

exports.resetMonthlyPoints = onSchedule({ schedule: "0 0 1 * *", secrets: ["GMAIL_APP_PASSWORD"] }, async (event) => {
    try { await performMonthlyReset(); } catch (err) { logger.error("Monthly reset failed", err); }
});

/**
 * Scheduled cleanup for expired subscriptions.
 * Runs every 4 hours.
 */
exports.cleanupExpiredSubscriptions = onSchedule({ schedule: "every 4 hours" }, async (event) => {
    const now = admin.firestore.Timestamp.now();
    const expiredUsersSnap = await db.collection('users')
        .where('subscriptionStatus', '==', 'pro')
        .where('subscriptionExpiry', '<', now)
        .get();

    if (expiredUsersSnap.empty) {
        logger.info("No expired subscriptions found in background cleanup.");
        return;
    }

    let batch = db.batch();
    let count = 0;

    for (const doc of expiredUsersSnap.docs) {
        batch.update(doc.ref, {
            subscriptionStatus: 'free',
            subscriptionType: 'none',
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        count++;

        if (count >= 400) {
            await batch.commit();
            batch = db.batch();
            count = 0;
        }
    }

    if (count > 0) await batch.commit();
    logger.info(`Background cleanup: Downgraded ${expiredUsersSnap.size} expired users.`);
});

exports.dailyBirthdayWish = onSchedule({ schedule: "0 9 * * *", secrets: ["GMAIL_APP_PASSWORD"] }, async (event) => {
    const today = new Date();
    const targetMonth = today.getUTCMonth() + 1;
    const targetDay = today.getUTCDate();

    const studentsSnap = await db.collection('users').where('role', '==', 'student').get();
    const transporter = getTransporter(process.env.GMAIL_APP_PASSWORD);
    
    let count = 0;
    for (const doc of studentsSnap.docs) {
        const data = doc.data();
        if (!data.dob) continue;
        
        const dobParts = data.dob.split(/[-/]/);
        if (dobParts.length !== 3) continue;

        let dobMonth, dobDay;
        if (dobParts[0].length === 4) {
            dobMonth = parseInt(dobParts[1]);
            dobDay = parseInt(dobParts[2]);
        } else {
            dobMonth = parseInt(dobParts[1]);
            dobDay = parseInt(dobParts[0]);
        }
        
        if (dobMonth === targetMonth && dobDay === targetDay) {
            if (data.email) {
                try {
                    await transporter.sendMail({
                        from: '"MyAbacusPro" <myabacuspro@gmail.com>',
                        to: data.email,
                        subject: `Happy Birthday, ${data.firstName || 'Student'}! 🎂`,
                        html: birthdayEmailHTML(data.firstName || 'Student')
                    });
                    await sleep(500);
                } catch (e) {
                    logger.error(`Birthday email failed for ${data.email}`, e);
                }
            }
            
            await doc.ref.update({
                totalPoints: admin.firestore.FieldValue.increment(100),
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            count++;
        }
    }
    logger.info(`Daily Birthday Batch: ${count} wishes sent.`);
});

exports.manualResetWeekly = onCall({ secrets: ["GMAIL_APP_PASSWORD"] }, async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', "Login required.");
    const userDoc = await db.collection('users').doc(request.auth.uid).get();
    if (userDoc.data()?.role !== 'admin') throw new HttpsError('permission-denied', "Admin only.");
    const count = await performWeeklyReset();
    return { status: "success", count };
});

exports.manualResetMonthly = onCall({ secrets: ["GMAIL_APP_PASSWORD"] }, async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', "Login required.");
    const userDoc = await db.collection('users').doc(request.auth.uid).get();
    if (userDoc.data()?.role !== 'admin') throw new HttpsError('permission-denied', "Admin only.");
    const count = await performMonthlyReset();
    return { status: "success", count };
});

exports.forceDeclareWinner = onCall({ secrets: ["GMAIL_APP_PASSWORD"] }, async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', "Login required.");
    const adminDoc = await db.collection('users').doc(request.auth.uid).get();
    if (adminDoc.data()?.role !== 'admin') throw new HttpsError('permission-denied', "Admin required.");

    const { uid, type } = request.data;
    if (!uid || !type) throw new HttpsError('invalid-argument', "Missing ID or Type.");

    const winnerSnap = await db.collection('users').doc(uid).get();
    if (!winnerSnap.exists) throw new HttpsError('failed-precondition', "Student not found.");
    
    const winner = winnerSnap.data();
    const periodKey = type === 'weekly' ? getUTCMondayKey() : (type === 'monthly' ? getUTCMonthKey() : 'Global');
    
    let points = 0;
    if (type === 'weekly') points = winner.weeklyPoints || 0;
    else if (type === 'monthly') points = winner.monthlyPoints || 0;
    else points = winner.totalPoints || 0;

    const fullName = `${winner.firstName || ''} ${winner.surname || ''}`.trim() || 'Champion';
    const updateKey = type === 'weekly' ? 'lastWeeklyWinner' : (type === 'monthly' ? 'lastMonthlyWinner' : 'lastGlobalWinner');
    const periodField = type === 'weekly' ? 'weekKey' : (type === 'monthly' ? 'monthKey' : 'globalKey');

    await db.collection('stats').doc('leaderboard').set({
        [updateKey]: {
            uid: uid,
            name: fullName,
            photo: winner.profilePhoto || '',
            points: points,
            declaredAt: admin.firestore.FieldValue.serverTimestamp(),
            [periodField]: periodKey
        }
    }, { merge: true });

    if (winner.email) {
        const transporter = getTransporter(process.env.GMAIL_APP_PASSWORD);
        try {
            await transporter.sendMail({
                from: '"MyAbacusPro" <myabacuspro@gmail.com>',
                to: winner.email,
                subject: `🏆 Official Champion: You are the ${type} Winner!`,
                html: winnerAnnouncementHTML(winner.firstName || 'Champion', type.charAt(0).toUpperCase() + type.slice(1), points)
            });
        } catch (e) { logger.error(`Manual Winner Email failed for ${winner.email}`, e); }
    }

    return { status: "success", message: `Declared ${fullName} as ${type} champion.` };
});

/**
 * Marks the current cycle results as official.
 */
exports.declareOfficialResults = onCall({ secrets: ["GMAIL_APP_PASSWORD"] }, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', "Login required.");
    }

    const adminDoc = await db.collection('users').doc(request.auth.uid).get();
    if (adminDoc.data()?.role !== 'admin') {
        throw new HttpsError('permission-denied', "Insufficient permissions.");
    }

    const allResultsSnap = await db.collection('examResults').get();
    if (allResultsSnap.empty) {
        return { status: "success", message: "No records found." };
    }

    const groups = ['A', 'B', 'C', 'D', 'E'];
    const winners = {};
    let totalUpdated = 0;

    for (const group of groups) {
        const groupResults = allResultsSnap.docs
            .map(doc => ({ id: doc.id, ref: doc.ref, ...doc.data() }))
            .filter(r => r.group === group && r.isFinal === true);

        if (groupResults.length > 0) {
            groupResults.sort((a, b) => {
                if (b.score !== a.score) return b.score - a.score;
                const accA = a.accuracy ?? 0;
                const accB = b.accuracy ?? 0;
                if (accB !== accA) return accB - accA;
                return (b.timeLeft || 0) - (a.timeLeft || 0);
            });

            winners[`group${group}WinnerId`] = groupResults[0].id;

            let batch = db.batch();
            let countInBatch = 0;
            
            for (let i = 0; i < groupResults.length; i++) {
                const res = groupResults[i];
                batch.update(res.ref, { 
                  rank: i + 1,
                  resultDeclared: true,
                  updatedAt: admin.firestore.FieldValue.serverTimestamp()
                });
                countInBatch++;
                totalUpdated++;
                
                if (countInBatch >= 400) {
                  await batch.commit();
                  batch = db.batch();
                  countInBatch = 0;
                }
            }
            if (countInBatch > 0) await batch.commit();
        }
    }

    await db.collection('stats').doc('examSchedule').set({
        resultsDeclared: true,
        isActive: false, 
        lastResultDeclaredAt: admin.firestore.FieldValue.serverTimestamp(),
        ...winners
    }, { merge: true });

    return { 
        status: "success", 
        updatedCount: totalUpdated 
    };
});

exports.resetExamCycle = onCall(async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', "Login required.");
    const adminDoc = await db.collection('users').doc(request.auth.uid).get();
    if (adminDoc.data()?.role !== 'admin') throw new HttpsError('permission-denied', "Admin required.");

    const { date, startTime, endTime, lastApplyDate } = request.data || {};
    if (!date) throw new HttpsError('invalid-argument', "Missing exam date.");

    const appsSnap = await db.collection('examApplications').get();
    let batch = db.batch();
    let c = 0;
    for (const doc of appsSnap.docs) {
        batch.delete(doc.ref);
        c++;
        if (c >= 400) { await batch.commit(); batch = db.batch(); c = 0; }
    }
    if (c > 0) await batch.commit();

    const resultsSnap = await db.collection('examResults').get();
    batch = db.batch();
    c = 0;
    for (const doc of resultsSnap.docs) {
        batch.delete(doc.ref);
        c++;
        if (c >= 400) { await batch.commit(); batch = db.batch(); c = 0; }
    }
    if (c > 0) await batch.commit();

    await db.collection('stats').doc('examSchedule').set({
        date,
        startTime: startTime || "12:30",
        endTime: endTime || "16:00",
        lastApplyDate: lastApplyDate || null,
        isActive: true,
        resultsDeclared: false,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    return { status: "success" };
});

exports.applyToExam = onCall(async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', "Login required.");
    const userDoc = await db.collection('users').doc(request.auth.uid).get();
    const userData = userDoc.data();
    if (userData?.role !== 'student') throw new HttpsError('permission-denied', "Only students can apply.");

    const { masteryGroup } = request.data;
    if (!masteryGroup) throw new HttpsError('invalid-argument', "Mastery group is required.");

    const scheduleDoc = await db.collection('stats').doc('examSchedule').get();
    const schedule = scheduleDoc.data();

    if (!scheduleDoc.exists || !schedule?.date || schedule?.isActive === false) {
        throw new HttpsError('failed-precondition', "There is no active exam cycle.");
    }

    if (schedule.lastApplyDate) {
        const today = new Date().toISOString().split('T')[0];
        if (today > schedule.lastApplyDate) {
            throw new HttpsError('deadline-exceeded', `Deadline passed (${schedule.lastApplyDate}).`);
        }
    }

    const appRef = db.collection('examApplications').doc(request.auth.uid);
    if ((await appRef.get()).exists) {
        throw new HttpsError('already-exists', "You have already applied.");
    }

    await appRef.set({
        userId: request.auth.uid,
        group: masteryGroup,
        status: "pending",
        appliedAt: admin.firestore.FieldValue.serverTimestamp(),
        examDate: schedule.date,
        studentName: `${userData.firstName || ''} ${userData.surname || ''}`.trim()
    });

    return { status: "success", message: "Applied successfully." };
});

/**
 * Redeems a gift coupon for Pro access.
 * ADDITIVE LOGIC: Appends duration to existing expiry if user is already Pro.
 */
exports.redeemCoupon = onCall(async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', "Login is required.");
    
    const payload = request.data || {};
    const code = payload.code || (payload.data && payload.data.code);
    
    if (!code) throw new HttpsError('invalid-argument', "Gift code is missing.");

    const couponRef = db.collection('coupons').doc(code.toUpperCase());
    const userRef = db.collection('users').doc(request.auth.uid);

    return await db.runTransaction(async (t) => {
        const couponSnap = await t.get(couponRef);
        const userSnap = await t.get(userRef);

        if (!couponSnap.exists) throw new HttpsError('not-found', "Invalid gift code.");
        
        const coupon = couponSnap.data();
        if (coupon.isUsed) throw new HttpsError('already-exists', "This code has already been redeemed.");

        const userData = userSnap.data();
        const durationDays = Number(coupon.durationDays) || 30;
        
        // --- ADDITIVE LOGIC REFINED ---
        // We calculate base date. If user is currently PRO and expiry is in the future, we add to it.
        let baseDate = new Date();
        let isAdditive = false;

        if (userData?.subscriptionStatus === 'pro' && userData?.subscriptionExpiry) {
            const expiry = userData.subscriptionExpiry;
            let currentExpiryDate;
            
            if (expiry.toDate) currentExpiryDate = expiry.toDate();
            else if (expiry instanceof Date) currentExpiryDate = expiry;
            else if (typeof expiry === 'string') currentExpiryDate = new Date(expiry);
            else if (expiry._seconds) currentExpiryDate = new Date(expiry._seconds * 1000);

            if (currentExpiryDate && currentExpiryDate > baseDate) {
                baseDate = currentExpiryDate;
                isAdditive = true;
            }
        }

        const finalExpiry = new Date(baseDate.getTime() + (durationDays * 24 * 60 * 60 * 1000));

        t.update(userRef, {
            subscriptionStatus: 'pro',
            subscriptionType: 'gift',
            subscriptionStartDate: admin.firestore.FieldValue.serverTimestamp(),
            subscriptionExpiry: admin.firestore.Timestamp.fromDate(finalExpiry),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        t.update(couponRef, {
            isUsed: true,
            usedBy: request.auth.uid,
            usedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        return { 
          status: "success", 
          durationDays, 
          expiryDate: finalExpiry.toISOString(),
          isAdditive: isAdditive
        };
    });
});

/**
 * Admin: Generate a gift coupon.
 */
exports.generateCoupon = onCall(async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', "Login required.");
    const adminDoc = await db.collection('users').doc(request.auth.uid).get();
    if (adminDoc.data()?.role !== 'admin') throw new HttpsError('permission-denied', "Admin only.");

    const data = request.data || {};
    const code = data.code;
    const durationDays = parseInt(String(data.durationDays), 10);
    const expireInDays = parseInt(String(data.expireInDays || 7), 10);

    if (!code || isNaN(durationDays)) {
        throw new HttpsError('invalid-argument', "Missing or invalid parameters.");
    }

    const cleanCode = String(code).toUpperCase().trim();
    const expiry = new Date(Date.now() + expireInDays * 86400000);

    try {
        await db.collection('coupons').doc(cleanCode).set({
            code: cleanCode,
            durationDays: durationDays,
            isUsed: false,
            expiresAt: admin.firestore.Timestamp.fromDate(expiry),
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            createdBy: request.auth.uid
        });
        return { status: "success", code: cleanCode };
    } catch (err) {
        throw new HttpsError('internal', "Failed to save coupon.");
    }
});

/**
 * Creates a Razorpay Subscription for the given plan.
 */
exports.createRazorpaySubscription = onCall({ secrets: ["RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET"] }, async (request) => {
    // Robust extraction of planId from v2 callable format
    const payload = request.data || {};
    const planId = payload.planId || (payload.data && payload.data.planId);
    
    logger.info("DEBUG_PAYMENT: Incoming Data (Subscription)", { payload });

    if (!request.auth) throw new HttpsError('unauthenticated', "Auth required.");
    if (!planId) throw new HttpsError('invalid-argument', "Missing plan ID for subscription.");

    try {
        const rzp = getRazorpay();
        const userId = request.auth.uid;
        const userDoc = await db.collection('users').doc(userId).get();
        const userData = userDoc.data();

        let customerId = userData.razorpayCustomerId;
        if (!customerId) {
            const customer = await rzp.customers.create({
                name: `${userData.firstName} ${userData.surname}`,
                email: userData.email,
                notes: { user_id: userId }
            });
            customerId = customer.id;
            await db.collection('users').doc(userId).update({ razorpayCustomerId: customerId });
        }

        const subscription = await rzp.subscriptions.create({
            plan_id: planId,
            customer_id: customerId,
            total_count: 12,
            notes: { user_id: userId }
        });

        return { 
            subscriptionId: subscription.id,
            amount: 0, 
            currency: 'INR'
        };
    } catch (err) {
        logger.error("DEBUG_PAYMENT: Full Razorpay Error Context (Subscription)", {
            message: err.message,
            statusCode: err.statusCode,
            errorBody: err.error, 
            stack: err.stack
        });
        throw new HttpsError('internal', err.message || "Failed to create subscription");
    }
});

/**
 * Creates a one-time Razorpay Order.
 */
exports.createOneTimeOrder = onCall({ secrets: ["RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET"] }, async (request) => {
    // Robust extraction of amount from v2 callable format
    const payload = request.data || {};
    const amountVal = payload.amount || (payload.data && payload.data.amount);
    const currency = payload.currency || (payload.data && payload.data.currency) || 'INR';
    
    logger.info("DEBUG_PAYMENT: Incoming Data (Order)", { payload });

    if (!request.auth) throw new HttpsError('unauthenticated', "Auth required.");
    
    const amount = Number(amountVal);
    if (!amount || isNaN(amount)) throw new HttpsError('invalid-argument', "Valid amount is required for one-time orders.");

    try {
        const rzp = getRazorpay();
        const order = await rzp.orders.create({
            amount: Math.round(amount * 100), // Convert to paise/cents
            currency: currency,
            receipt: `receipt_${Date.now()}_${request.auth.uid.slice(0, 5)}`,
            notes: { 
                user_id: request.auth.uid,
                plan_duration_months: payload.planDuration || (payload.data && payload.data.planDuration)
            }
        });

        return { 
            orderId: order.id,
            amount: order.amount,
            currency: order.currency
        };
    } catch (err) {
        logger.error("DEBUG_PAYMENT: Full Razorpay Error Context (Order)", {
            message: err.message,
            statusCode: err.statusCode,
            errorBody: err.error, 
            stack: err.stack
        });
        throw new HttpsError('internal', err.message || "Failed to create order");
    }
});

/**
 * Razorpay Webhook
 */
exports.razorpaywebhook = onRequest({ 
    secrets: ["RAZORPAY_KEY_SECRET"],
    memory: "512MiB"
}, async (req, res) => {
    try {
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
        const signature = req.headers["x-razorpay-signature"];

        // 1. Validate Webhook Signature
        
        const expectedSignature = nodeCryptoSvc
            .createHmac("sha256", webhookSecret)
            .update(req.rawBody)
            .digest("hex");

        if (expectedSignature !== signature) {
            logger.error("Invalid Razorpay Webhook Signature");
            return res.status(400).send("Invalid signature");
        }

        const event = req.body.event;
        const payload = req.body.payload;

        // 2. Handle Subscription Charges or One-Time Payments
        if (event === "subscription.charged" || event === "payment.captured" || event === "order.paid") {
            const paymentEntity = payload.payment?.entity;
            const subscriptionEntity = payload.subscription?.entity;
            
            // Extract user ID passed in checkout notes
            const userId = paymentEntity?.notes?.user_id || subscriptionEntity?.notes?.user_id;

            if (userId) {
                // Set expiry date to 30 days from now
                const expiryDate = new Date();
                expiryDate.setDate(expiryDate.getDate() + 30);

                // Update Firestore document via Admin SDK
                await admin.firestore().collection("users").doc(userId).update({
                    subscriptionStatus: "pro",
                    subscriptionType: "paid",
                    subscriptionStartDate: admin.firestore.FieldValue.serverTimestamp(),
                    subscriptionExpiry: admin.firestore.Timestamp.fromDate(expiryDate),
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                });

                logger.info(`Successfully converted user ${userId} to Pro subscription.`);
            } else {
                logger.warn("Webhook received without user_id in notes.");
            }
        }

        return res.status(200).json({ status: "success" });
    } catch (err) {
        logger.error("Error processing Razorpay Webhook", err);
        return res.status(500).send("Internal Server Error");
    }
});
