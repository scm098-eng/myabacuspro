
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
  'addition-subtraction': {
    easy: { numQuestions: 50, timeLimit: 300, title: 'Addition & Subtraction (Easy)', icon: 'brain-circuit' },
    medium: { numQuestions: 100, timeLimit: 600, title: 'Addition & Subtraction (Medium)', icon: 'brain-circuit' },
    hard: { numQuestions: 150, timeLimit: 900, title: 'Addition & Subtraction (Hard)', icon: 'brain-circuit' },
  },
  multiplication: {
    easy: { numQuestions: 50, timeLimit: 300, title: 'Multiplication (Easy)', icon: 'x' },
    medium: { numQuestions: 100, timeLimit: 600, title: 'Multiplication (Medium)', icon: 'x' },
    hard: { numQuestions: 150, timeLimit: 900, title: 'Multiplication (Hard)', icon: 'x' },
  },
  division: {
    easy: { numQuestions: 50, timeLimit: 300, title: 'Division (Easy)', icon: 'divide' },
    medium: { numQuestions: 100, timeLimit: 600, title: 'Division (Medium)', icon: 'divide' },
    hard: { numQuestions: 150, timeLimit: 900, title: 'Division (Hard)', icon: 'divide' },
  },
  'basic-addition-plus-4': {
    easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: +4 = +5 - 1', icon: 'puzzle' },
  },
  'basic-addition-plus-40': {
    easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: +40 = +50 - 10', icon: 'puzzle' },
  },
  'basic-addition-plus-3': {
    easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: +3 = +5 - 2', icon: 'puzzle' },
  },
  'basic-addition-plus-30': {
    easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: +30 = +50 - 20', icon: 'puzzle' },
  },
  'basic-addition-plus-2': {
    easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: +2 = +5 - 3', icon: 'puzzle' },
  },
  'basic-addition-plus-20': {
    easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: +20 = +50 - 30', icon: 'puzzle' },
  },
  'basic-addition-plus-1': {
    easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: +1 = +5 - 4', icon: 'puzzle' },
  },
  'basic-addition-plus-10': {
    easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: +10 = +50 - 40', icon: 'puzzle' },
  },
  'basic-subtraction-minus-4': {
    easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: -4 = -5 + 1', icon: 'puzzle' },
  },
  'basic-subtraction-minus-40': {
    easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: -40 = -50 + 10', icon: 'puzzle' },
  },
  'basic-subtraction-minus-3': {
    easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: -3 = -5 + 2', icon: 'puzzle' },
  },
  'basic-subtraction-minus-30': {
    easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: -30 = -50 + 20', icon: 'puzzle' },
  },
  'basic-subtraction-minus-2': {
    easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: -2 = -5 + 3', icon: 'puzzle' },
  },
  'basic-subtraction-minus-20': {
    easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: -20 = -50 + 30', icon: 'puzzle' },
  },
  'basic-subtraction-minus-1': {
    easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: -1 = -5 + 4', icon: 'puzzle' },
  },
  'basic-subtraction-minus-10': {
    easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: -10 = -50 + 40', icon: 'puzzle' },
  },
  'big-brother-addition-plus-9': {
    easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: +9 = +10 - 1', icon: 'puzzle' },
  },
  'big-brother-addition-plus-90': {
    easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: +90 = +100 - 10', icon: 'puzzle' },
  },
  'big-brother-addition-plus-8': {
    easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: +8 = +10 - 2', icon: 'puzzle' },
  },
  'big-brother-addition-plus-80': {
    easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: +80 = +100 - 20', icon: 'puzzle' },
  },
  'big-brother-addition-plus-7': {
    easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: +7 = +10 - 3', icon: 'puzzle' },
  },
  'big-brother-addition-plus-70': {
    easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: +70 = +100 - 30', icon: 'puzzle' },
  },
  'big-brother-addition-plus-6': {
    easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: +6 = +10 - 4', icon: 'puzzle' },
  },
  'big-brother-addition-plus-60': {
    easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: +60 = +100 - 40', icon: 'puzzle' },
  },
  'big-brother-addition-plus-5': {
    easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: +5 = +10 - 5', icon: 'puzzle' },
  },
  'big-brother-addition-plus-50': {
    easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: +50 = +100 - 50', icon: 'puzzle' },
  },
  'big-brother-addition-plus-4': {
    easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: +4 = +10 - 6', icon: 'puzzle' },
  },
  'big-brother-addition-plus-40': {
    easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: +40 = +100 - 60', icon: 'puzzle' },
  },
  'big-brother-addition-plus-3': {
    easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: +3 = +10 - 7', icon: 'puzzle' },
  },
  'big-brother-addition-plus-30': {
    easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: +30 = +100 - 70', icon: 'puzzle' },
  },
  'big-brother-addition-plus-2': {
    easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: +2 = +10 - 8', icon: 'puzzle' },
  },
  'big-brother-addition-plus-20': {
    easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: +20 = +100 - 80', icon: 'puzzle' },
  },
  'big-brother-addition-plus-1': {
    easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: +1 = +10 - 9', icon: 'puzzle' },
  },
  'big-brother-addition-plus-10': {
    easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: +10 = +100 - 90', icon: 'puzzle' },
  },
   'big-brother-subtraction-minus-9': {
    easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: -9 = -10 + 1', icon: 'puzzle' },
  },
  'big-brother-subtraction-minus-90': {
    easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: -90 = -100 + 10', icon: 'puzzle' },
  },
  'big-brother-subtraction-minus-8': {
    easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: -8 = -10 + 2', icon: 'puzzle' },
  },
  'big-brother-subtraction-minus-80': {
    easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: -80 = -100 + 20', icon: 'puzzle' },
  },
  'big-brother-subtraction-minus-7': {
    easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: -7 = -10 + 3', icon: 'puzzle' },
  },
  'big-brother-subtraction-minus-70': {
    easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: -70 = -100 + 30', icon: 'puzzle' },
  },
  'big-brother-subtraction-minus-6': {
    easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: -6 = -10 + 4', icon: 'puzzle' },
  },
  'big-brother-subtraction-minus-60': {
    easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: -60 = -100 + 40', icon: 'puzzle' },
  },
  'big-brother-subtraction-minus-5': {
    easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: -5 = -10 + 5', icon: 'puzzle' },
  },
  'big-brother-subtraction-minus-50': {
    easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: -50 = -100 + 50', icon: 'puzzle' },
  },
  'big-brother-subtraction-minus-4': {
    easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: -4 = -10 + 6', icon: 'puzzle' },
  },
  'big-brother-subtraction-minus-40': {
    easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: -40 = -100 + 60', icon: 'puzzle' },
  },
  'big-brother-subtraction-minus-3': {
    easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: -3 = -10 + 7', icon: 'puzzle' },
  },
  'big-brother-subtraction-minus-30': {
    easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: -30 = -100 + 70', icon: 'puzzle' },
  },
  'big-brother-subtraction-minus-2': {
    easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: -2 = -10 + 8', icon: 'puzzle' },
  },
  'big-brother-subtraction-minus-20': {
    easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: -20 = -100 + 80', icon: 'puzzle' },
  },
  'big-brother-subtraction-minus-1': {
    easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: -1 = -10 + 9', icon: 'puzzle' },
  },
  'big-brother-subtraction-minus-10': {
    easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: -10 = -100 + 90', icon: 'puzzle' },
  },
   'combination-plus-6': {
    easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: +6 = +10 - 5 + 1', icon: 'puzzle' },
  },
  'combination-plus-60': {
    easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: +60 = +100 - 50 + 10', icon: 'puzzle' },
  },
  'combination-plus-7': {
    easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: +7 = +10 - 5 + 2', icon: 'puzzle' },
  },
  'combination-plus-70': {
    easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: +70 = +100 - 50 + 20', icon: 'puzzle' },
  },
  'combination-plus-8': {
    easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: +8 = +10 - 5 + 3', icon: 'puzzle' },
  },
  'combination-plus-80': {
    easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: +80 = +100 - 50 + 30', icon: 'puzzle' },
  },
  'combination-plus-9': {
    easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: +9 = +10 - 5 + 4', icon: 'puzzle' },
  },
  'combination-plus-90': {
    easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: +90 = +100 - 50 + 40', icon: 'puzzle' },
  },
  'combination-minus-6': {
    easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: -6 = -10 + 5 - 1', icon: 'puzzle' },
  },
  'combination-minus-60': {
    easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: -60 = -100 + 50 - 10', icon: 'puzzle' },
  },
  'combination-minus-7': {
    easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: -7 = -10 + 5 - 2', icon: 'puzzle' },
  },
  'combination-minus-70': {
    easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: -70 = -100 + 50 - 20', icon: 'puzzle' },
  },
  'combination-minus-8': {
    easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: -8 = -10 + 5 - 3', icon: 'puzzle' },
  },
  'combination-minus-80': {
    easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: -80 = -100 + 50 - 30', icon: 'puzzle' },
  },
  'combination-minus-9': {
    easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: -9 = -10 + 5 - 4', icon: 'puzzle' },
  },
  'combination-minus-90': {
    easy: { numQuestions: 28, timeLimit: 480, title: 'Formula: -90 = -100 + 50 - 40', icon: 'puzzle' },
  },
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
  return TEST_CONFIG[testId]?.[difficulty] as TestSettings | undefined;
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export function generateOptions(correctAnswer: number): number[] {
  const options = new Set<number>([correctAnswer]);
  const range = Math.max(10, Math.abs(Math.floor(correctAnswer * 0.2)));

  while (options.size < 4) {
    let wrongAnswer;
    if (correctAnswer < 10 && correctAnswer >= 0) {
        wrongAnswer = getRandomInt(0, 9);
    } else {
        const minOption = Math.max(0, correctAnswer - range);
        const maxOption = correctAnswer + range;
        wrongAnswer = getRandomInt(minOption, maxOption);
    }
    
    if (wrongAnswer !== correctAnswer) {
      options.add(wrongAnswer);
    }
  }
  return shuffleArray(Array.from(options));
}

export function generateGameQuestions(level: GameLevel): Question[] {
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

    return shuffleArray(allQuestions).slice(0, 20); // Limit to 20 questions per game level
}

export function generateTest(testId: TestType, difficulty: Difficulty): Question[] {
  const settings = getTestSettings(testId, difficulty);
  if (!settings) {
    return [];
  }

  if (preDefinedQuestions[testId]) {
      const allQuestions = preDefinedQuestions[testId];
      // For formula tests, we want to ensure variety by shuffling.
      return shuffleArray([...allQuestions]).slice(0, settings.numQuestions);
  }

  const questions: Question[] = [];
  
  if (testId === 'beads-identify' || testId === 'beads-set') {
    const questionType = testId === 'beads-identify' ? 'identify' : 'set';
    
    // 5 questions from 1-9
    for(let i=0; i<5; i++) questions.push({ text: '', answer: getRandomInt(1,9), options: [], questionType });
    // 5 questions from 10-99
    for(let i=0; i<5; i++) questions.push({ text: '', answer: getRandomInt(10,99), options: [], questionType });
    // 10 questions from 100-999
    for(let i=0; i<10; i++) questions.push({ text: '', answer: getRandomInt(100,999), options: [], questionType });

    return shuffleArray(questions);
  }

  const [min, max] = getNumberRange(difficulty);

  for (let i = 0; i < settings.numQuestions; i++) {
      let questionText: string;
      let answer: number;

      switch (testId) {
        case 'addition-subtraction': {
          const numTerms = 4;
          let numbers: (number | string)[] = [];
          let tempResult = getRandomInt(min, max);
          numbers.push(tempResult);

          for (let j = 0; j < numTerms - 1; j++) {
              let op: '+' | '-' = getRandomInt(0, 1) === 0 ? '+' : '-';
              const nextNum = getRandomInt(min, max);
              
              if (op === '-' && tempResult < nextNum) {
                  op = '+';
              }
              
              numbers.push(op);
              numbers.push(nextNum);

              if (op === '+') {
                  tempResult += nextNum;
              } else {
                  tempResult -= nextNum;
              }
          }
          questionText = numbers.join(' ');
          answer = tempResult;
          break;
        }
        
        case 'multiplication':
          const m1_max = difficulty === 'easy' ? 9 : (difficulty === 'medium' ? 99 : 999);
          const m2_max = difficulty === 'hard' ? 99 : 9;
          const m1 = getRandomInt(min, m1_max);
          const m2 = getRandomInt(1, m2_max);
          answer = m1 * m2;
          questionText = `${m1} × ${m2}`;
          break;

        case 'division':
          const divisor = getRandomInt(2, 9);
          const [answer_min, answer_max] = getNumberRange(difficulty);
          answer = getRandomInt(answer_min, answer_max);
          const dividend = divisor * answer;
          questionText = `${dividend} ÷ ${divisor}`;
          break;

        default:
          // Fallback for any formula tests without predefined questions yet
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

  return questions;
}

function getNumberRange(difficulty: Difficulty): [number, number] {
    switch (difficulty) {
        case 'easy': return [1, 9];
        case 'medium': return [10, 99];
        case 'hard': return [100, 999];
        default: return [1, 9];
    }
}
