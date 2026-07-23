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

export const masteryMixQuestions: Record<string, Question[]> = {
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

const preDefinedQuestions: Record<string, Question[]> = {
  // Direct Formula Mapping for Bubble Game (Syncing Hub Keys with Internal Keys)
  'small-sister-plus-4': basicAdditionQuestions['basic-addition-plus-4'],
  'small-sister-plus-3': basicAdditionQuestions['basic-addition-plus-3'],
  'small-sister-plus-2': basicAdditionQuestions['basic-addition-plus-2'],
  'small-sister-plus-1': basicAdditionQuestions['basic-addition-plus-1'],
  'small-sister-minus-4': basicSubtractionQuestions['basic-subtraction-minus-4'],
  'small-sister-minus-3': basicSubtractionQuestions['basic-subtraction-minus-3'],
  'small-sister-minus-2': basicSubtractionQuestions['basic-subtraction-minus-2'],
  'small-sister-minus-1': basicSubtractionQuestions['basic-subtraction-minus-1'],
  'small-sister-all': [
    ...basicAdditionQuestions['basic-addition-plus-4'],
    ...basicAdditionQuestions['basic-addition-plus-3'],
    ...basicAdditionQuestions['basic-addition-plus-2'],
    ...basicAdditionQuestions['basic-addition-plus-1'],
    ...basicSubtractionQuestions['basic-subtraction-minus-4'],
    ...basicSubtractionQuestions['basic-subtraction-minus-3'],
    ...basicSubtractionQuestions['basic-subtraction-minus-2'],
    ...basicSubtractionQuestions['basic-subtraction-minus-1']
  ],
  'big-brother-plus-9': bigBrotherAdditionQuestions['big-brother-addition-plus-9'],
  'big-brother-plus-8': bigBrotherAdditionQuestions['big-brother-addition-plus-8'],
  'big-brother-plus-7': bigBrotherAdditionQuestions['big-brother-addition-plus-7'],
  'big-brother-plus-6': bigBrotherAdditionQuestions['big-brother-addition-plus-6'],
  'big-brother-plus-5': bigBrotherAdditionQuestions['big-brother-addition-plus-5'],
  'big-brother-plus-4': bigBrotherAdditionQuestions['big-brother-addition-plus-4'],
  'big-brother-plus-3': bigBrotherAdditionQuestions['big-brother-addition-plus-3'],
  'big-brother-plus-2': bigBrotherAdditionQuestions['big-brother-addition-plus-2'],
  'big-brother-plus-1': bigBrotherAdditionQuestions['big-brother-addition-plus-1'],
  'big-brother-minus-9': bigBrotherSubtractionQuestions['big-brother-subtraction-minus-9'],
  'big-brother-minus-8': bigBrotherSubtractionQuestions['big-brother-subtraction-minus-8'],
  'big-brother-minus-7': bigBrotherSubtractionQuestions['big-brother-subtraction-minus-7'],
  'big-brother-minus-6': bigBrotherSubtractionQuestions['big-brother-subtraction-minus-6'],
  'big-brother-minus-5': bigBrotherSubtractionQuestions['big-brother-subtraction-minus-5'],
  'big-brother-minus-4': bigBrotherSubtractionQuestions['big-brother-subtraction-minus-4'],
  'big-brother-minus-3': bigBrotherSubtractionQuestions['big-brother-subtraction-minus-3'],
  'big-brother-minus-2': bigBrotherSubtractionQuestions['big-brother-subtraction-minus-2'],
  'big-brother-minus-1': bigBrotherSubtractionQuestions['big-brother-subtraction-minus-1'],
  'big-brother-all': [
    ...bigBrotherAdditionQuestions['big-brother-addition-plus-9'],
    ...bigBrotherAdditionQuestions['big-brother-addition-plus-8'],
    ...bigBrotherAdditionQuestions['big-brother-addition-plus-7'],
    ...bigBrotherAdditionQuestions['big-brother-addition-plus-6'],
    ...bigBrotherAdditionQuestions['big-brother-addition-plus-5'],
    ...bigBrotherSubtractionQuestions['big-brother-subtraction-minus-9'],
    ...bigBrotherSubtractionQuestions['big-brother-subtraction-minus-8'],
    ...bigBrotherSubtractionQuestions['big-brother-subtraction-minus-7'],
    ...bigBrotherSubtractionQuestions['big-brother-subtraction-minus-6'],
    ...bigBrotherSubtractionQuestions['big-brother-subtraction-minus-5']
  ],
  'combination-plus-9': combinationAdditionQuestions['combination-plus-9'],
  'combination-plus-8': combinationAdditionQuestions['combination-plus-8'],
  'combination-plus-7': combinationAdditionQuestions['combination-plus-7'],
  'combination-plus-6': combinationAdditionQuestions['combination-plus-6'],
  'combination-minus-9': combinationSubtractionQuestions['combination-minus-9'],
  'combination-minus-8': combinationSubtractionQuestions['combination-minus-8'],
  'combination-minus-7': combinationSubtractionQuestions['combination-minus-7'],
  'combination-minus-6': combinationSubtractionQuestions['combination-minus-6'],
  'combination-all': [
    ...combinationAdditionQuestions['combination-plus-9'],
    ...combinationAdditionQuestions['combination-plus-8'],
    ...combinationAdditionQuestions['combination-plus-7'],
    ...combinationAdditionQuestions['combination-plus-6'],
    ...combinationSubtractionQuestions['combination-minus-9'],
    ...combinationSubtractionQuestions['combination-minus-8'],
    ...combinationSubtractionQuestions['combination-minus-7'],
    ...combinationSubtractionQuestions['combination-minus-6']
  ],
  ...basicAdditionQuestions,
  ...basicSubtractionQuestions,
  ...bigBrotherAdditionQuestions,
  ...bigBrotherSubtractionQuestions,
  ...combinationAdditionQuestions,
  ...combinationSubtractionQuestions,
  ...masteryMixQuestions,
};

const TEST_CONFIG: Record<string, Partial<Record<Difficulty, TestSettings>>> = {
  'beads-identify': {
    easy: { numQuestions: 20, timeLimit: 0, title: 'Identify Beads Value', icon: 'eye' },
  },
  'beads-set': {
    easy: { numQuestions: 20, timeLimit: 0, title: 'Set Beads Value', icon: 'puzzle' },
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
    easy: { numQuestions: 50, timeLimit: 300, title: 'Square (Easy)', icon: 'sparkles' },
    medium: { numQuestions: 100, timeLimit: 600, title: 'Square (Medium)', icon: 'sparkles' },
    hard: { numQuestions: 150, timeLimit: 900, title: 'Square (Hard)', icon: 'sparkles' },
  },
  'square-input': {
    easy: { numQuestions: 50, timeLimit: 300, title: 'Master: Square (Easy)', icon: 'keyboard' },
    medium: { numQuestions: 100, timeLimit: 600, title: 'Master: Square (Medium)', icon: 'keyboard' },
    hard: { numQuestions: 150, timeLimit: 900, title: 'Master: Square (Hard)', icon: 'keyboard' },
  },
  'cube': {
    easy: { numQuestions: 50, timeLimit: 300, title: 'Cube (Easy)', icon: 'box' },
    medium: { numQuestions: 100, timeLimit: 600, title: 'Cube (Medium)', icon: 'box' },
    hard: { numQuestions: 150, timeLimit: 900, title: 'Cube (Hard)', icon: 'box' },
  },
  'cube-input': {
    easy: { numQuestions: 50, timeLimit: 300, title: 'Master: Cube (Easy)', icon: 'keyboard' },
    medium: { numQuestions: 100, timeLimit: 600, title: 'Master: Cube (Medium)', icon: 'keyboard' },
    hard: { numQuestions: 150, timeLimit: 900, title: 'Master: Cube (Hard)', icon: 'keyboard' },
  },
  'square-root': {
    easy: { numQuestions: 50, timeLimit: 300, title: 'Square Root (Easy)', icon: 'brain-circuit' },
    medium: { numQuestions: 100, timeLimit: 600, title: 'Square Root (Medium)', icon: 'brain-circuit' },
    hard: { numQuestions: 150, timeLimit: 900, title: 'Square Root (Hard)', icon: 'brain-circuit' },
  },
  'square-root-input': {
    easy: { numQuestions: 50, timeLimit: 300, title: 'Master: Square Root (Easy)', icon: 'keyboard' },
    medium: { numQuestions: 100, timeLimit: 600, title: 'Master: Square Root (Medium)', icon: 'keyboard' },
    hard: { numQuestions: 150, timeLimit: 900, title: 'Master: Square Root (Hard)', icon: 'keyboard' },
  },
  'cube-root': {
    easy: { numQuestions: 50, timeLimit: 300, title: 'Cube Root (Easy)', icon: 'brain-circuit' },
    medium: { numQuestions: 100, timeLimit: 600, title: 'Cube Root (Medium)', icon: 'brain-circuit' },
    hard: { numQuestions: 150, timeLimit: 900, title: 'Cube Root (Hard)', icon: 'brain-circuit' },
  },
  'cube-root-input': {
    easy: { numQuestions: 50, timeLimit: 300, title: 'Master: Cube Root (Easy)', icon: 'keyboard' },
    medium: { numQuestions: 100, timeLimit: 600, title: 'Master: Cube Root (Medium)', icon: 'keyboard' },
    hard: { numQuestions: 150, timeLimit: 900, title: 'Master: Cube Root (Hard)', icon: 'keyboard' },
  },
  'basic-addition-plus-4': { easy: { numQuestions: 50, timeLimit: 300, title: 'Formula: +4 = +5 - 1', icon: 'puzzle' } },
  'basic-addition-plus-3': { easy: { numQuestions: 50, timeLimit: 300, title: 'Formula: +3 = +5 - 2', icon: 'puzzle' } },
  'basic-addition-plus-2': { easy: { numQuestions: 50, timeLimit: 300, title: 'Formula: +2 = +5 - 3', icon: 'puzzle' } },
  'basic-addition-plus-1': { easy: { numQuestions: 50, timeLimit: 300, title: 'Formula: +1 = +5 - 4', icon: 'puzzle' } },
  'basic-subtraction-minus-4': { easy: { numQuestions: 50, timeLimit: 300, title: 'Formula: -4 = -5 + 1', icon: 'puzzle' } },
  'basic-subtraction-minus-3': { easy: { numQuestions: 50, timeLimit: 300, title: 'Formula: -3 = -5 + 2', icon: 'puzzle' } },
  'basic-subtraction-minus-2': { easy: { numQuestions: 50, timeLimit: 300, title: 'Formula: -2 = -5 + 3', icon: 'puzzle' } },
  'basic-subtraction-minus-1': { easy: { numQuestions: 50, timeLimit: 300, title: 'Formula: -1 = -5 + 4', icon: 'puzzle' } },
  'big-brother-addition-plus-9': { easy: { numQuestions: 50, timeLimit: 300, title: 'Formula: +9 = +10 - 1', icon: 'puzzle' } },
  'big-brother-addition-plus-8': { easy: { numQuestions: 50, timeLimit: 300, title: 'Formula: +8 = +10 - 2', icon: 'puzzle' } },
  'big-brother-subtraction-minus-9': { easy: { numQuestions: 50, timeLimit: 300, title: 'Formula: -9 = -10 + 1', icon: 'puzzle' } },
  'big-brother-subtraction-minus-8': { easy: { numQuestions: 50, timeLimit: 300, title: 'Formula: -8 = -10 + 2', icon: 'puzzle' } },
  'combination-plus-6': { easy: { numQuestions: 50, timeLimit: 300, title: 'Formula: +6 = +10 - 5 + 1', icon: 'puzzle' } },
  'combination-plus-7': { easy: { numQuestions: 50, timeLimit: 300, title: 'Formula: +7 = +10 - 5 + 2', icon: 'puzzle' } },
  'combination-plus-8': { easy: { numQuestions: 50, timeLimit: 300, title: 'Formula: +8 = +10 - 5 + 3', icon: 'puzzle' } },
  'combination-plus-9': { easy: { numQuestions: 50, timeLimit: 300, title: 'Formula: +9 = +10 - 5 + 4', icon: 'puzzle' } },
  'flash-anzan': {
    easy: { numQuestions: 50, timeLimit: 0, title: 'Novice Flash Anzan', icon: 'zap' },
    medium: { numQuestions: 50, timeLimit: 0, title: 'Expert Flash Anzan', icon: 'zap' },
    hard: { numQuestions: 50, timeLimit: 0, title: 'Elite Flash Anzan', icon: 'zap' },
    custom: { numQuestions: 50, timeLimit: 0, title: 'Anzan Custom Lab', icon: 'zap' }
  },
  'voice-anzan': {
    easy: { numQuestions: 50, timeLimit: 0, title: 'Novice Voice Anzan', icon: 'megaphone' },
    medium: { numQuestions: 50, timeLimit: 0, title: 'Expert Voice Anzan', icon: 'megaphone' },
    hard: { numQuestions: 50, timeLimit: 0, title: 'Elite Voice Anzan', icon: 'megaphone' },
    custom: { numQuestions: 50, timeLimit: 0, title: 'Voice Custom Lab', icon: 'megaphone' }
  },
};

export function getTestSettings(testId: TestType, difficulty: Difficulty): TestSettings | undefined {
  if (difficulty.startsWith('level-')) {
    const isBeadTest = testId === 'beads-identify' || testId === 'beads-set';
    if (isBeadTest) {
      const levelNum = parseInt(difficulty.replace('level-', ''), 10);
      return { numQuestions: 20, timeLimit: 0, title: `Beads Practice - Level ${levelNum}`, icon: testId === 'beads-identify' ? 'eye' : 'puzzle' };
    }
    if (testId === 'flash-anzan' || testId === 'voice-anzan') {
      const parts = difficulty.split('-');
      const levelNum = parts[parts.length - 1];
      const tier = parts[parts.length - 2];
      return { numQuestions: 50, timeLimit: 0, title: `${tier.toUpperCase()} Anzan - Level ${levelNum}`, icon: testId === 'voice-anzan' ? 'megaphone' : 'zap' };
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

export function deDuplicateQuestions(questions: Question[], prng: () => number = Math.random): Question[] {
  if (questions.length < 2) return questions;
  const result = shuffleArray([...questions], prng);
  for (let i = 0; i < result.length - 1; i++) {
    if (result[i].answer === result[i + 1].answer) {
      for (let j = i + 2; j < result.length; j++) {
        if (result[j].answer !== result[i].answer) {
          [result[i + 1], result[j]] = [result[j], result[i + 1]];
          break;
        }
      }
    }
  }
  return result;
}

export function generateOptions(correctAnswer: number, prng: () => number = Math.random): number[] {
  const options = new Set<number>([correctAnswer]);
  const range = Math.max(10, Math.abs(Math.floor(correctAnswer * 0.4)));
  while (options.size < 4) {
    const minOption = Math.max(0, correctAnswer - range);
    const maxOption = correctAnswer + range;
    const wrongAnswer = Math.floor(prng() * (maxOption - minOption + 1)) + minOption;
    if (wrongAnswer !== correctAnswer && wrongAnswer >= 0) options.add(wrongAnswer);
  }
  return shuffleArray(Array.from(options), prng);
}

export function generateGameQuestions(level: GameLevel, levelId: number): Question[] {
  let allQuestions: Question[] = [];
  if (level === 'general-practice') {
     // Spread all available formulas
     allQuestions = Object.values(preDefinedQuestions).flat();
  } else if (preDefinedQuestions[level as string]) {
     allQuestions = preDefinedQuestions[level as string];
  } else {
     // Fallback for dynamic mix levels
     allQuestions = Object.values(preDefinedQuestions).flat();
  }
  const positiveOnly = allQuestions.filter(q => q.answer >= 0);
  return deDuplicateQuestions(shuffleArray([...positiveOnly])).slice(0, 10);
}

export function generateFlashSequence(digits: number, rows: number, prng: () => number = Math.random, digits2: number = 0, ratio2: number = 0) {
  const sequence: number[] = [];
  let answer = 0;
  for (let i = 0; i < rows; i++) {
    const useD2 = prng() < ratio2 && digits2 > 0;
    const d = useD2 ? digits2 : digits;
    const num = getRandomInt(Math.pow(10, d - 1), Math.pow(10, d) - 1, prng);
    const op = (i === 0 || prng() > 0.3) ? 1 : -1;
    const val = num * op;
    if (answer + val < 0) { sequence.push(num); answer += num; }
    else { sequence.push(val); answer += val; }
  }
  return { sequence, answer };
}

export function generateTest(testId: TestType, difficulty: Difficulty, customSettings?: { rows?: number, digits?: number, delay?: number }): Question[] {
  const settings = getTestSettings(testId, difficulty);
  if (!settings && difficulty !== 'custom') return [];
  const coreTestId = testId.replace('-input', '');
  if (preDefinedQuestions[coreTestId]) return deDuplicateQuestions(shuffleArray([...preDefinedQuestions[coreTestId]])).slice(0, settings?.numQuestions || 50);
  
  if (coreTestId === 'addition-subtraction') {
    const questions: Question[] = [];
    const getRange = (d: string): [number, number] => (d === 'easy' ? [1, 9] : d === 'medium' ? [10, 99] : [100, 999]);
    const [min, max] = getRange(difficulty);
    for (let i = 0; i < (settings?.numQuestions || 50); i++) {
      let currentVal = getRandomInt(min, max);
      const numbers: (number | string)[] = [currentVal];
      for (let j = 0; j < 3; j++) {
        let att = 0, found = false;
        while (att < 50) {
          const op = Math.random() > 0.5 ? '+' : '-';
          const next = getRandomInt(min, max);
          const res = op === '+' ? currentVal + next : currentVal - next;
          if (res >= 0) { currentVal = res; numbers.push(op); numbers.push(next); found = true; break; }
          att++;
        }
        if (!found) { currentVal += 10; numbers.push('+'); numbers.push(10); }
      }
      questions.push({ text: numbers.join(' '), answer: currentVal, options: generateOptions(currentVal) });
    }
    return deDuplicateQuestions(questions);
  }
  if (testId === 'basic-add-sub-l1' || testId === 'basic-add-sub-l2') {
    const max = testId === 'basic-add-sub-l1' ? 9 : 99;
    const questions: Question[] = [];
    const isDirectDigitAdd = (d1: number, d2: number) => { const h1 = d1>=5?1:0, e1 = d1%5, h2 = d2>=5?1:0, e2 = d2%5; return h1+h2<=1 && e1+e2<=4; };
    const isDirectDigitSub = (d1: number, d2: number) => { const h1 = d1>=5?1:0, e1 = d1%5, h2 = d2>=5?1:0, e2 = d2%5; return h2<=h1 && e2<=e1; };
    const isDirectFull = (v: number, d: number, op: string) => {
        const v1 = v.toString().padStart(3,'0').split('').map(Number), v2 = d.toString().padStart(3,'0').split('').map(Number);
        for(let i=0; i<3; i++) if(op==='+') { if(!isDirectDigitAdd(v1[i],v2[i])) return false; } else if(!isDirectDigitSub(v1[i],v2[i])) return false;
        return true;
    };
    for (let i = 0; i < (settings?.numQuestions || 30); i++) {
        let currentVal = getRandomInt(max === 9 ? 1 : 10, max), numbers: (number | string)[] = [currentVal];
        for (let j = 0; j < 3; j++) {
            let att = 0;
            while(att < 50) {
                const op = Math.random() > 0.5 ? '+' : '-', d = getRandomInt(1, max > 9 ? 40 : max), res = op === '+' ? currentVal+d : currentVal-d;
                if(res >= 0 && res <= max && isDirectFull(currentVal, d, op)) { currentVal = res; numbers.push(op); numbers.push(d); break; }
                att++;
            }
        }
        questions.push({ text: numbers.join(' '), answer: currentVal, options: generateOptions(currentVal) });
    }
    return deDuplicateQuestions(questions);
  }
  if (testId === 'flash-anzan' || testId === 'voice-anzan') {
    const questions: Question[] = [];
    let rows = 3, delay = 2000, d1 = 1, d2 = 0, r2 = 0;
    if (difficulty === 'custom') { rows = customSettings?.rows || 10; delay = customSettings?.delay || 1000; d1 = customSettings?.digits || 2; }
    else if (difficulty.startsWith('level-')) {
      const level = parseInt(difficulty.split('-').pop() || '1', 10), step = (level - 1) / 49;
      rows = 3 + Math.floor(step * 7); delay = 2000 - Math.floor(step * 500);
      if (difficulty.includes('medium')) { d1 = 1; d2 = 2; r2 = step * 0.9; } else if (difficulty.includes('hard')) { d1 = 2; d2 = 3; r2 = step * 0.9; } else d1 = 1;
    }
    for (let i = 0; i < 50; i++) {
      const { sequence, answer } = generateFlashSequence(d1, rows, Math.random, d2, r2);
      questions.push({ text: sequence.map(n => n > 0 ? `+${n}` : n).join(' '), answer, options: generateOptions(answer), questionType: 'flash', sequence, delay });
    }
    return questions;
  }

  const questions: Question[] = [];
  for (let i = 0; i < (settings?.numQuestions || 50); i++) {
    let text = "", answer = 0;
    if (coreTestId === 'multiplication') {
      let m1, m2;
      if (difficulty === 'easy') { m1 = getRandomInt(2, 9); m2 = getRandomInt(2, 9); } 
      else if (difficulty === 'medium') { m1 = getRandomInt(10, 99); m2 = getRandomInt(2, 9); } 
      else { 
        // Dynamic mix for Hard: 3x1, 2x2, 4x1
        const t = Math.random(); 
        if (t < 0.4) { m1 = getRandomInt(100, 999); m2 = getRandomInt(2, 9); } 
        else if (t < 0.8) { m1 = getRandomInt(11, 99); m2 = getRandomInt(11, 99); } 
        else { m1 = getRandomInt(1000, 9999); m2 = getRandomInt(2, 9); } 
      }
      answer = m1 * m2; text = `${m1} × ${m2}`;
    } else if (coreTestId === 'division') {
      let q, div;
      if (difficulty === 'easy') { q = getRandomInt(2, 9); div = getRandomInt(2, 9); } 
      else if (difficulty === 'medium') { q = getRandomInt(10, 99); div = getRandomInt(2, 9); } 
      else { const t = Math.random(); if (t < 0.5) { q = getRandomInt(100, 999); div = getRandomInt(2, 9); } else { q = getRandomInt(100, 999); div = getRandomInt(11, 49); } }
      answer = q; text = `${q * div} ÷ ${div}`;
    } else if (coreTestId === 'square') {
        const [min, max] = difficulty === 'easy' ? [2, 15] : difficulty === 'medium' ? [16, 50] : [51, 99];
        const n = getRandomInt(min, max); answer = n * n; text = `${n}²`;
    } else if (coreTestId === 'cube') {
        const [min, max] = difficulty === 'easy' ? [2, 6] : difficulty === 'medium' ? [7, 15] : [16, 30];
        const n = getRandomInt(min, max); answer = n * n * n; text = `${n}³`;
    } else if (coreTestId === 'square-root') {
        const [min, max] = difficulty === 'easy' ? [2, 15] : difficulty === 'medium' ? [16, 50] : [51, 99];
        const n = getRandomInt(min, max); answer = n; text = `√${n * n}`;
    } else if (coreTestId === 'cube-root') {
        const [min, max] = difficulty === 'easy' ? [2, 6] : difficulty === 'medium' ? [7, 15] : [16, 30];
        const n = getRandomInt(min, max); answer = n; text = `³√${n * n * n}`;
    }
    questions.push({ text, answer, options: generateOptions(answer) });
  }
  return deDuplicateQuestions(questions);
}
