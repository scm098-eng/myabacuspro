'use client';

import type { Question, Difficulty, TestType, TestSettings, GameLevel } from '@/types';
import { basicAdditionQuestions } from './question-data/basic-addition';
import { basicSubtractionQuestions } from './question-data/basic-subtraction';
import { bigBrotherAdditionQuestions } from './question-data/big-brother-addition';
import { bigBrotherSubtractionQuestions } from './question-data/big-brother-subtraction';
import { combinationAdditionQuestions } from './question-data/combination-addition';
import { combinationSubtractionQuestions } from './question-data/combination-subtraction';

/**
 * Deterministic PRNG Generator (Mulberry32)
 * Ensures "Same Paper" for all students when a seed is provided.
 */
export function createPRNG(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  let s = h >>> 0;
  return function() {
    s |= 0; s = s + 0x6D2B79F5 | 0;
    let t = Math.imul(s ^ s >>> 15, 1 | s);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

const masteryMixQuestions: Record<string, Question[]> = {
    'mastery-mix-1': [...basicAdditionQuestions['basic-addition-plus-4'], ...basicSubtractionQuestions['basic-subtraction-minus-1']],
    'mastery-mix-2': [...basicAdditionQuestions['basic-addition-plus-3'], ...basicSubtractionQuestions['basic-subtraction-minus-2']],
    'mastery-mix-3': [...basicAdditionQuestions['basic-addition-plus-2'], ...basicSubtractionQuestions['basic-subtraction-minus-3']],
    'mastery-mix-4': [...basicAdditionQuestions['basic-addition-plus-1'], ...basicSubtractionQuestions['basic-subtraction-minus-4']],
    'mastery-mix-5': [...bigBrotherAdditionQuestions['big-brother-addition-plus-9'], ...bigBrotherSubtractionQuestions['big-brother-subtraction-minus-9']],
    'mastery-mix-6': [...bigBrotherAdditionQuestions['big-brother-addition-plus-8'], ...bigBrotherSubtractionQuestions['big-brother-subtraction-minus-8']],
    'mastery-mix-7': [...bigBrotherAdditionQuestions['big-brother-addition-plus-7'], ...bigBrotherSubtractionQuestions['big-brother-subtraction-minus-7']],
    'mastery-mix-8': [...bigBrotherAdditionQuestions['big-brother-addition-plus-6'], ...bigBrotherSubtractionQuestions['big-brother-subtraction-minus-6']],
    'mastery-mix-9': [...combinationAdditionQuestions['combination-plus-9'], ...combinationSubtractionQuestions['combination-minus-9']],
    'mastery-mix-10': [...combinationAdditionQuestions['combination-plus-8'], ...combinationSubtractionQuestions['combination-minus-8']],
    'mastery-mix-11': [...combinationAdditionQuestions['combination-plus-7'], ...combinationSubtractionQuestions['combination-minus-7']],
    'mastery-mix-12': [...combinationAdditionQuestions['combination-plus-6'], ...combinationSubtractionQuestions['combination-minus-6']],
};

const TEST_CONFIG: Record<string, Partial<Record<Difficulty, TestSettings>>> = {
  'beads-identify': {
    easy: { numQuestions: 20, timeLimit: 0, title: 'Identify Beads Value', icon: 'eye' },
  },
  'beads-set': {
    easy: { numQuestions: 20, timeLimit: 0, title: 'Set Beads Value', icon: 'puzzle' },
  },
  'flash-anzan': {
    easy: { numQuestions: 10, timeLimit: 0, title: 'Novice Flash', icon: 'zap' },
    medium: { numQuestions: 15, timeLimit: 0, title: 'Expert Flash', icon: 'zap' },
    hard: { numQuestions: 20, timeLimit: 0, title: 'Elite Flash', icon: 'zap' },
    custom: { numQuestions: 10, timeLimit: 0, title: 'Anzan Custom Lab', icon: 'zap' },
  },
  'basic-add-sub-l1': {
    easy: { numQuestions: 30, timeLimit: 0, title: 'Basic Add/Sub: Level 1 (Direct)', icon: 'brain-circuit' },
  },
  'basic-add-sub-l2': {
    easy: { numQuestions: 30, timeLimit: 0, title: 'Basic Add/Sub: Level 2 (Direct)', icon: 'brain-circuit' },
  },
  'addition-subtraction': {
    easy: { numQuestions: 50, timeLimit: 300, title: 'Addition & Subtraction (Easy)', icon: 'brain-circuit' },
    medium: { numQuestions: 100, timeLimit: 600, title: 'Addition & Subtraction (Medium)', icon: 'brain-circuit' },
    hard: { numQuestions: 150, timeLimit: 900, title: 'Addition & Subtraction (Hard)', icon: 'brain-circuit' },
  },
  'addition-subtraction-input': {
    easy: { numQuestions: 50, timeLimit: 300, title: 'Master: Add & Sub (Easy)', icon: 'keyboard' },
    medium: { numQuestions: 100, timeLimit: 600, title: 'Master: Add & Sub (Medium)', icon: 'keyboard' },
    hard: { numQuestions: 150, timeLimit: 900, title: 'Master: Add & Sub (Hard)', icon: 'keyboard' },
  },
  'multiplication': {
    easy: { numQuestions: 50, timeLimit: 300, title: 'Multiplication (Easy)', icon: 'x' },
    medium: { numQuestions: 100, timeLimit: 600, title: 'Multiplication (Medium)', icon: 'x' },
    hard: { numQuestions: 150, timeLimit: 900, title: 'Multiplication (Hard)', icon: 'x' },
  },
  'multiplication-input': {
    easy: { numQuestions: 50, timeLimit: 300, title: 'Master: Multiplication (Easy)', icon: 'keyboard' },
    medium: { numQuestions: 100, timeLimit: 600, title: 'Master: Multiplication (Medium)', icon: 'keyboard' },
    hard: { numQuestions: 150, timeLimit: 900, title: 'Master: Multiplication (Hard)', icon: 'keyboard' },
  },
  'division': {
    easy: { numQuestions: 50, timeLimit: 300, title: 'Division (Easy)', icon: 'divide' },
    medium: { numQuestions: 100, timeLimit: 600, title: 'Division (Medium)', icon: 'divide' },
    hard: { numQuestions: 150, timeLimit: 900, title: 'Division (Hard)', icon: 'divide' },
  },
  'division-input': {
    easy: { numQuestions: 50, timeLimit: 300, title: 'Master: Division (Easy)', icon: 'keyboard' },
    medium: { numQuestions: 100, timeLimit: 600, title: 'Master: Division (Medium)', icon: 'keyboard' },
    hard: { numQuestions: 150, timeLimit: 900, title: 'Master: Division (Hard)', icon: 'keyboard' },
  },
  'square': {
    easy: { numQuestions: 30, timeLimit: 300, title: 'Square (Easy)', icon: 'sparkles' },
    medium: { numQuestions: 50, timeLimit: 480, title: 'Square (Medium)', icon: 'sparkles' },
    hard: { numQuestions: 75, timeLimit: 600, title: 'Square (Hard)', icon: 'sparkles' },
  },
  'square-input': {
    easy: { numQuestions: 30, timeLimit: 300, title: 'Master: Square (Easy)', icon: 'keyboard' },
    medium: { numQuestions: 50, timeLimit: 480, title: 'Master: Square (Medium)', icon: 'keyboard' },
    hard: { numQuestions: 75, timeLimit: 600, title: 'Master: Square (Hard)', icon: 'keyboard' },
  },
  'cube': {
    easy: { numQuestions: 20, timeLimit: 300, title: 'Cube (Easy)', icon: 'box' },
    medium: { numQuestions: 40, timeLimit: 480, title: 'Cube (Medium)', icon: 'box' },
    hard: { numQuestions: 60, timeLimit: 600, title: 'Cube (Hard)', icon: 'box' },
  },
  'cube-input': {
    easy: { numQuestions: 20, timeLimit: 300, title: 'Master: Cube (Easy)', icon: 'keyboard' },
    medium: { numQuestions: 40, timeLimit: 480, title: 'Master: Cube (Medium)', icon: 'keyboard' },
    hard: { numQuestions: 60, timeLimit: 600, title: 'Master: Cube (Hard)', icon: 'keyboard' },
  },
  'square-root': {
    easy: { numQuestions: 30, timeLimit: 300, title: 'Square Root (Easy)', icon: 'brain-circuit' },
    medium: { numQuestions: 50, timeLimit: 480, title: 'Square Root (Medium)', icon: 'brain-circuit' },
    hard: { numQuestions: 75, timeLimit: 600, title: 'Square Root (Hard)', icon: 'brain-circuit' },
  },
  'square-root-input': {
    easy: { numQuestions: 30, timeLimit: 300, title: 'Master: Square Root (Easy)', icon: 'keyboard' },
    medium: { numQuestions: 50, timeLimit: 480, title: 'Master: Square Root (Medium)', icon: 'keyboard' },
    hard: { numQuestions: 75, timeLimit: 600, title: 'Master: Square Root (Hard)', icon: 'keyboard' },
  },
  'cube-root': {
    easy: { numQuestions: 20, timeLimit: 300, title: 'Cube Root (Easy)', icon: 'brain-circuit' },
    medium: { numQuestions: 40, timeLimit: 480, title: 'Cube Root (Medium)', icon: 'brain-circuit' },
    hard: { numQuestions: 60, timeLimit: 600, title: 'Cube Root (Hard)', icon: 'brain-circuit' },
  },
  'cube-root-input': {
    easy: { numQuestions: 20, timeLimit: 300, title: 'Master: Cube Root (Easy)', icon: 'keyboard' },
    medium: { numQuestions: 40, timeLimit: 480, title: 'Master: Cube Root (Medium)', icon: 'keyboard' },
    hard: { numQuestions: 60, timeLimit: 600, title: 'Master: Cube Root (Hard)', icon: 'keyboard' },
  },
  'basic-addition-plus-4': { easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: +4 = +5 - 1', icon: 'puzzle' } },
  'basic-addition-plus-40': { easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: +40 = +50 - 10', icon: 'puzzle' } },
  'basic-addition-plus-3': { easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: +3 = +5 - 2', icon: 'puzzle' } },
  'basic-addition-plus-30': { easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: +30 = +50 - 20', icon: 'puzzle' } },
  'basic-addition-plus-2': { easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: +2 = +5 - 3', icon: 'puzzle' } },
  'basic-addition-plus-20': { easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: +20 = +50 - 30', icon: 'puzzle' } },
  'basic-addition-plus-1': { easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: +1 = +5 - 4', icon: 'puzzle' } },
  'basic-addition-plus-10': { easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: +10 = +50 - 40', icon: 'puzzle' } },
  'basic-subtraction-minus-4': { easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: -4 = -5 + 1', icon: 'puzzle' } },
  'basic-subtraction-minus-40': { easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: -40 = -50 + 10', icon: 'puzzle' } },
  'basic-subtraction-minus-3': { easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: -3 = -5 + 2', icon: 'puzzle' } },
  'basic-subtraction-minus-30': { easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: -30 = -50 + 20', icon: 'puzzle' } },
  'basic-subtraction-minus-2': { easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: -2 = -5 + 3', icon: 'puzzle' } },
  'basic-subtraction-minus-20': { easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: -20 = -50 + 30', icon: 'puzzle' } },
  'basic-subtraction-minus-1': { easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: -1 = -5 + 4', icon: 'puzzle' } },
  'basic-subtraction-minus-10': { easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: -10 = -50 + 40', icon: 'puzzle' } },
};

export const preDefinedQuestions: Record<string, Question[]> = {
  ...basicAdditionQuestions,
  ...basicSubtractionQuestions,
  ...bigBrotherAdditionQuestions,
  ...bigBrotherSubtractionQuestions,
  ...combinationAdditionQuestions,
  ...combinationSubtractionQuestions,
  ...masteryMixQuestions,
};

export function getTestSettings(testId: TestType, difficulty: Difficulty): TestSettings | undefined {
  if (difficulty.startsWith('level-')) {
    const isBeadTest = testId === 'beads-identify' || testId === 'beads-set';
    const isAnzan = testId === 'flash-anzan';
    
    if (isBeadTest) {
      const levelNum = parseInt(difficulty.replace('level-', ''), 10);
      return { numQuestions: 20, timeLimit: 0, title: `Beads Practice - Level ${levelNum}`, icon: testId === 'beads-identify' ? 'eye' : 'puzzle' };
    }
    
    if (isAnzan) {
      const levelNum = parseInt(difficulty.split('-').pop() || '1', 10);
      const tier = difficulty.includes('expert') ? 'Expert' : difficulty.includes('elite') ? 'Elite' : 'Novice';
      return { numQuestions: 10, timeLimit: 0, title: `${tier} Flash • Level ${levelNum}`, icon: 'zap' };
    }
  }
  return TEST_CONFIG[testId]?.[difficulty as keyof Partial<Record<Difficulty, TestSettings>>] as TestSettings | undefined;
}

export function getRandomInt(min: number, max: number, prng: () => number = Math.random): number {
  return Math.floor(prng() * (max - min + 1)) + min;
}

export function shuffleArray<T>(array: T[], prng: () => number = Math.random): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(prng() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export function deDuplicateQuestions(questions: Question[]): Question[] {
  if (questions.length < 2) return questions;
  const result = [...questions];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  for (let i = 0; i < result.length - 1; i++) {
    if (result[i].answer === result[i + 1].answer) {
      for (let j = i + 2; j < result.length; j++) {
        if (result[j].answer !== result[i].answer) {
          const temp = result[i + 1];
          result[i + 1] = result[j];
          result[j] = temp;
          break;
        }
      }
    }
  }
  return result;
}

export function generateOptions(correctAnswer: number, prng: () => number = Math.random): number[] {
  const options = new Set<number>([correctAnswer]);
  const safeAnswer = Math.max(0, correctAnswer);
  const range = Math.max(10, Math.abs(Math.floor(safeAnswer * 0.4)));
  while (options.size < 4) {
    let wrongAnswer = safeAnswer < 10 ? getRandomInt(0, 20, prng) : getRandomInt(Math.max(0, safeAnswer - range), safeAnswer + range, prng);
    if (wrongAnswer !== safeAnswer && wrongAnswer >= 0) options.add(wrongAnswer);
  }
  return shuffleArray(Array.from(options), prng);
}

export function generateFlashSequence(digits: number, rows: number, prng: () => number = Math.random, digitsSecondary: number = 0, ratioSecondary: number = 0): { sequence: number[], answer: number } {
  const sequence: number[] = [];
  let total = 0;
  
  for (let r = 0; r < rows; r++) {
    const useSecondary = prng() < ratioSecondary;
    const d = useSecondary ? digitsSecondary : digits;
    const min = Math.pow(10, d - 1);
    const max = Math.pow(10, d) - 1;
    
    let val = getRandomInt(min, max, prng);
    if (total - val < 0) {
      sequence.push(val);
      total += val;
    } else {
      const signedVal = val * (prng() > 0.7 ? -1 : 1);
      sequence.push(signedVal);
      total += signedVal;
    }
  }
  return { sequence, answer: total };
}

export function generateTest(testId: TestType, difficulty: Difficulty, customSettings?: { rows?: number, digits?: number, delay?: number }): Question[] {
  const settings = getTestSettings(testId, difficulty);
  if (!settings && difficulty !== 'custom') return [];

  if (testId === 'flash-anzan') {
    const questions: Question[] = [];
    let rows = 3;
    let delay = 2000;
    let d1 = 1, d2 = 0, r2 = 0;

    if (difficulty === 'custom') {
      rows = customSettings?.rows || 10;
      delay = customSettings?.delay || 1000;
      d1 = customSettings?.digits || 2;
    } else if (difficulty.startsWith('level-')) {
      const level = parseInt(difficulty.split('-').pop() || '1', 10);
      const tier = difficulty.includes('expert') ? 'expert' : difficulty.includes('elite') ? 'elite' : 'novice';
      
      rows = 3 + Math.floor((level - 1) * 7 / 49);
      delay = 2000 - Math.floor((level - 1) * 500 / 49);

      if (tier === 'novice') { d1 = 1; }
      else if (tier === 'expert') { d1 = 1; d2 = 2; r2 = (level - 1) / 49 * 0.9; }
      else { d1 = 2; d2 = 3; r2 = (level - 1) / 49 * 0.9; }
    }

    const numQs = settings?.numQuestions || 10;
    for (let i = 0; i < numQs; i++) {
      const { sequence, answer } = generateFlashSequence(d1, rows, Math.random, d2, r2);
      questions.push({ text: sequence.map(n => n > 0 ? `+${n}` : n).join(' '), answer, options: generateOptions(answer), questionType: 'flash', sequence, delay });
    }
    return questions;
  }

  const coreTestId = testId.replace('-input', '');
  if (preDefinedQuestions[coreTestId]) return deDuplicateQuestions([...preDefinedQuestions[coreTestId]]).slice(0, settings!.numQuestions);

  const questions: Question[] = [];
  if (testId === 'beads-identify' || testId === 'beads-set') {
    const type = testId === 'beads-identify' ? 'identify' : 'set';
    const lvl = parseInt(difficulty.split('-').pop() || '1', 10);
    const maxD = lvl <= 2 ? 1 : lvl <= 4 ? 2 : lvl <= 6 ? 3 : 4;

    for(let i=0; i<settings!.numQuestions; i++) {
      const d = lvl <= 8 ? maxD : getRandomInt(1, 4);
      const answer = getRandomInt(Math.pow(10, d - 1), Math.pow(10, d) - 1);
      questions.push({ text: '', answer, options: generateOptions(answer), questionType: type });
    }
    return deDuplicateQuestions(questions);
  }

  for (let i = 0; i < settings!.numQuestions; i++) {
    questions.push({ text: "1 + 1", options: generateOptions(2), answer: 2 });
  }
  return deDuplicateQuestions(questions);
}

export function generateDuelQuestions(mode: 'standard' | 'flash' | 'matrix', seed: string): Question[] {
  const prng = createPRNG(seed);
  const questions: Question[] = [];
  const count = 20;

  for (let i = 0; i < count; i++) {
    if (mode === 'flash') {
      const { sequence, answer } = generateFlashSequence(2, 5, prng);
      questions.push({ text: sequence.map(n => n > 0 ? `+${n}` : n).join(' '), answer, options: generateOptions(answer, prng), sequence });
    } else if (mode === 'matrix') {
        const size = i < 10 ? 3 : 4;
        const tileCount = i < 10 ? 4 : 6;
        const pattern: number[] = [];
        while (pattern.length < tileCount) {
          const r = Math.floor(prng() * (size * size));
          if (!pattern.includes(r)) pattern.push(r);
        }
        questions.push({ text: 'Reconstruct', answer: pattern.length, options: [pattern.length, pattern.length + 1, pattern.length - 1, pattern.length + 2], matrixPattern: pattern });
    } else {
        const a = getRandomInt(10, 99, prng);
        const b = getRandomInt(10, 99, prng);
        const ans = a + b;
        questions.push({ text: `${a} + ${b}`, answer: ans, options: generateOptions(ans, prng) });
    }
  }
  return questions;
}
