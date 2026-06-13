
'use client';

import type { Question, ExamGroup } from '@/types';
import { generateTest, deDuplicateQuestions, getRandomInt, generateOptions, shuffleArray } from './questions';
import { differenceInYears, parseISO, isValid } from 'date-fns';

/**
 * Default fallback dates.
 */
export const DEFAULT_EXAM_DATE = new Date('2026-05-25T12:30:00');
export const DEFAULT_EXAM_END_TIME = new Date('2026-05-25T16:00:00');

export function getExamTimeLimit(age: number): number {
  if (age >= 5 && age <= 10) return 10 * 60;
  if (age >= 11 && age <= 13) return 8 * 60;
  if (age >= 14) return 7 * 60;
  return 10 * 60;
}

export function calculateAge(dob: string | undefined): number {
  if (!dob) return 10;
  const birthDate = parseISO(dob);
  if (!isValid(birthDate)) return 10;
  return differenceInYears(new Date(), birthDate);
}

function sampleQuestions(questions: Question[], count: number): Question[] {
  return shuffleArray([...questions]).slice(0, count);
}

function generateMultiplication(m1Min: number, m1Max: number, m2Min: number, m2Max: number, count: number): Question[] {
  const result: Question[] = [];
  for (let i = 0; i < count; i++) {
    const m1 = getRandomInt(m1Min, m1Max);
    const m2 = getRandomInt(m2Min, m2Max);
    const answer = m1 * m2;
    result.push({
      text: `${m1} × ${m2}`,
      answer: answer,
      options: generateOptions(answer)
    });
  }
  return result;
}

function generateDivision(answerMin: number, answerMax: number, divisorMin: number, divisorMax: number, count: number): Question[] {
  const result: Question[] = [];
  for (let i = 0; i < count; i++) {
    const divisor = getRandomInt(divisorMin, divisorMax);
    const answer = getRandomInt(answerMin, answerMax);
    const dividend = divisor * answer;
    result.push({
      text: `${dividend} ÷ ${divisor}`,
      answer: answer,
      options: generateOptions(answer)
    });
  }
  return result;
}

export function generateExamQuestions(group: ExamGroup): Question[] {
  let finalPool: Question[] = [];
  
  switch (group) {
    case 'A':
      finalPool = [
        ...sampleQuestions(generateTest('beads-identify', 'level-2'), 30),
        ...sampleQuestions(generateTest('beads-identify', 'level-4'), 30),
        ...sampleQuestions(generateTest('beads-identify', 'level-6'), 30),
        ...sampleQuestions(generateTest('basic-add-sub-l1', 'easy'), 30),
        ...sampleQuestions(generateTest('basic-add-sub-l2', 'easy'), 30)
      ];
      break;
    case 'B':
      finalPool = [
        ...sampleQuestions(generateTest('basic-addition-plus-4', 'easy'), 30),
        ...sampleQuestions(generateTest('big-brother-addition-plus-9', 'easy'), 40),
        ...sampleQuestions(generateTest('combination-plus-6', 'easy'), 40),
        ...sampleQuestions(generateTest('addition-subtraction', 'medium'), 40)
      ];
      break;
    case 'C':
      finalPool = [
        ...sampleQuestions(generateTest('addition-subtraction-input', 'easy'), 50),
        ...sampleQuestions(generateTest('addition-subtraction-input', 'medium'), 50),
        ...sampleQuestions(generateTest('addition-subtraction-input', 'hard'), 50)
      ];
      break;
    case 'D':
      finalPool = [
        ...sampleQuestions(generateTest('addition-subtraction-input', 'medium'), 50),
        ...sampleQuestions(generateTest('multiplication-input', 'medium'), 50),
        ...sampleQuestions(generateTest('division-input', 'medium'), 50)
      ];
      break;
    case 'E':
      // STRICT CURRICULUM FOR GROUP E
      finalPool = [
        // 1. Addition / Subtraction (60 Questions)
        ...sampleQuestions(generateTest('addition-subtraction-input', 'easy'), 20),   // Single digit
        ...sampleQuestions(generateTest('addition-subtraction-input', 'medium'), 20), // Double digit
        ...sampleQuestions(generateTest('addition-subtraction-input', 'hard'), 20),   // Triple digit
        
        // 2. Advanced Multiplication (30 Questions)
        ...generateMultiplication(100, 999, 2, 9, 10),    // Triple x Single
        ...generateMultiplication(1000, 9999, 2, 9, 10),  // 4-digit x Single
        ...generateMultiplication(100, 999, 10, 99, 10),  // Triple x Double
        
        // 3. Advanced Division (30 Questions)
        ...generateDivision(10, 99, 2, 9, 15),    // Resulting in 2-digit (Dividend ~3 digit)
        ...generateDivision(100, 999, 2, 9, 15),  // Resulting in 3-digit (Dividend ~4 digit)
        
        // 4. Powers & Roots (30 Questions)
        ...sampleQuestions(generateTest('square-input', 'medium'), 7),
        ...sampleQuestions(generateTest('square-root-input', 'medium'), 8),
        ...sampleQuestions(generateTest('cube-input', 'medium'), 7),
        ...sampleQuestions(generateTest('cube-root-input', 'medium'), 8)
      ];
      break;
  }
  
  // Final global shuffle and consecutive answer de-duplication
  return deDuplicateQuestions(shuffleArray(finalPool).slice(0, 150)); 
}

export function isFinalExamAvailable(startDate: Date, endDate: Date): boolean {
  const now = new Date();
  return now >= startDate && now <= endDate;
}
