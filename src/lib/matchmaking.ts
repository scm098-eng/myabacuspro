'use client';

import { getFirestore, collection, query, where, orderBy, limit, getDocs, addDoc, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { firebaseApp } from '@/lib/firebase';
import type { Duel, ProfileData } from '@/types';
import { generateDuelQuestions } from '@/lib/questions';

const BOT_IDENTITIES = [
  { name: "Arjun K.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun&size=64", speed: 1.0, accuracy: 0.9 },
  { name: "Vihaan P.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vihaan&size=64", speed: 0.8, accuracy: 0.95 },
  { name: "Aarav M.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav&size=64", speed: 0.9, accuracy: 0.92 },
  { name: "Neha S.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Neha&size=64", speed: 1.2, accuracy: 0.85 },
  { name: "Ananya R.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya&size=64", speed: 1.5, accuracy: 0.8 },
  { name: "Saanvi D.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Saanvi&size=64", speed: 0.85, accuracy: 0.94 },
];

export async function startMatchmaking(
  userId: string, 
  profile: ProfileData, 
  mode: 'standard' | 'flash' | 'matrix',
  difficulty: string = 'medium'
): Promise<string> {
  const db = getFirestore(firebaseApp);
  const duelsRef = collection(db, "duels");

  const q = query(
    duelsRef, 
    where("status", "==", "waiting"),
    orderBy("createdAt", "desc"),
    limit(20)
  );

  const snap = await getDocs(q);
  
  if (!snap.empty) {
    const match = snap.docs.find(doc => {
      const d = doc.data();
      return d.challengerId !== userId && d.mode === mode && d.difficulty === difficulty;
    });

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
  return docRef.id;
}

export async function spawnBotForDuel(duelId: string) {
  const db = getFirestore(firebaseApp);
  const bot = BOT_IDENTITIES[Math.floor(Math.random() * BOT_IDENTITIES.length)];
  
  await updateDoc(doc(db, "duels", duelId), {
    opponentId: `bot_${Date.now()}`,
    opponentName: bot.name,
    opponentPhoto: bot.avatar,
    opponentType: 'bot',
    botSpeed: bot.speed,
    botAccuracy: bot.accuracy,
    status: 'active',
    updatedAt: serverTimestamp()
  });
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

export async function startRematch(duel: Duel, userId: string, profile: ProfileData) {
  return await startMatchmaking(userId, profile, duel.mode as any, duel.difficulty);
}
