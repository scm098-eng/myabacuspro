
'use client';

import { getFirestore, collection, query, where, orderBy, limit, getDocs, addDoc, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { firebaseApp } from '@/lib/firebase';
import type { Duel, ProfileData } from '@/types';
import { generateDuelQuestions, generateFlashSequence, generateOptions, createPRNG } from '@/lib/questions';
import { getMatchedBot } from './duel/bots';

export async function startMatchmaking(
  userId: string, 
  profile: ProfileData, 
  mode: 'standard' | 'flash' | 'matrix',
  difficulty: string = 'medium'
): Promise<string> {
  const db = getFirestore(firebaseApp);
  const duelsRef = collection(db, "duels");

  // 1. Search for human match
  const q = query(
    duelsRef, 
    where("status", "==", "waiting"),
    where("mode", "==", mode),
    where("difficulty", "==", difficulty),
    orderBy("createdAt", "desc"),
    limit(10)
  );

  const snap = await getDocs(q);
  
  if (!snap.empty) {
    const match = snap.docs.find(doc => doc.data().challengerId !== userId);

    if (match) {
      await updateDoc(doc(db, "duels", match.id), {
        opponentId: userId,
        opponentName: `${profile.firstName} ${profile.surname}`,
        opponentPhoto: profile.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.firstName}&size=64`,
        opponentType: 'human',
        status: 'active',
        updatedAt: serverTimestamp()
      });
      return match.id;
    }
  }

  // 2. No match? Create lobby
  const seed = `${Date.now()}`;
  const questions = generateDuelQuestions(mode, seed);
  
  const newDuel: Partial<Duel> = {
    challengerId: userId,
    challengerName: `${profile.firstName} ${profile.surname}`,
    challengerPhoto: profile.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.firstName}&size=64`,
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
  
  // 3. Fallback to Bot after 5 seconds
  setTimeout(async () => {
    const freshSnap = await getDocs(query(collection(db, "duels"), where("__name__", "==", docRef.id)));
    if (!freshSnap.empty && freshSnap.docs[0].data().status === 'waiting') {
      const bot = getMatchedBot(profile.totalPoints || 0);
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
}
