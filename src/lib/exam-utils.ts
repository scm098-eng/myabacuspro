import type { Question, ExamGroup } from '@/types';
import { generateTest, deDuplicateQuestions } from './questions';

/**
 * Official Exam Date - Set to May 25, 2026.
 * Question paper opens at 12:30 PM and closes at 4:00 PM (16:00).
 */
export const EXAM_DATE = new Date('2026-05-25T12:30:00');
export const EXAM_END_TIME = new Date('2026-05-25T16:00:00');

export function getExamTimeLimit(age: number): number {
  if (age >= 6 && age <= 8) return 9 * 60;
  if (age >= 9 && age <= 11) return 8 * 60;
  if (age >= 12 && age <= 14) return 7 * 60;
  return 10 * 60; // Default fallback
}

/**
 * Standard Fisher-Yates Shuffle
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function generateExamQuestions(group: ExamGroup): Question[] {
  let initialPool: Question[] = [];
  
  // 1. Gather group-specific questions from base logic
  switch (group) {
    case 'A':
      // Group A: Mix of 1, 2, and 3 digit Beads + 4-5 step Direct moves
      initialPool = [
        ...generateTest('beads-identify', 'level-2'), // 1-Digit Beads
        ...generateTest('beads-identify', 'level-4'), // 2-Digit Beads
        ...generateTest('beads-identify', 'level-6'), // Triple Digit Beads
        ...generateTest('basic-add-sub-l1', 'easy'),  // 1-Digit Add/Sub (4-5 steps)
        ...generateTest('basic-add-sub-l2', 'easy')   // 2-Digit Add/Sub (4-5 steps)
      ];
      break;
    case 'B':
      // Group B: Small Sister, Big Brother, AND Combination (With Tool)
      initialPool = [
        ...generateTest('basic-addition-plus-4', 'easy'),   
        ...generateTest('big-brother-addition-plus-9', 'easy'), 
        ...generateTest('combination-plus-6', 'easy'),      
        ...generateTest('addition-subtraction', 'medium')   
      ];
      break;
    case 'C':
      // Group C: Single, Double & Triple Digit Mental Calculation (Without Tool)
      initialPool = [
        ...generateTest('addition-subtraction-input', 'easy'),   
        ...generateTest('addition-subtraction-input', 'medium'), 
        ...generateTest('addition-subtraction-input', 'hard')    
      ];
      break;
    case 'D':
      // Group D: Elite Multi-Digit Mental + Multi/Div
      initialPool = [
        ...generateTest('addition-subtraction-input', 'medium'),
        ...generateTest('multiplication-input', 'medium'),
        ...generateTest('division-input', 'medium')
      ];
      break;
  }
  
  // 2. Expand to 150 questions by duplicating and shuffling the pool
  let expandedPool = [...initialPool];
  while (expandedPool.length < 150) {
    // Append a shuffled clone of the original pool to maintain diversity
    expandedPool = expandedPool.concat(shuffleArray([...initialPool]));
  }

  // 3. Final global shuffle and consecutive answer de-duplication
  // This ensures the "jumbling style" and prevents back-to-back identical answers
  return deDuplicateQuestions(expandedPool.slice(0, 150)); 
}

export function isFinalExamAvailable(): boolean {
  const now = new Date();
  return now >= EXAM_DATE && now <= EXAM_END_TIME;
}
