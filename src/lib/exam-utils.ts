import type { Question, ExamGroup } from '@/types';
import { generateTest, deDuplicateQuestions } from './questions';
import { differenceInYears, parseISO, isValid } from 'date-fns';

/**
 * Default fallback dates.
 * These are overridden by the dynamic values fetched from Firestore in the components.
 */
export const DEFAULT_EXAM_DATE = new Date('2026-05-25T12:30:00');
export const DEFAULT_EXAM_END_TIME = new Date('2026-05-25T16:00:00');

export function getExamTimeLimit(age: number): number {
  // 5-10: 10 mins, 11-13: 8 mins, 14+: 7 mins
  if (age >= 5 && age <= 10) return 10 * 60;
  if (age >= 11 && age <= 13) return 8 * 60;
  if (age >= 14) return 7 * 60;
  return 10 * 60; // Default fallback
}

export function calculateAge(dob: string | undefined): number {
  if (!dob) return 10;
  const birthDate = parseISO(dob);
  if (!isValid(birthDate)) return 10;
  return differenceInYears(new Date(), birthDate);
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
        ...generateTest('beads-identify', 'level-2'), 
        ...generateTest('beads-identify', 'level-4'), 
        ...generateTest('beads-identify', 'level-6'), 
        ...generateTest('basic-add-sub-l1', 'easy'),  
        ...generateTest('basic-add-sub-l2', 'easy')   
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
  
  // 2. Expand to 150 questions
  let expandedPool = [...initialPool];
  while (expandedPool.length < 150) {
    expandedPool = expandedPool.concat(shuffleArray([...initialPool]));
  }

  // 3. Final global shuffle and consecutive answer de-duplication
  return deDuplicateQuestions(expandedPool.slice(0, 150)); 
}

/**
 * Checks if the final exam is currently open based on passed parameters.
 */
export function isFinalExamAvailable(startDate: Date, endDate: Date): boolean {
  const now = new Date();
  return now >= startDate && now <= endDate;
}
