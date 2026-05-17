
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
      // Group A: Direct moves for both Single and Double digits
      questions = [
        ...generateTest('beads-identify', 'level-2').slice(0, 10), // Single digit beads
        ...generateTest('basic-add-sub-l1', 'easy').slice(0, 10),  // Single digit direct
        ...generateTest('basic-add-sub-l2', 'easy').slice(0, 10)   // Double digit direct
      ];
      break;
    case 'B':
      // Group B: Small Sister, Big Brother, AND Combination (With Tool)
      questions = [
        ...generateTest('basic-addition-plus-4', 'easy').slice(0, 5),   // Small Sister
        ...generateTest('big-brother-addition-plus-9', 'easy').slice(0, 5), // Big Brother
        ...generateTest('combination-plus-6', 'easy').slice(0, 5),      // Combination
        ...generateTest('addition-subtraction', 'medium').slice(0, 15)   // General Mixed
      ];
      break;
    case 'C':
      // Group C: Single, Double & Triple Digit Mental Calculation (Without Tool)
      questions = [
        ...generateTest('addition-subtraction-input', 'easy').slice(0, 10),   // Single
        ...generateTest('addition-subtraction-input', 'medium').slice(0, 10), // Double
        ...generateTest('addition-subtraction-input', 'hard').slice(0, 10)    // Triple
      ];
      break;
    case 'D':
      // Group D: Elite Multi-Digit Mental + Multi/Div
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
