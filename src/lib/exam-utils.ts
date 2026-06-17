
'use client';

import type { Question, ExamGroup } from '@/types';
import { generateTest, deDuplicateQuestions, getRandomInt, generateOptions, shuffleArray, createPRNG } from './questions';
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

function sampleQuestions(questions: Question[], count: number, prng: () => number): Question[] {
  return shuffleArray([...questions], prng).slice(0, count);
}

function generateMultiplication(m1Min: number, m1Max: number, m2Min: number, m2Max: number, count: number, prng: () => number): Question[] {
  const result: Question[] = [];
  for (let i = 0; i < count; i++) {
    const m1 = getRandomInt(m1Min, m1Max, prng);
    const m2 = getRandomInt(m2Min, m2Max, prng);
    const answer = m1 * m2;
    result.push({
      text: `${m1} × ${m2}`,
      answer: answer,
      options: generateOptions(answer, prng)
    });
  }
  return result;
}

function generateDivision(answerMin: number, answerMax: number, divisorMin: number, divisorMax: number, count: number, prng: () => number): Question[] {
  const result: Question[] = [];
  for (let i = 0; i < count; i++) {
    const divisor = getRandomInt(divisorMin, divisorMax, prng);
    const answer = getRandomInt(answerMin, answerMax, prng);
    const dividend = divisor * answer;
    result.push({
      text: `${dividend} ÷ ${divisor}`,
      answer: answer,
      options: generateOptions(answer, prng)
    });
  }
  return result;
}

/**
 * Generates deterministic exam questions if a seed is provided.
 * All groups return exactly 150 questions.
 */
export function generateExamQuestions(group: ExamGroup, seed?: string): Question[] {
  const prng = seed ? createPRNG(seed) : Math.random;
  let finalPool: Question[] = [];
  const targetCount = 150;
  
  switch (group) {
    case 'A':
      finalPool = [
        ...sampleQuestions(generateTest('beads-identify', 'level-2'), 30, prng),
        ...sampleQuestions(generateTest('beads-identify', 'level-4'), 30, prng),
        ...sampleQuestions(generateTest('beads-identify', 'level-6'), 30, prng),
        ...sampleQuestions(generateTest('basic-add-sub-l1', 'easy'), 30, prng),
        ...sampleQuestions(generateTest('basic-add-sub-l2', 'easy'), 30, prng)
      ];
      break;
    case 'B':
      finalPool = [
        ...sampleQuestions(generateTest('basic-addition-plus-4', 'easy'), 37, prng),
        ...sampleQuestions(generateTest('big-brother-addition-plus-9', 'easy'), 37, prng),
        ...sampleQuestions(generateTest('combination-plus-6', 'easy'), 38, prng),
        ...sampleQuestions(generateTest('addition-subtraction', 'medium'), 38, prng)
      ];
      break;
    case 'C':
      finalPool = [
        ...sampleQuestions(generateTest('addition-subtraction-input', 'easy'), 50, prng),
        ...sampleQuestions(generateTest('addition-subtraction-input', 'medium'), 50, prng),
        ...sampleQuestions(generateTest('addition-subtraction-input', 'hard'), 50, prng)
      ];
      break;
    case 'D':
      finalPool = [
        ...sampleQuestions(generateTest('addition-subtraction-input', 'medium'), 50, prng),
        ...sampleQuestions(generateTest('multiplication-input', 'medium'), 50, prng),
        ...sampleQuestions(generateTest('division-input', 'medium'), 50, prng)
      ];
      break;
    case 'E':
      finalPool = [
        // 1. Addition / Subtraction (60 Questions)
        ...sampleQuestions(generateTest('addition-subtraction-input', 'easy'), 20, prng),
        ...sampleQuestions(generateTest('addition-subtraction-input', 'medium'), 20, prng),
        ...sampleQuestions(generateTest('addition-subtraction-input', 'hard'), 20, prng),
        
        // 2. Advanced Multiplication (30 Questions)
        ...generateMultiplication(100, 999, 2, 9, 10, prng),
        ...generateMultiplication(1000, 9999, 2, 9, 10, prng),
        ...generateMultiplication(100, 999, 10, 99, 10, prng),
        
        // 3. Advanced Division (30 Questions)
        ...generateDivision(10, 99, 2, 9, 15, prng),
        ...generateDivision(100, 999, 2, 9, 15, prng),
        
        // 4. Powers & Roots (30 Questions)
        ...sampleQuestions(generateTest('square-input', 'medium'), 7, prng),
        ...sampleQuestions(generateTest('square-root-input', 'medium'), 8, prng),
        ...sampleQuestions(generateTest('cube-input', 'medium'), 7, prng),
        ...sampleQuestions(generateTest('cube-root-input', 'medium'), 8, prng)
      ];
      break;
  }
  
  // Final global shuffle (deterministic if prng is seeded)
  return deDuplicateQuestions(shuffleArray(finalPool, prng).slice(0, targetCount)); 
}

export function isFinalExamAvailable(startDate: Date, endDate: Date): boolean {
  const now = new Date();
  return now >= startDate && now <= endDate;
}
