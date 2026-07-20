
'use client';

import { getFirestore, collection, query, where, orderBy, limit, getDocs, addDoc, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { firebaseApp } from '@/lib/firebase';
import type { Duel, ProfileData } from '@/types';
import { generateDuelQuestions, createPRNG } from '@/lib/questions';
import { getMatchedBot } from './duel/bots';

export async function startMatchmaking(
  userId: string, 
  profile: ProfileData, 
  mode: 'standard' | 'flash' | 'matrix',
  difficulty: string = 'medium'
): Promise<string> {
  console.log("--- STARTING MATCHMAKING ---", { mode, difficulty });
  const db = getFirestore(firebaseApp);
  const duelsRef = collection(db, "duels");

  // 1. Search for human match (Simplified to avoid index requirement)
  try {
    const q = query(
      duelsRef, 
      where("status", "==", "waiting"),
      limit(20)
    );

    const snap = await getDocs(q);
    const match = snap.docs.find(doc => {
      const d = doc.data();
      return d.challengerId !== userId && d.mode === mode && d.difficulty === difficulty;
    });

    if (match) {
      console.log("Found Human Opponent:", match.id);
      await updateDoc(doc(db, "duels", match.id), {
        opponentId: userId,
        opponentName: `${profile.firstName} ${profile.surname}`,
        opponentPhoto: profile.profilePhoto || '',
        opponentType: 'human',
        status: 'active',
        updatedAt: serverTimestamp()
      });
      return match.id;
    }
  } catch (e) {
    console.error("Matchmaking Search Error:", e);
  }

  // 2. No match? Create lobby
  const seed = `${Date.now()}`;
  const questions = generateDuelQuestions(mode, seed);
  
  const newDuel: Partial<Duel> = {
    challengerId: userId,
    challengerName: `${profile.firstName} ${profile.surname}`,
    challengerPhoto: profile.profilePhoto || '',
    status: 'waiting',
    mode,
    difficulty,
    questions,
    challengerScore: 0,
    opponentScore: 0,
    challengerFinished: false,
    opponentFinished: false,
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(duelsRef, newDuel);
  console.log("Created Waiting Lobby:", docRef.id);
  
  // 3. Fallback to Bot after 5 seconds
  setTimeout(async () => {
    try {
      const freshSnap = await getDocs(query(collection(db, "duels"), where("__name__", "==", docRef.id)));
      if (!freshSnap.empty && freshSnap.docs[0].data().status === 'waiting') {
        const bot = getMatchedBot(profile.totalPoints || 0);
        console.log("Pairing with Bot:", bot.name);
        await updateDoc(doc(db, "duels", docRef.id), {
          opponentId: bot.id,
          opponentName: bot.name,
          opponentPhoto: bot.avatar,
          opponentType: 'bot',
          botRef: bot, 
          status: 'active',
          updatedAt: serverTimestamp()
        });
      }
    } catch (err) {
      console.error("Bot Pair Error:", err);
    }
  }, 5000);

  return docRef.id;
}

export async function getRecentOpponents(userId: string): Promise<{uid: string, name: string, photo: string}[]> {
  const db = getFirestore(firebaseApp);
  const q = query(
    collection(db, "duels"),
    where("status", "==", "completed"),
    orderBy("createdAt", "desc"),
    limit(50)
  );

  try {
    const snap = await getDocs(q);
    const opponents = new Map<string, {uid: string, name: string, photo: string}>();

    snap.docs.forEach(doc => {
      const d = doc.data();
      if (d.challengerId === userId && d.opponentId && !d.opponentId.startsWith('bot_')) {
        opponents.set(d.opponentId, { uid: d.opponentId, name: d.opponentName, photo: d.opponentPhoto });
      } else if (d.opponentId === userId && d.challengerId) {
        opponents.set(d.challengerId, { uid: d.challengerId, name: d.challengerName, photo: d.challengerPhoto });
      }
    });

    return Array.from(opponents.values()).slice(0, 5);
  } catch (e) {
    console.error("Fetch Recent Rivals Error:", e);
    return [];
  }
}
