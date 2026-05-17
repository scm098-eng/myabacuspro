
import type { Question, ExamGroup } from '@/types';
import { generateTest } from './questions';

export const EXAM_DATE = new Date('2026-07-04T00:00:00');

export function getExamTimeLimit(age: number): number {
  if (age >= 6 && age <= 8) return 9 * 60;
  if (age >= 9 && age <= 11) return 8 * 60;
  if (age >= 12 && age <= 14) return 7 * 60;
  return 10 * 60; // Default fallback
}

export function generateExamQuestions(group: ExamGroup): Question[] {
  let questions: Question[] = [];
  
  switch (group) {
    case 'A':
      // Beads Value Practice & Basic Addition & Subtraction (Direct moves)
      questions = [
        ...generateTest('beads-identify', 'level-4').slice(0, 10),
        ...generateTest('basic-add-sub-l1', 'easy').slice(0, 10),
        ...generateTest('basic-add-sub-l2', 'easy').slice(0, 10)
      ];
      break;
    case 'B':
      // All Formula Addition & Subtraction With Tool (Single & Double Digit)
      questions = [
        ...generateTest('basic-addition-plus-4', 'easy').slice(0, 5),
        ...generateTest('big-brother-addition-plus-9', 'easy').slice(0, 5),
        ...generateTest('combination-plus-6', 'easy').slice(0, 5),
        ...generateTest('addition-subtraction', 'medium').slice(0, 15)
      ];
      break;
    case 'C':
      // All Formula Addition & Subtraction Without Tool (S, D, T Digits)
      questions = [
        ...generateTest('addition-subtraction-input', 'easy').slice(0, 10),
        ...generateTest('addition-subtraction-input', 'medium').slice(0, 10),
        ...generateTest('addition-subtraction-input', 'hard').slice(0, 10)
      ];
      break;
    case 'D':
      // All Formula Without Tool + Multiplication & Division
      questions = [
        ...generateTest('addition-subtraction-input', 'medium').slice(0, 10),
        ...generateTest('multiplication-input', 'medium').slice(0, 10),
        ...generateTest('division-input', 'medium').slice(0, 10)
      ];
      break;
  }
  
  return questions.slice(0, 30); // Standardize exam length
}

export function isFinalExamAvailable(): boolean {
  const now = new Date();
  return now >= EXAM_DATE;
}
