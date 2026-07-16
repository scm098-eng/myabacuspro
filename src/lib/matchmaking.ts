
'use client';

import { getFirestore, collection, query, where, orderBy, limit, getDocs, addDoc, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { firebaseApp } from '@/lib/firebase';
import type { Duel, Question, ProfileData } from '@/types';
import { generateDuelQuestions } from '@/lib/questions';

const BOT_IDENTITIES = [
  { name: "Arjun K.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun", level: 3 },
  { name: "Neha S.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Neha", level: 2 },
  { name: "Vihaan P.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vihaan", level: 4 },
  { name: "Ananya R.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya", level: 1 },
  { name: "Aarav M.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav", level: 5 },
  { name: "Ishani T.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ishani", level: 3 },
  { name: "Kabir L.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kabir", level: 2 },
  { name: "Saanvi D.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Saanvi", level: 4 },
  { name: "Reyansh C.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Reyansh", level: 1 },
  { name: "Myra G.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Myra", level: 5 },
];

/**
 * Intelligent Hybrid Matchmaking
 * 1. Look for waiting human duel of same mode/difficulty
 * 2. If found, join it
 * 3. If not found, create one and wait 6 seconds
 * 4. If still no joiner after 6s, spawn a bot
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
    where("mode", "==", mode),
    where("difficulty", "==", difficulty),
    orderBy("createdAt", "asc"),
    limit(1)
  );

  const snap = await getDocs(q);
  
  if (!snap.empty) {
    const existingDuel = snap.docs[0];
    const data = existingDuel.data();
    
    // Don't join your own lobby
    if (data.challengerId !== userId) {
      await updateDoc(doc(db, "duels", existingDuel.id), {
        opponentId: userId,
        opponentName: `${profile.firstName} ${profile.surname}`,
        opponentPhoto: profile.profilePhoto || '',
        opponentType: 'human',
        status: 'active',
        updatedAt: serverTimestamp()
      });
      return existingDuel.id;
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
  const bot = BOT_IDENTITIES[Math.floor(Math.random() * BOT_IDENTITIES.length)];
  
  await updateDoc(doc(db, "duels", duelId), {
    opponentId: `bot_${Date.now()}`,
    opponentName: bot.name,
    opponentPhoto: bot.avatar,
    opponentType: 'bot',
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
