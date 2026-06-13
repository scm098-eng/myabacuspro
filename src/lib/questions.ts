
'use client';

import type { Question, Difficulty, TestType, TestSettings, GameLevel } from '@/types';
import { basicAdditionQuestions } from './question-data/basic-addition';
import { basicSubtractionQuestions } from './question-data/basic-subtraction';
import { bigBrotherAdditionQuestions } from './question-data/big-brother-addition';
import { bigBrotherSubtractionQuestions } from './question-data/big-brother-subtraction';
import { combinationAdditionQuestions } from './question-data/combination-addition';
import { combinationSubtractionQuestions } from './question-data/combination-subtraction';

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

const smallSisterKeys = Object.keys(basicAdditionQuestions).concat(Object.keys(basicSubtractionQuestions));
const bigBrotherKeys = Object.keys(bigBrotherAdditionQuestions).concat(Object.keys(bigBrotherSubtractionQuestions));
const combinationKeys = Object.keys(combinationAdditionQuestions).concat(Object.keys(combinationSubtractionQuestions));

const gameQuestionMap: Record<GameLevel, string[]> = {
    'small-sister-plus-4': ['basic-addition-plus-4'],
    'small-sister-plus-3': ['basic-addition-plus-3'],
    'small-sister-plus-2': ['basic-addition-plus-2'],
    'small-sister-plus-1': ['basic-addition-plus-1'],
    'small-sister-minus-4': ['basic-subtraction-minus-4'],
    'small-sister-minus-3': ['basic-subtraction-minus-3'],
    'small-sister-minus-2': ['basic-subtraction-minus-2'],
    'small-sister-minus-1': ['basic-subtraction-minus-1'],
    'small-sister-all': smallSisterKeys,
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
    'big-brother-all': bigBrotherKeys,
    'combination-plus-9': ['combination-plus-9'],
    'combination-plus-8': ['combination-plus-8'],
    'combination-plus-7': ['combination-plus-7'],
    'combination-plus-6': ['combination-plus-6'],
    'combination-minus-9': ['combination-minus-9'],
    'combination-minus-8': ['combination-minus-8'],
    'combination-minus-7': ['combination-minus-7'],
    'combination-minus-6': ['combination-minus-6'],
    'combination-all': combinationKeys,
    'general-practice': [], 
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
  }
  return TEST_CONFIG[testId]?.[difficulty as keyof Partial<Record<Difficulty, TestSettings>>] as TestSettings | undefined;
}

export function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 * Enhanced shuffler that ensures no two consecutive questions have the same answer.
 */
export function deDuplicateQuestions(questions: Question[]): Question[] {
  if (questions.length < 2) return questions;
  
  const result = [...questions];
  // 1. Initial Fisher-Yates shuffle
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  // 2. Scan and break consecutive identical answers
  for (let i = 0; i < result.length - 1; i++) {
    if (result[i].answer === result[i + 1].answer) {
      // Find a candidate further down the list with a different answer
      for (let j = i + 2; j < result.length; j++) {
        if (result[j].answer !== result[i].answer) {
          // Swap result[i+1] with result[j]
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

export function generateOptions(correctAnswer: number): number[] {
  const options = new Set<number>([correctAnswer]);
  const safeAnswer = Math.max(0, correctAnswer);
  const range = Math.max(10, Math.abs(Math.floor(safeAnswer * 0.4)));

  while (options.size < 4) {
    let wrongAnswer;
    if (safeAnswer < 10) {
        wrongAnswer = getRandomInt(0, 20);
    } else {
        const minOption = Math.max(0, safeAnswer - range);
        const maxOption = safeAnswer + range;
        wrongAnswer = getRandomInt(minOption, maxOption);
    }
    if (wrongAnswer !== safeAnswer && wrongAnswer >= 0) {
      options.add(wrongAnswer);
    }
  }
  return shuffleArray(Array.from(options));
}

function isDirectDigitAdd(d1: number, d2: number): boolean {
  const h1 = d1 >= 5 ? 1 : 0;
  const e1 = d1 % 5;
  const h2 = d2 >= 5 ? 1 : 0;
  const e2 = d2 % 5;
  if (h1 + h2 > 1) return false;
  if (e1 + e2 > 4) return false;
  return true;
}

function isDirectDigitSub(d1: number, d2: number): boolean {
  const h1 = d1 >= 5 ? 1 : 0;
  const e1 = d1 % 5;
  const h2 = d2 >= 5 ? 1 : 0;
  const e2 = d2 % 5;
  if (h2 > h1) return false;
  if (e2 > e1) return false;
  return true;
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
      const answer = currentVal;
      return {
        text: numbers.join(' '),
        answer: answer,
        options: generateOptions(answer)
      };
    }
  }
}

function generateEliteMultiStepMath(levelId: number): Question[] {
    const questions: Question[] = [];
    const count = 20;
    const stepsCount = levelId < 150 ? 3 : (levelId < 300 ? 4 : 5);

    for (let i = 0; i < count; i++) {
        let currentTotal = getRandomInt(10, 50);
        let text = `${currentTotal}`;
        
        for (let s = 1; s < stepsCount; s++) {
            const isDouble = Math.random() > 0.5;
            const nextVal = isDouble ? getRandomInt(10, 50) : getRandomInt(1, 9);
            const op = Math.random() > 0.5 ? '+' : '-';
            
            if (op === '-') {
                if (currentTotal >= nextVal) {
                    currentTotal -= nextVal;
                    text += ` - ${nextVal}`;
                } else {
                    currentTotal += nextVal;
                    text += ` + ${nextVal}`;
                }
            } else {
                currentTotal += nextVal;
                text += ` + ${nextVal}`;
            }
        }
        
        questions.push({
            text,
            answer: currentTotal,
            options: generateOptions(currentTotal)
        });
    }
    
    return deDuplicateQuestions(questions);
}

export function generateGameQuestions(level: GameLevel, levelId?: number): Question[] {
    if (levelId && levelId > 50) {
        return generateEliteMultiStepMath(levelId);
    }

    const questionKeys = gameQuestionMap[level];
    let allQuestions: Question[] = [];

    if (level === 'general-practice') {
        allQuestions = Object.values(preDefinedQuestions).flat();
    } else {
        questionKeys.forEach(key => {
            if(preDefinedQuestions[key]) {
                allQuestions.push(...preDefinedQuestions[key]);
            }
        });
    }

    const positiveOnlyQuestions = allQuestions.filter(q => q.answer >= 0);
    return deDuplicateQuestions(positiveOnlyQuestions).slice(0, 20); 
}

export function generateTest(testId: TestType, difficulty: Difficulty): Question[] {
  const settings = getTestSettings(testId, difficulty);
  if (!settings) return [];

  if (testId === 'basic-add-sub-l1' || testId === 'basic-add-sub-l2') {
    const max = testId === 'basic-add-sub-l1' ? 9 : 99;
    const questions: Question[] = [];
    for (let i = 0; i < settings.numQuestions; i++) {
      const numTerms = getRandomInt(4, 5);
      questions.push(generateDirectQuestion(max, numTerms));
    }
    return deDuplicateQuestions(questions);
  }

  const coreTestId = testId.replace('-input', '');
  if (preDefinedQuestions[coreTestId]) {
      const allQuestions = preDefinedQuestions[coreTestId].filter(q => q.answer >= 0);
      return deDuplicateQuestions([...allQuestions]).slice(0, settings.numQuestions);
  }

  const questions: Question[] = [];
  
  if (testId === 'beads-identify' || testId === 'beads-set') {
    const questionType = testId === 'beads-identify' ? 'identify' : 'set';
    const levelNum = difficulty.startsWith('level-') ? parseInt(difficulty.replace('level-', ''), 10) : 1;
    
    for(let i=0; i<settings.numQuestions; i++) {
      let maxDigits = 1;
      if (levelNum <= 2) maxDigits = 1; 
      else if (levelNum <= 4) maxDigits = 2;
      else if (levelNum <= 6) maxDigits = 3;
      else if (levelNum <= 8) maxDigits = 4;
      else maxDigits = 4;

      let digits = 1;
      if (levelNum <= 8) {
          digits = maxDigits;
      } else {
          digits = getRandomInt(1, 4);
      }

      const minRange = Math.pow(10, digits - 1);
      const maxRange = Math.pow(10, digits) - 1;
      const answer = getRandomInt(minRange, maxRange);
      
      questions.push({ 
        text: '', 
        answer: answer, 
        options: generateOptions(answer), 
        questionType 
      });
    }
    return deDuplicateQuestions(questions);
  }

  for (let i = 0; i < settings.numQuestions; i++) {
      let questionText: string;
      let answer: number;

      switch (coreTestId) {
        case 'addition-subtraction': {
          const [min, max] = getNumberRange(difficulty);
          const numTerms = 4;
          let tempResult = getRandomInt(min, max);
          let numbers: (number | string)[] = [tempResult];

          for (let j = 0; j < numTerms - 1; j++) {
              let op: '+' | '-' = getRandomInt(0, 1) === 0 ? '+' : '-';
              const nextNum = getRandomInt(min, max);
              if (op === '-' && tempResult < nextNum) op = '+';
              numbers.push(op);
              numbers.push(nextNum);
              if (op === '+') tempResult += nextNum;
              else tempResult -= nextNum;
          }
          questionText = numbers.join(' ');
          answer = tempResult;
          break;
        }
        case 'multiplication': {
          const [min, max] = getNumberRange(difficulty);
          const m1_max = difficulty === 'easy' ? 9 : (difficulty === 'medium' ? 99 : 999);
          const m2_max = difficulty === 'hard' ? 99 : 9;
          const m1 = getRandomInt(min, m1_max);
          const m2 = getRandomInt(1, m2_max);
          answer = m1 * m2;
          questionText = `${m1} × ${m2}`;
          break;
        }
        case 'division': {
          const divisor = getRandomInt(2, 9);
          const [answer_min, answer_max] = getNumberRange(difficulty);
          answer = getRandomInt(answer_min, answer_max);
          const dividend = divisor * answer;
          questionText = `${dividend} ÷ ${divisor}`;
          break;
        }
        case 'square': {
          let num: number;
          if (difficulty === 'easy') num = getRandomInt(1, 12);
          else if (difficulty === 'medium') num = getRandomInt(13, 30);
          else num = getRandomInt(31, 99);
          answer = num * num;
          questionText = `${num}²`;
          break;
        }
        case 'cube': {
          let num: number;
          if (difficulty === 'easy') num = getRandomInt(1, 5);
          else if (difficulty === 'medium') num = getRandomInt(6, 15);
          else num = getRandomInt(16, 30);
          answer = num * num * num;
          questionText = `${num}³`;
          break;
        }
        case 'square-root': {
          let root: number;
          if (difficulty === 'easy') root = getRandomInt(1, 12);
          else if (difficulty === 'medium') root = getRandomInt(13, 30);
          else root = getRandomInt(31, 99);
          answer = root;
          questionText = `√${root * root}`;
          break;
        }
        case 'cube-root': {
          let root: number;
          if (difficulty === 'easy') root = getRandomInt(1, 5);
          else if (difficulty === 'medium') root = getRandomInt(6, 15);
          else root = getRandomInt(16, 30);
          answer = root;
          questionText = `³√${root * root * root}`;
          break;
        }
        default:
          questionText = "1 + 1";
          answer = 2;
          break;
      }

      questions.push({
        text: questionText,
        options: generateOptions(answer),
        answer: answer,
      });
  }
  return deDuplicateQuestions(questions);
}

export function getNumberRange(difficulty: Difficulty): [number, number] {
    switch (difficulty) {
        case 'easy': return [1, 9];
        case 'medium': return [10, 99];
        case 'hard': return [100, 999];
        default: return [1, 9];
    }
}
