
/**
 * Simulated Bot Ecosystem for My Abacus Pro
 * Features 100+ unique identities with tiered performance metrics.
 */

export interface BotProfile {
  id: string;
  name: string;
  avatar: string;
  tier: 'beginner' | 'intermediate' | 'advanced';
  minSpeedMs: number;
  maxSpeedMs: number;
  accuracyRate: number;
  rating: number;
}

const FIRST_NAMES = [
  "Arjun", "Vihaan", "Aarav", "Neha", "Ananya", "Saanvi", "Ishaan", "Aadi", "Kiara", "Myra",
  "Rohan", "Siddharth", "Aditi", "Priya", "Karan", "Sanya", "Kabir", "Aavya", "Vivaan", "Zoya",
  "Emma", "Liam", "Noah", "Olivia", "Ava", "Lucas", "Mia", "Ethan", "Sophia", "Aiden",
  "Amara", "Zayn", "Hiro", "Yuki", "Mei", "Chen", "Wei", "Sora", "Kenji", "Rina"
];

const LAST_NAMES = [
  "Mane", "Patil", "Sharma", "Gupta", "Verma", "Reddy", "Nair", "Iyer", "Joshi", "Kulkarni",
  "Deshmukh", "Singh", "Khan", "Malhotra", "Kapoor", "Smith", "Johnson", "Brown", "Taylor", "Wilson",
  "Wang", "Li", "Sato", "Suzuki", "Tanaka", "Park", "Kim", "Lee", "Garcia", "Martinez"
];

function generateBotPool(): BotProfile[] {
  const pool: BotProfile[] = [];
  
  for (let i = 0; i < 110; i++) {
    const fName = FIRST_NAMES[i % FIRST_NAMES.length];
    const lName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    const id = `bot_${i}_${Math.random().toString(36).substr(2, 5)}`;
    
    // Distribute into tiers
    let tier: 'beginner' | 'intermediate' | 'advanced' = 'intermediate';
    if (i < 35) tier = 'beginner';
    else if (i > 75) tier = 'advanced';

    let minSpeedMs, maxSpeedMs, accuracyRate, rating;

    switch (tier) {
      case 'beginner':
        minSpeedMs = 4000;
        maxSpeedMs = 8000;
        accuracyRate = 0.65 + Math.random() * 0.15;
        rating = 400 + Math.floor(Math.random() * 400);
        break;
      case 'intermediate':
        minSpeedMs = 2500;
        maxSpeedMs = 5000;
        accuracyRate = 0.80 + Math.random() * 0.10;
        rating = 800 + Math.floor(Math.random() * 800);
        break;
      case 'advanced':
        minSpeedMs = 1200;
        maxSpeedMs = 3000;
        accuracyRate = 0.90 + Math.random() * 0.08;
        rating = 1600 + Math.floor(Math.random() * 1400);
        break;
    }

    const style = i % 2 === 0 ? 'avataaars' : 'bottts';
    const avatar = `https://api.dicebear.com/7.x/${style}/svg?seed=${fName}${i}&size=128`;

    pool.push({
      id,
      name: `${fName} ${lName.charAt(0)}.`,
      avatar,
      tier,
      minSpeedMs,
      maxSpeedMs,
      accuracyRate,
      rating
    });
  }
  
  return pool;
}

const BOT_POOL = generateBotPool();

export function getMatchedBot(playerPoints: number): BotProfile {
  // Use player points to pick a suitable tier
  let targetTier: 'beginner' | 'intermediate' | 'advanced' = 'intermediate';
  if (playerPoints < 1500) targetTier = 'beginner';
  else if (playerPoints > 15000) targetTier = 'advanced';

  const eligibleBots = BOT_POOL.filter(b => b.tier === targetTier);
  return eligibleBots[Math.floor(Math.random() * eligibleBots.length)];
}

export function simulateBotAnswer(bot: BotProfile, isCorrectAnswer: boolean): { isCorrect: boolean; delay: number } {
  const isCorrect = Math.random() < bot.accuracyRate;
  const delay = bot.minSpeedMs + Math.random() * (bot.maxSpeedMs - bot.minSpeedMs);
  return { isCorrect, delay };
}
