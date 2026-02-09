import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface Step {
  operation: string;
  value: number;
}

export function parseCalculationSteps(questionText: string): Step[] {
  if (!questionText || typeof questionText !== 'string') {
    return [];
  }
  
  const tokens = questionText.split(' ').filter(t => t !== '');
  const steps: Step[] = [];
  let currentValue = 0;

  if (tokens.length === 0) return [];
  
  currentValue = parseInt(tokens[0], 10);
  steps.push({ operation: `Set ${currentValue}`, value: currentValue });

  for (let i = 1; i < tokens.length; i += 2) {
    const operator = tokens[i];
    const number = parseInt(tokens[i+1], 10);

    if (isNaN(number)) continue;

    if (operator === '+') {
      currentValue += number;
    } else if (operator === '-') {
      currentValue -= number;
    }
    
    steps.push({ operation: `${operator} ${number}`, value: currentValue });
  }

  return steps;
}
