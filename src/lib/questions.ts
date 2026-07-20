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
    hard: { numQuestions: 75, timeLimit: 600, title: 'Cube Root (Hard)', icon: 'brain-circuit' },
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
  'big-brother-addition-plus-9': { easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: +9 = +10 - 1', icon: 'puzzle' } },
  'big-brother-addition-plus-90': { easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: +90 = +100 - 10', icon: 'puzzle' } },
  'big-brother-addition-plus-8': { easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: +8 = +10 - 2', icon: 'puzzle' } },
  'big-brother-addition-plus-80': { easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: +80 = +100 - 20', icon: 'puzzle' } },
  'big-brother-addition-plus-7': { easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: +7 = +10 - 3', icon: 'puzzle' } },
  'big-brother-addition-plus-70': { easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: +70 = +100 - 30', icon: 'puzzle' } },
  'big-brother-addition-plus-6': { easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: +6 = +10 - 4', icon: 'puzzle' } },
  'big-brother-addition-plus-60': { easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: +60 = +100 - 40', icon: 'puzzle' } },
  'big-brother-addition-plus-5': { easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: +5 = +10 - 5', icon: 'puzzle' } },
  'big-brother-addition-plus-50': { easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: +50 = +100 - 50', icon: 'puzzle' } },
  'big-brother-addition-plus-4': { easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: +4 = +10 - 6', icon: 'puzzle' } },
  'big-brother-addition-plus-40': { easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: +40 = +100 - 60', icon: 'puzzle' } },
  'big-brother-addition-plus-3': { easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: +3 = +10 - 7', icon: 'puzzle' } },
  'big-brother-addition-plus-30': { easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: +30 = +100 - 70', icon: 'puzzle' } },
  'big-brother-addition-plus-2': { easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: +2 = +10 - 8', icon: 'puzzle' } },
  'big-brother-addition-plus-20': { easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: +20 = +100 - 80', icon: 'puzzle' } },
  'big-brother-addition-plus-1': { easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: +1 = +10 - 9', icon: 'puzzle' } },
  'big-brother-addition-plus-10': { easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: +10 = +100 - 90', icon: 'puzzle' } },
  'big-brother-subtraction-minus-9': { easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: -9 = -10 + 1', icon: 'puzzle' } },
  'big-brother-subtraction-minus-90': { easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: -90 = -100 + 10', icon: 'puzzle' } },
  'big-brother-subtraction-minus-8': { easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: -8 = -10 + 2', icon: 'puzzle' } },
  'big-brother-subtraction-minus-80': { easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: -80 = -100 + 20', icon: 'puzzle' } },
  'big-brother-subtraction-minus-7': { easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: -7 = -10 + 3', icon: 'puzzle' } },
  'big-brother-subtraction-minus-70': { easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: -70 = -100 + 30', icon: 'puzzle' } },
  'big-brother-subtraction-minus-6': { easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: -6 = -10 + 4', icon: 'puzzle' } },
  'big-brother-subtraction-minus-60': { easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: -60 = -100 + 40', icon: 'puzzle' } },
  'big-brother-subtraction-minus-5': { easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: -5 = -10 + 5', icon: 'puzzle' } },
  'big-brother-subtraction-minus-50': { easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: -50 = -100 + 50', icon: 'puzzle' } },
  'big-brother-subtraction-minus-4': { easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: -4 = -10 + 6', icon: 'puzzle' } },
  'big-brother-subtraction-minus-40': { easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: -40 = -100 + 60', icon: 'puzzle' } },
  'big-brother-subtraction-minus-3': { easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: -3 = -10 + 7', icon: 'puzzle' } },
  'big-brother-subtraction-minus-30': { easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: -30 = -100 + 70', icon: 'puzzle' } },
  'big-brother-subtraction-minus-2': { easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: -2 = -10 + 8', icon: 'puzzle' } },
  'big-brother-subtraction-minus-20': { easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: -20 = -100 + 80', icon: 'puzzle' } },
  'big-brother-subtraction-minus-1': { easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: -1 = -10 + 9', icon: 'puzzle' } },
  'big-brother-subtraction-minus-10': { easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: -10 = -100 + 90', icon: 'puzzle' } },
  'combination-plus-6': { easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: +6 = +10 - 5 + 1', icon: 'puzzle' } },
  'combination-plus-60': { easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: +60 = +100 - 50 + 10', icon: 'puzzle' } },
  'combination-plus-7': { easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: +7 = +10 - 5 + 2', icon: 'puzzle' } },
  'combination-plus-70': { easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: +70 = +100 - 50 + 20', icon: 'puzzle' } },
  'combination-plus-8': { easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: +8 = +10 - 5 + 3', icon: 'puzzle' } },
  'combination-plus-80': { easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: +80 = +100 - 50 + 30', icon: 'puzzle' } },
  'combination-plus-9': { easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: +9 = +10 - 5 + 4', icon: 'puzzle' } },
  'combination-plus-90': { easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: +90 = +100 - 50 + 40', icon: 'puzzle' } },
  'combination-minus-6': { easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: -6 = -10 + 5 - 1', icon: 'puzzle' } },
  'combination-minus-60': { easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: -60 = -100 + 50 - 10', icon: 'puzzle' } },
  'combination-minus-7': { easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: -7 = -10 + 5 - 2', icon: 'puzzle' } },
  'combination-minus-70': { easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: -70 = -100 + 50 - 20', icon: 'puzzle' } },
  'combination-minus-8': { easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: -8 = -10 + 5 - 3', icon: 'puzzle' } },
  'combination-minus-80': { easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: -80 = -100 + 50 - 30', icon: 'puzzle' } },
  'combination-minus-9': { easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: -9 = -10 + 5 - 4', icon: 'puzzle' } },
  'combination-minus-90': { easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: -90 = -100 + 50 - 40', icon: 'puzzle' } },
};

const preDefinedQuestions: Record<string, Question[]> = {
  ...basicAdditionQuestions,
  ...basicSubtractionQuestions,
  ...bigBrotherAdditionQuestions,
  ...bigBrotherSubtractionQuestions,
  ...combinationAdditionQuestions,
  ...combinationSubtractionQuestions,
  ...masteryMixQuestions,
};

const gameQuestionMap: Record<string, string[]> = {
    'small-sister-plus-4': ['basic-addition-plus-4'],
    'small-sister-plus-3': ['basic-addition-plus-3'],
    'small-sister-plus-2': ['basic-addition-plus-2'],
    'small-sister-plus-1': ['basic-addition-plus-1'],
    'small-sister-minus-4': ['basic-subtraction-minus-4'],
    'small-sister-minus-3': ['basic-subtraction-minus-3'],
    'small-sister-minus-2': ['basic-subtraction-minus-2'],
    'small-sister-minus-1': ['basic-subtraction-minus-1'],
    'small-sister-all': ['basic-addition-plus-4', 'basic-addition-plus-3', 'basic-addition-plus-2', 'basic-addition-plus-1', 'basic-subtraction-minus-4', 'basic-subtraction-minus-3', 'basic-subtraction-minus-2', 'basic-subtraction-minus-1'],
    'big-brother-plus-9': ['big-brother-addition-plus-9'],
    'big-brother-plus-8': ['big-brother-addition-plus-8'],
    'big-brother-plus-7': ['big-brother-addition-plus-7'],
    'big-brother-plus-6': ['big-brother-addition-plus-6'],
    'big-brother-plus-5': ['big-brother-addition-plus-5'],
    'big-brother-plus-4': ['big-brother-addition-plus-4'],
    'big-brother-plus-3': ['big-brother-addition-plus-3'],
    'big-brother-plus-2': ['big-brother-addition-plus-2'],
    'big-brother-plus-1': ['big-brother-addition-plus-1'],
    'big-brother-minus-9': ['big-brother-subtraction-minus-9'],
    'big-brother-minus-8': ['big-brother-subtraction-minus-8'],
    'big-brother-minus-7': ['big-brother-subtraction-minus-7'],
    'big-brother-minus-6': ['big-brother-subtraction-minus-6'],
    'big-brother-minus-5': ['big-brother-subtraction-minus-5'],
    'big-brother-minus-4': ['big-brother-subtraction-minus-4'],
    'big-brother-minus-3': ['big-brother-subtraction-minus-3'],
    'big-brother-minus-2': ['big-brother-subtraction-minus-2'],
    'big-brother-minus-1': ['big-brother-subtraction-minus-1'],
    'big-brother-all': ['big-brother-addition-plus-9', 'big-brother-addition-plus-8', 'big-brother-addition-plus-7', 'big-brother-addition-plus-6', 'big-brother-addition-plus-5', 'big-brother-addition-plus-4', 'big-brother-addition-plus-3', 'big-brother-addition-plus-2', 'big-brother-addition-plus-1', 'big-brother-subtraction-minus-9', 'big-brother-subtraction-minus-8', 'big-brother-subtraction-minus-7', 'big-brother-subtraction-minus-6', 'big-brother-subtraction-minus-5', 'big-brother-subtraction-minus-4', 'big-brother-subtraction-minus-3', 'big-brother-subtraction-minus-2', 'big-brother-subtraction-minus-1'],
    'combination-plus-9': ['combination-plus-9'],
    'combination-plus-8': ['combination-plus-8'],
    'combination-plus-7': ['combination-plus-7'],
    'combination-plus-6': ['combination-plus-6'],
    'combination-minus-9': ['combination-minus-9'],
    'combination-minus-8': ['combination-minus-8'],
    'combination-minus-7': ['combination-minus-7'],
    'combination-minus-6': ['combination-minus-6'],
    'combination-all': ['combination-plus-9', 'combination-plus-8', 'combination-plus-7', 'combination-plus-6', 'combination-minus-9', 'combination-minus-8', 'combination-minus-7', 'combination-minus-6'],
    'mastery-mix-1': ['mastery-mix-1'],
    'mastery-mix-2': ['mastery-mix-2'],
    'mastery-mix-3': ['mastery-mix-3'],
    'mastery-mix-4': ['mastery-mix-4'],
    'mastery-mix-5': ['mastery-mix-5'],
    'mastery-mix-6': ['mastery-mix-6'],
    'mastery-mix-7': ['mastery-mix-7'],
    'mastery-mix-8': ['mastery-mix-8'],
    'mastery-mix-9': ['mastery-mix-9'],
    'mastery-mix-10': ['mastery-mix-10'],
    'mastery-mix-11': ['mastery-mix-11'],
    'mastery-mix-12': ['mastery-mix-12'],
};

export function getTestSettings(testId: TestType, difficulty: Difficulty): TestSettings | undefined {
  if (difficulty.startsWith('level-')) {
    const isBeadTest = testId === 'beads-identify' || testId === 'beads-set';
    if (isBeadTest) {
      const levelNum = parseInt(difficulty.replace('level-', ''), 10);
      let subTitle = "Mixed Training";
      if (levelNum <= 2) subTitle = "Single Digit";
      else if (levelNum <= 4) subTitle = "Double Digit";
      else if (levelNum <= 6) subTitle = "Triple Digit";
      else if (levelNum <= 8) subTitle = "4-Digit Advanced";
      else subTitle = "Grand Master Mix";

      return {
        numQuestions: 20,
        timeLimit: 0,
        title: `Beads Practice - Level ${levelNum} (${subTitle})`,
        icon: testId === 'beads-identify' ? 'eye' : 'puzzle'
      };
    }
    
    if (testId === 'flash-anzan') {
      const parts = difficulty.split('-');
      const levelNum = parts[parts.length - 1];
      const tier = parts[parts.length - 2];
      return {
        numQuestions: 50,
        timeLimit: 0,
        title: `${tier.toUpperCase()} Anzan - Level ${levelNum}`,
        icon: 'zap'
      };
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

/**
 * Enhanced shuffler that ensures no two consecutive questions have the same answer.
 */
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

/**
 * Exports generateOptions as required by curriculum modules.
 */
export function generateOptions(correctAnswer: number, prng: () => number = Math.random): number[] {
  const options = new Set<number>([correctAnswer]);
  const safeAnswer = Math.max(0, correctAnswer);
  const range = Math.max(10, Math.abs(Math.floor(safeAnswer * 0.4)));

  while (options.size < 4) {
    let wrongAnswer;
    if (safeAnswer < 10) {
        wrongAnswer = Math.floor(prng() * 20);
    } else {
        const minOption = Math.max(0, safeAnswer - range);
        const maxOption = safeAnswer + range;
        wrongAnswer = Math.floor(prng() * (maxOption - minOption + 1)) + minOption;
    }
    if (wrongAnswer !== safeAnswer && wrongAnswer >= 0) {
      options.add(wrongAnswer);
    }
  }
  return shuffleArray(Array.from(options), prng);
}

function isDirectDigitAdd(d1: number, d2: number): boolean {
  const h1 = d1 >= 5 ? 1 : 0;
  const e1 = d1 % 5;
  const h2 = d2 >= 5 ? 1 : 0;
  const e2 = d2 % 5;
  return h1 + h2 <= 1 && e1 + e2 <= 4;
}

function isDirectDigitSub(d1: number, d2: number): boolean {
  const h1 = d1 >= 5 ? 1 : 0;
  const e1 = d1 % 5;
  const h2 = d2 >= 5 ? 1 : 0;
  const e2 = d2 % 5;
  return h2 <= h1 && e2 <= e1;
}

function isDirectFull(val: number, delta: number, op: '+' | '-'): boolean {
  const v1 = val.toString().padStart(3, '0').split('').map(Number);
  const v2 = delta.toString().padStart(3, '0').split('').map(Number);
  for (let i = 0; i < 3; i++) {
    if (op === '+') {
      if (!isDirectDigitAdd(v1[i], v2[i])) return false;
    } else {
      if (!isDirectDigitSub(v1[i], v2[i])) return false;
    }
  }
  return true;
}

function generateDirectQuestion(max: number, numTerms: number = 3): Question {
  while (true) {
    let currentVal = getRandomInt(max === 9 ? 1 : 10, max);
    let numbers: (number | string)[] = [currentVal];
    let successCount = 0;

    for (let i = 0; i < numTerms - 1; i++) {
      let attempts = 0;
      let foundOp = false;
      while (attempts < 50) { 
        const op = Math.random() > 0.5 ? '+' : '-';
        const delta = getRandomInt(1, max > 9 ? 40 : max); 
        const nextVal = op === '+' ? currentVal + delta : currentVal - delta;
        if (nextVal >= 0 && nextVal <= max && isDirectFull(currentVal, delta, op)) {
          numbers.push(op);
          numbers.push(delta);
          currentVal = nextVal;
          foundOp = true;
          successCount++;
          break;
        }
        attempts++;
      }
      if (!foundOp) break; 
    }
    if (successCount >= numTerms - 1) {
      return { text: numbers.join(' '), answer: currentVal, options: generateOptions(currentVal) };
    }
  }
}

export function generateGameQuestions(level: GameLevel, levelId: number): Question[] {
  const questionKeys = gameQuestionMap[level];
  let allQuestions: Question[] = [];
  if (level === 'general-practice') allQuestions = Object.values(preDefinedQuestions).flat();
  else {
      questionKeys?.forEach(key => {
          if(preDefinedQuestions[key]) allQuestions.push(...preDefinedQuestions[key]);
      });
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

  if (testId === 'basic-add-sub-l1' || testId === 'basic-add-sub-l2') {
    const max = testId === 'basic-add-sub-l1' ? 9 : 99;
    const questions: Question[] = [];
    for (let i = 0; i < (settings?.numQuestions || 30); i++) {
      const numTerms = getRandomInt(4, 5);
      questions.push(generateDirectQuestion(max, numTerms));
    }
    return deDuplicateQuestions(questions);
  }

  if (testId === 'flash-anzan') {
    const questions: Question[] = [];
    let rows = 3, delay = 2000, d1 = 1, d2 = 0, r2 = 0;
    const numQs = 50;

    if (difficulty === 'custom') {
      rows = customSettings?.rows || 10;
      delay = customSettings?.delay || 1000;
      d1 = customSettings?.digits || 2;
    } else if (difficulty.startsWith('level-')) {
      const level = parseInt(difficulty.split('-').pop() || '1', 10);
      const linearStep = (level - 1) / 49;
      rows = 3 + Math.floor(linearStep * 7); 
      delay = 2000 - Math.floor(linearStep * 500); 
      if (difficulty.includes('medium')) { d1 = 1; d2 = 2; r2 = linearStep * 0.9; }
      else if (difficulty.includes('hard')) { d1 = 2; d2 = 3; r2 = linearStep * 0.9; }
      else { d1 = 1; }
    }

    for (let i = 0; i < numQs; i++) {
      const { sequence, answer } = generateFlashSequence(d1, rows, Math.random, d2, r2);
      questions.push({ text: sequence.map(n => n > 0 ? `+${n}` : n).join(' '), answer, options: generateOptions(answer), questionType: 'flash', sequence, delay });
    }
    return questions;
  }

  const coreTestId = testId.replace('-input', '');
  if (preDefinedQuestions[coreTestId]) return deDuplicateQuestions([...preDefinedQuestions[coreTestId]]).slice(0, settings!.numQuestions);

  const questions: Question[] = [];
  const getNumberRange = (diff: string): [number, number] => {
    if (diff === 'easy') return [1, 9];
    if (diff === 'medium') return [10, 99];
    return [100, 999];
  };

  const numQuestions = settings?.numQuestions || 50;
  for (let i = 0; i < numQuestions; i++) {
    let questionText = "";
    let answer = 0;
    const [min, max] = getNumberRange(difficulty);

    if (coreTestId === 'addition-subtraction') {
      let currentVal = getRandomInt(min, max);
      const numbers: (number | string)[] = [currentVal];
      for (let j = 0; j < 3; j++) {
        let attempts = 0, foundOp = false;
        while(attempts < 50) {
            let op: '+' | '-' = Math.random() > 0.5 ? '+' : '-';
            let next = getRandomInt(min, max);
            const res = op === '+' ? currentVal + next : currentVal - next;
            if (res >= 0) { currentVal = res; numbers.push(op); numbers.push(next); foundOp = true; break; }
            attempts++;
        }
        if (!foundOp) { currentVal += 10; numbers.push('+'); numbers.push(10); }
      }
      questionText = numbers.join(' ');
      answer = currentVal;
    } else if (coreTestId === 'multiplication') {
      const m1 = getRandomInt(min, difficulty === 'easy' ? 9 : 99);
      const m2 = getRandomInt(2, 9);
      answer = m1 * m2;
      questionText = `${m1} × ${m2}`;
    } else if (coreTestId === 'division') {
      const divisor = getRandomInt(2, 9);
      answer = getRandomInt(min, max);
      questionText = `${answer * divisor} ÷ ${divisor}`;
    } else if (coreTestId === 'square') {
      const n = getRandomInt(difficulty === 'easy' ? 2 : 11, difficulty === 'easy' ? 12 : 50);
      answer = n * n;
      questionText = `${n}²`;
    } else if (coreTestId === 'cube') {
      const n = getRandomInt(2, difficulty === 'easy' ? 5 : 15);
      answer = n * n * n;
      questionText = `${n}³`;
    } else if (coreTestId === 'square-root') {
      const n = getRandomInt(2, 30);
      answer = n;
      questionText = `√${n * n}`;
    } else if (coreTestId === 'cube-root') {
      const n = getRandomInt(2, 15);
      answer = n;
      questionText = `³√${n * n * n}`;
    }
    questions.push({ text: questionText, answer, options: generateOptions(answer) });
  }
  return deDuplicateQuestions(questions);
}
