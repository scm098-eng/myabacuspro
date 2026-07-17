'use client';

import { getFirestore, collection, query, where, orderBy, limit, getDocs, addDoc, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { firebaseApp } from '@/lib/firebase';
import type { Duel, Question, ProfileData } from '@/types';
import { generateDuelQuestions } from '@/lib/questions';

const BOT_IDENTITIES = [
  { name: "Arjun K.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun", gender: 'male', speed: 1.0, accuracy: 0.9 },
  { name: "Neha S.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Neha", gender: 'female', speed: 1.2, accuracy: 0.85 },
  { name: "Vihaan P.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vihaan", gender: 'male', speed: 0.8, accuracy: 0.95 },
  { name: "Ananya R.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya", gender: 'female', speed: 1.5, accuracy: 0.8 },
  { name: "Aarav M.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav", gender: 'male', speed: 0.9, accuracy: 0.92 },
  { name: "Ishani T.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ishani", gender: 'female', speed: 1.1, accuracy: 0.88 },
  { name: "Kabir L.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kabir", gender: 'male', speed: 1.3, accuracy: 0.82 },
  { name: "Saanvi D.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Saanvi", gender: 'female', speed: 0.85, accuracy: 0.94 },
  { name: "Reyansh C.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Reyansh", gender: 'male', speed: 1.4, accuracy: 0.78 },
  { name: "Myra G.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Myra", gender: 'female', speed: 0.95, accuracy: 0.91 },
  { name: "Advik R.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Advik", gender: 'male', speed: 1.0, accuracy: 0.89 },
  { name: "Inaya M.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Inaya", gender: 'female', speed: 1.1, accuracy: 0.87 },
  { name: "Rishi V.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rishi", gender: 'male', speed: 0.75, accuracy: 0.96 },
  { name: "Zara Q.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Zara", gender: 'female', speed: 1.25, accuracy: 0.84 },
  { name: "Dev P.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dev", gender: 'male', speed: 1.05, accuracy: 0.93 },
  { name: "Sia J.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sia", gender: 'female', speed: 0.88, accuracy: 0.9 },
  { name: "Aryan B.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aryan", gender: 'male', speed: 1.35, accuracy: 0.81 },
  { name: "Kiara S.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kiara", gender: 'female', speed: 0.92, accuracy: 0.95 },
  { name: "Yuvraj D.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Yuvraj", gender: 'male', speed: 1.15, accuracy: 0.86 },
  { name: "Pari T.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Pari", gender: 'female', speed: 0.8, accuracy: 0.98 },
];

/**
 * Intelligent Hybrid Matchmaking
 * Searches for a real opponent for 6s before failing over to a bot.
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
    // Find the first match that isn't ours and matches our criteria
    const match = snap.docs.find(doc => {
      const d = doc.data();
      return d.challengerId !== userId && d.mode === mode && d.difficulty === difficulty;
    });

    if (match) {
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
  }

  // 2. No lobby found, create one
  const seed = `${Date.now()}`;
  const questions = generateDuelQuestions(mode as any, seed);
  
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
  return docRef.id;
}

export async function spawnBotForDuel(duelId: string) {
  const db = getFirestore(firebaseApp);
  // Pick a random bot from the pool
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