
/**
 * My Abacus Pro - Maintenance Script
 * Purpose: Calculate and update ranks for all final exam results.
 * Usage: node scripts/calculate-ranks.js
 */

const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Admin SDK using Application Default Credentials
// Ensure GOOGLE_APPLICATION_CREDENTIALS points to your service account key or run in an authorized environment
if (admin.apps.length === 0) {
    admin.initializeApp({
        projectId: "abacusace-mmnqw" // Explicit project ID for consistency
    });
}

const db = getFirestore();

async function calculateRanks() {
    console.log('--- STARTING RANK CALCULATION ---');
    
    try {
        // 1. Fetch all final exam results
        const resultsSnap = await db.collection('examResults')
            .where('isFinal', '==', true)
            .get();

        if (resultsSnap.empty) {
            console.log('No final exam results found.');
            return;
        }

        console.log(`Found ${resultsSnap.size} total final attempts.`);

        // 2. Group results by 'group' field
        const groupedResults = {};
        resultsSnap.docs.forEach(doc => {
            const data = doc.data();
            const group = data.group || 'unknown';
            if (!groupedResults[group]) groupedResults[group] = [];
            groupedResults[group].push({ id: doc.id, ref: doc.ref, ...data });
        });

        const groups = Object.keys(groupedResults);
        console.log(`Processing groups: ${groups.join(', ')}`);

        let totalUpdated = 0;

        // 3. Process each group
        for (const group of groups) {
            const groupResults = groupedResults[group];

            // 4. Perform Triple-Tie-Breaker Sort
            // Criteria: Score (Desc) > Accuracy (Desc) > TimeLeft (Desc)
            groupResults.sort((a, b) => {
                // Primary: Score
                if (b.score !== a.score) return b.score - a.score;
                // Secondary: Accuracy
                if ((b.accuracy || 0) !== (a.accuracy || 0)) return (b.accuracy || 0) - (a.accuracy || 0);
                // Tertiary: Time Left (Faster finish)
                return (b.timeLeft || 0) - (a.timeLeft || 0);
            });

            console.log(`\nRanking Group ${group} (${groupResults.length} students):`);

            // 5. Build batches
            let batch = db.batch();
            let batchCount = 0;

            groupResults.forEach((result, index) => {
                const rank = index + 1;
                batch.update(result.ref, { 
                    rank: rank,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                });
                
                batchCount++;
                totalUpdated++;

                // Log top 3 for verification
                if (rank <= 3) {
                    console.log(` - Rank ${rank}: ${result.studentName} (Score: ${result.score}, Acc: ${result.accuracy}%, TimeLeft: ${result.timeLeft})`);
                }

                // Firestore batch limit is 500
                if (batchCount >= 400) {
                    batch.commit();
                    batch = db.batch();
                    batchCount = 0;
                }
            });

            if (batchCount > 0) {
                await batch.commit();
            }
            console.log(`Successfully updated ${groupResults.length} ranks for Group ${group}.`);
        }

        console.log('\n--- RANK CALCULATION COMPLETE ---');
        console.log(`Total documents updated: ${totalUpdated}`);

    } catch (error) {
        console.error('CRITICAL ERROR during rank calculation:', error);
    }
}

// Execute
calculateRanks().then(() => process.exit(0));
