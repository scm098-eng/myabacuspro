
/**
 * My Abacus Pro - Maintenance Script
 * Purpose: Calculate and update ranks for all final exam results.
 * Criteria: Score (Desc) > Accuracy (Desc) > TimeLeft (Desc)
 */

const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize using Application Default Credentials
if (admin.apps.length === 0) {
    admin.initializeApp({
        projectId: "abacusace-mmnqw"
    });
}

const db = getFirestore();

async function calculateRanks() {
    console.log('--- STARTING TRIPLE-TIE-BREAKER RANK CALCULATION ---');
    
    try {
        const resultsSnap = await db.collection('examResults')
            .where('isFinal', '==', true)
            .get();

        if (resultsSnap.empty) {
            console.log('No final exam results found.');
            return;
        }

        const groupedResults = {};
        resultsSnap.docs.forEach(doc => {
            const data = doc.data();
            const group = data.group || 'unknown';
            if (!groupedResults[group]) groupedResults[group] = [];
            groupedResults[group].push({ id: doc.id, ref: doc.ref, ...data });
        });

        const groups = Object.keys(groupedResults);
        let totalUpdated = 0;

        for (const group of groups) {
            const groupResults = groupedResults[group];

            // Triple-Tie-Breaker Sort
            groupResults.sort((a, b) => {
                if (b.score !== a.score) return b.score - a.score;
                if ((b.accuracy || 0) !== (a.accuracy || 0)) return (b.accuracy || 0) - (a.accuracy || 0);
                return (b.timeLeft || 0) - (a.timeLeft || 0);
            });

            console.log(`\nRanking Group ${group} (${groupResults.length} students):`);

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

                if (rank <= 3) {
                    console.log(` - Rank ${rank}: ${result.studentName} (Score: ${result.score}, Acc: ${result.accuracy}%, TimeLeft: ${result.timeLeft})`);
                }

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

calculateRanks().then(() => process.exit(0));
