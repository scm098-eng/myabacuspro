import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function extractFirstImage(html: string): string | null {
  if (!html) return null;
  const match = html.match(/<img\s+[^>]*src=["']([^"']+)["']/i);
  return match ? match[1] : null;
}

export interface Step {
  operation: string;
  value: number;
  explanation?: string;
  atRodFromRight?: number;
  fullState?: number[]; // Added for 15-rod specialized visualizations like Division
}

export function parseCalculationSteps(questionText: string): Step[] {
  if (!questionText || typeof questionText !== 'string') {
    return [];
  }
  
  // Handle Multiplication
  if (questionText.includes('×')) {
    const parts = questionText.split('×').map(p => parseInt(p.trim()));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return generateMultiplicationSteps(parts[0], parts[1]);
    }
  }

  // Handle Division
  if (questionText.includes('÷')) {
    const parts = questionText.split('÷').map(p => parseInt(p.trim()));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return generateDivisionSteps15(parts[0], parts[1]);
    }
  }

  // Handle Addition & Subtraction
  const tokens = questionText.split(' ').filter(t => t !== '');
  const steps: Step[] = [];
  let currentValue = 0;

  if (tokens.length === 0) return [];
  
  currentValue = parseInt(tokens[0], 10);
  if (isNaN(currentValue)) return [];
  
  steps.push({ 
    operation: `Set ${currentValue}`, 
    value: currentValue,
    explanation: `Start by setting the first number ${currentValue} on the abacus.`
  });

  for (let i = 1; i < tokens.length; i += 2) {
    const operator = tokens[i];
    const number = parseInt(tokens[i+1], 10);

    if (isNaN(number)) continue;

    if (operator === '+') {
      currentValue += number;
    } else if (operator === '-') {
      currentValue -= number;
    }
    
    steps.push({ 
      operation: `${operator} ${number}`, 
      value: currentValue,
      explanation: `${operator === '+' ? 'Add' : 'Subtract'} ${number} from the current value.`
    });
  }

  return steps;
}

export function generateMultiplicationSteps(m1: number, m2: number): Step[] {
  const steps: Step[] = [];
  const m1Str = m1.toString();
  const m2Str = m2.toString();
  const rods = new Array(7).fill(0);

  for (let i = 0; i < m2Str.length; i++) {
    const m2Digit = parseInt(m2Str[i]);
    const m2Power = m2Str.length - 1 - i;

    for (let j = 0; j < m1Str.length; j++) {
      const m1Digit = parseInt(m1Str[j]);
      const m1Power = m1Str.length - 1 - j;
      
      const product = m1Digit * m2Digit;
      const targetRodFromRight = m1Power + m2Power + 1;

      let rodIdx = 7 - targetRodFromRight;
      rods[rodIdx] += product;
      
      for (let k = 6; k >= 0; k--) {
        if (rods[k] >= 10) {
          const carry = Math.floor(rods[k] / 10);
          rods[k] %= 10;
          if (k > 0) rods[k-1] += carry;
        }
      }

      steps.push({
        operation: `${m2Digit} × ${m1Digit} = ${product.toString().padStart(2, '0')}`,
        value: parseInt(rods.join(''), 10),
        explanation: `Multiply ${m2Digit} by ${m1Digit}. Place ${product} starting from rod ${targetRodFromRight} (counting from the right).`,
        atRodFromRight: targetRodFromRight
      });
    }
  }
  
  if (steps.length === 0) {
    steps.push({ operation: 'Final Answer', value: m1 * m2, explanation: 'The final product is calculated.' });
  }
  
  return steps;
}

export function generateDivisionSteps15(dividend: number, divisor: number): Step[] {
  if (divisor <= 0) return [];
  const steps: Step[] = [];
  const quotientValue = Math.floor(dividend / divisor);
  const qStr = quotientValue.toString();
  const dLen = dividend.toString().length;

  const buildState = (currDividend: number, currQuotient: number) => {
    const state = new Array(15).fill(0);
    // Dividend on Left 7 Rods (D1-D7)
    const dStr = currDividend.toString().padStart(dLen, '0');
    for (let i = 0; i < dStr.length && i < 7; i++) {
      state[i] = parseInt(dStr[i]);
    }
    // Quotient on next 5 Rods (Q1-Q5)
    const qS = currQuotient.toString();
    for (let i = 0; i < qS.length && i < 5; i++) {
      state[7 + i] = parseInt(qS[i]);
    }
    // Divisor on Last 3 Rods (S1-S3)
    const sStr = divisor.toString().split('').reverse().join('');
    for (let i = 0; i < sStr.length && i < 3; i++) {
      state[14 - i] = parseInt(sStr[i]);
    }
    return state;
  };

  steps.push({
    operation: 'Initialize Lab',
    value: 0,
    explanation: `Set the dividend ${dividend} on the left (D1-D7). Set the divisor ${divisor} on the far right (S1-S3).`,
    fullState: buildState(dividend, 0)
  });

  let currentDividend = dividend;
  let currentQuotient = 0;

  for (let i = 0; i < qStr.length; i++) {
    const qDigit = parseInt(qStr[i]);
    if (qDigit === 0) continue;

    const power = qStr.length - 1 - i;
    const subtrahend = qDigit * divisor * Math.pow(10, power);
    
    currentDividend -= subtrahend;
    currentQuotient += qDigit * Math.pow(10, power);
    
    steps.push({
      operation: `Subtract ${subtrahend}`,
      value: currentQuotient,
      explanation: `${divisor} goes into the current segment ${qDigit} times. Subtract the result from the dividend and increment the quotient in the center (Q1-Q5).`,
      fullState: buildState(currentDividend, currentQuotient)
    });
  }

  return steps;
}
