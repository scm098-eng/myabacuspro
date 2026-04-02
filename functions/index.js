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
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

if (admin.apps.length === 0) {
    admin.initializeApp();
}

// Set global defaults for all functions in this file
setGlobalOptions({ maxInstances: 10, timeoutSeconds: 540, memory: '1GiB', region: 'us-central1' });
const db = getFirestore();

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
      <div style="display: inline-block; background: #fbbf24; color: #92400e; padding: 10px 25px; rounded-pill; font-weight: 900; font-size: 20px; border-radius: 50px;">
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
                    declaredAt: FieldValue.serverTimestamp(),
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
            updatedAt: FieldValue.serverTimestamp()
        });
        count++;

        if (count % 500 === 0) {
            await batch.commit();
            batch = db.batch();
        }
    }

    if (count % 500 !== 0) await batch.commit();
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
                    declaredAt: FieldValue.serverTimestamp(),
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
            updatedAt: FieldValue.serverTimestamp()
        });
        count++;

        if (count % 500 === 0) {
            await batch.commit();
            batch = db.batch();
        }
    }

    if (count % 500 !== 0) await batch.commit();
    return count;
}

exports.resetWeeklyPoints = onSchedule({ schedule: "0 0 * * 1", secrets: ["GMAIL_APP_PASSWORD"] }, async (event) => {
    try { await performWeeklyReset(); } catch (err) { logger.error("Weekly reset failed", err); }
});

exports.resetMonthlyPoints = onSchedule({ schedule: "0 0 1 * *", secrets: ["GMAIL_APP_PASSWORD"] }, async (event) => {
    try { await performMonthlyReset(); } catch (err) { logger.error("Monthly reset failed", err); }
});

exports.dailyBirthdayWish = onSchedule({ schedule: "0 9 * * *", secrets: ["GMAIL_APP_PASSWORD"] }, async (event) => {
    const today = new Date();
    const monthDayStr = `${String(today.getUTCMonth() + 1).padStart(2, '0')}-${String(today.getUTCDate()).padStart(2, '0')}`;

    const studentsSnap = await db.collection('users').where('role', '==', 'student').get();
    const transporter = getTransporter(process.env.GMAIL_APP_PASSWORD);
    
    let count = 0;
    for (const doc of studentsSnap.docs) {
        const data = doc.data();
        if (!data.dob) continue;
        
        if (data.dob.includes(monthDayStr)) {
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
                totalPoints: FieldValue.increment(100),
                weeklyPoints: FieldValue.increment(100),
                monthlyPoints: FieldValue.increment(100),
                updatedAt: FieldValue.serverTimestamp()
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
            declaredAt: FieldValue.serverTimestamp(),
            [periodField]: periodKey
        }
    }, { merge: true });

    // Send Winner Notification Email
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
