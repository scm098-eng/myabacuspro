'use client';

import { getFirestore, collection, query, where, orderBy, limit, getDocs, addDoc, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { firebaseApp } from '@/lib/firebase';
import type { Duel, ProfileData } from '@/types';
import { generateDuelQuestions } from '@/lib/questions';

const BOT_IDENTITIES = [
  // Male Personas
  { name: "Arjun K.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun&top=shortHair&mouth=smile", speed: 1.0, accuracy: 0.9 },
  { name: "Vihaan P.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vihaan&top=shortFlat&mouth=smile", speed: 0.8, accuracy: 0.95 },
  { name: "Aarav M.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav&top=shortWaved&mouth=smile", speed: 0.9, accuracy: 0.92 },
  { name: "Kabir L.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kabir&top=shortCurly&mouth=smile", speed: 1.3, accuracy: 0.82 },
  { name: "Reyansh C.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Reyansh&top=shortHair&mouth=smile", speed: 1.4, accuracy: 0.78 },
  { name: "Advik R.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Advik&top=shortFlat&mouth=smile", speed: 1.0, accuracy: 0.89 },
  { name: "Rishi V.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rishi&top=shortHair&mouth=smile", speed: 0.75, accuracy: 0.96 },
  { name: "Dev P.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dev&top=shortFlat&mouth=smile", speed: 1.05, accuracy: 0.93 },
  { name: "Aryan B.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aryan&top=shortHair&mouth=smile", speed: 1.35, accuracy: 0.81 },
  { name: "Yuvraj D.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Yuvraj&top=shortWaved&mouth=smile", speed: 1.15, accuracy: 0.86 },
  
  // Female Personas
  { name: "Neha S.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Neha&top=longHair&mouth=smile", speed: 1.2, accuracy: 0.85 },
  { name: "Ananya R.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya&top=longHairCurvy&mouth=smile", speed: 1.5, accuracy: 0.8 },
  { name: "Ishani T.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ishani&top=longHairBigHair&mouth=smile", speed: 1.1, accuracy: 0.88 },
  { name: "Saanvi D.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Saanvi&top=longHairStraight&mouth=smile", speed: 0.85, accuracy: 0.94 },
  { name: "Myra G.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Myra&top=longHairStraight&mouth=smile", speed: 0.95, accuracy: 0.91 },
  { name: "Inaya M.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Inaya&top=longHairCurvy&mouth=smile", speed: 1.1, accuracy: 0.87 },
  { name: "Zara Q.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Zara&top=longHairStraight&mouth=smile", speed: 1.25, accuracy: 0.84 },
  { name: "Sia J.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sia&top=longHairCurvy&mouth=smile", speed: 0.88, accuracy: 0.9 },
  { name: "Kiara S.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kiara&top=longHairStraight&mouth=smile", speed: 0.92, accuracy: 0.95 },
  { name: "Pari T.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Pari&top=longHairCurly&mouth=smile", speed: 0.8, accuracy: 0.98 },
];

/**
 * Intelligent Hybrid Matchmaking
 * Searches for a real opponent for 12s before failing over to a bot.
 */
export async function startMatchmaking(
  userId: string, 
  profile: ProfileData, 
  mode: 'standard' | 'flash' | 'matrix',
  difficulty: string = 'medium'
): Promise<string> {
  const db = getFirestore(firebaseApp);
  const duelsRef = collection(db, "duels");

  // 1. Try to find an existing human waiting lobby
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
        opponentPhoto: profile.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.firstName}`,
        opponentType: 'human',
        status: 'active',
        updatedAt: serverTimestamp()
      });
      return match.id;
    }
  }

  // 2. No lobby found, create one
  const seed = `${Date.now()}`;
  const questions = generateDuelQuestions(mode as any, seed);
  
  const newDuel: Partial<Duel> = {
    challengerId: userId,
    challengerName: `${profile.firstName} ${profile.surname}`,
    challengerPhoto: profile.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.firstName}`,
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
  
  // Appending motivated mood traits to bot avatars
  const motivatedAvatar = `${bot.avatar}&eyes=happy&mouth=smile`;

  await updateDoc(doc(db, "duels", duelId), {
    opponentId: `bot_${Date.now()}`,
    opponentName: bot.name,
    opponentPhoto: motivatedAvatar,
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
