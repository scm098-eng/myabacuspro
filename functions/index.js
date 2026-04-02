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
 * Email Template
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

async function performWeeklyReset() {
    const currentWeekKey = getUTCMondayKey();
    const lastWeekKey = getUTCPreviousMondayKey();

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
        }
    }

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
                    subject: `Weekly Mastery Report`,
                    html: progressReportHTML(data.firstName, 'weekly', { periodPoints: data.weeklyPoints || 0 })
                });
            } catch (e) {}
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
        }
    }

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
                    subject: `Monthly Mastery Report`,
                    html: progressReportHTML(data.firstName, 'monthly', { periodPoints: data.monthlyPoints || 0 })
                });
            } catch (e) {}
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
    const periodKey = type === 'weekly' ? getUTCMondayKey() : getUTCMonthKey();
    const points = type === 'weekly' ? (winner.weeklyPoints || 0) : (winner.monthlyPoints || 0);
    const fullName = `${winner.firstName || ''} ${winner.surname || ''}`.trim() || 'Champion';

    const updateKey = type === 'weekly' ? 'lastWeeklyWinner' : 'lastMonthlyWinner';
    const periodField = type === 'weekly' ? 'weekKey' : 'monthKey';

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

    return { status: "success", message: `Declared ${fullName} as ${type} champion.` };
});
