
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
  
  const fillToTarget = (qPool: Question[], target: number) => {
    const uniquePool = [...qPool];
    while (uniquePool.length < target) {
        uniquePool.push(...qPool.map(q => ({...q}))); 
    }
    return uniquePool.slice(0, target);
  };

  switch (group) {
    case 'A':
      // Group A: Direct moves for both Single and Double digits
      questions = [
        ...generateTest('beads-identify', 'level-2'), 
        ...generateTest('basic-add-sub-l1', 'easy'),  
        ...generateTest('basic-add-sub-l2', 'easy')   
      ];
      break;
    case 'B':
      // Group B: Small Sister, Big Brother, AND Combination (With Tool)
      questions = [
        ...generateTest('basic-addition-plus-4', 'easy'),   
        ...generateTest('big-brother-addition-plus-9', 'easy'), 
        ...generateTest('combination-plus-6', 'easy'),      
        ...generateTest('addition-subtraction', 'medium')   
      ];
      break;
    case 'C':
      // Group C: Single, Double & Triple Digit Mental Calculation (Without Tool)
      questions = [
        ...generateTest('addition-subtraction-input', 'easy'),   
        ...generateTest('addition-subtraction-input', 'medium'), 
        ...generateTest('addition-subtraction-input', 'hard')    
      ];
      break;
    case 'D':
      // Group D: Elite Multi-Digit Mental + Multi/Div
      questions = [
        ...generateTest('addition-subtraction-input', 'medium'),
        ...generateTest('multiplication-input', 'medium'),
        ...generateTest('division-input', 'medium')
      ];
      break;
  }
  
  // User requested 150 questions for all papers
  return fillToTarget(questions, 150); 
}

export function isFinalExamAvailable(): boolean {
  const now = new Date();
  return now >= EXAM_DATE;
}
