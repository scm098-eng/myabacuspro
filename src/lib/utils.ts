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
  fullState?: number[]; 
}

/**
 * Detects if a digit can be added/subtracted directly or if a formula is needed.
 * Returns the formula string if applicable, otherwise returns null.
 */
function getAbacusFormula(currentDigit: number, delta: number, isAddition: boolean): string | null {
  if (isAddition) {
    const earthlyBeads = currentDigit % 5;
    const isHeavenlyActive = currentDigit >= 5;

    // Direct Check
    if (delta <= 4 - earthlyBeads || (delta >= 5 && !isHeavenlyActive && delta - 5 <= 4 - earthlyBeads)) {
      return null;
    }

    // Small Sister (+5 Complements)
    if (earthlyBeads + delta > 4 && currentDigit < 5 && currentDigit + delta < 10) {
      return `+${delta}=+5-${5 - delta}`;
    }

    // Big Brother (+10 Complements)
    if (currentDigit + delta >= 10) {
      if (delta === 9) return "+9=+10-1";
      if (delta === 8) return "+8=+10-2";
      if (delta === 7) return "+7=+10-3";
      if (delta === 6) {
        // Special case: Combination
        if (earthlyBeads < 1 && isHeavenlyActive) return "+6=+10-5+1";
        return "+6=+10-4";
      }
      if (delta === 5) return "+5=+10-5";
      if (delta === 4) return "+4=+10-6";
      if (delta === 3) return "+3=+10-7";
      if (delta === 2) return "+2=+10-8";
      if (delta === 1) return "+1=+10-9";
    }
  } else {
    // Subtraction Logic
    const earthlyBeads = currentDigit % 5;
    const isHeavenlyActive = currentDigit >= 5;

    if (delta <= earthlyBeads || (delta >= 5 && isHeavenlyActive && delta - 5 <= earthlyBeads)) {
      return null;
    }

    // Small Sister (-5 Complements)
    if (delta > earthlyBeads && isHeavenlyActive && currentDigit - delta >= 0) {
      return `-${delta}=-5+${5 - delta}`;
    }
  }
  return null;
}

export function parseCalculationSteps(questionText: string): Step[] {
  if (!questionText || typeof questionText !== 'string') return [];
  
  if (questionText.includes('×')) {
    const parts = questionText.split('×').map(p => parseInt(p.trim()));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) return generateMultiplicationSteps(parts[0], parts[1]);
  }

  if (questionText.includes('÷')) {
    const parts = questionText.split('÷').map(p => parseInt(p.trim()));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) return generateDivisionSteps15(parts[0], parts[1]);
  }

  const tokens = questionText.match(/(\d+|\+|-)/g);
  if (!tokens || tokens.length === 0) return [];

  const steps: Step[] = [];
  let firstToken = tokens[0];
  let startingIndex = 1;
  let currentValue = 0;

  if (firstToken === '+' || firstToken === '-') {
      currentValue = 0;
      startingIndex = 0;
  } else {
      currentValue = parseInt(firstToken, 10);
      steps.push({ 
        operation: `Set ${currentValue}`, 
        value: currentValue,
        explanation: `Start by setting the first number ${currentValue} in the current value directly.`
      });
  }

  for (let i = startingIndex; i < tokens.length; i += 2) {
    const operator = tokens[i];
    const nextToken = tokens[i + 1];
    if (!nextToken) break;
    
    const number = parseInt(nextToken, 10);
    if (isNaN(number)) continue;

    const prevValue = currentValue;
    if (operator === '+') currentValue += number;
    else if (operator === '-') currentValue -= number;
    
    // Determine formula (simplistic 1-digit check for common training levels)
    const formula = number < 10 ? getAbacusFormula(prevValue % 10, number, operator === '+') : null;
    const actionWord = operator === '+' ? 'Add' : 'Subtract';
    const linkWord = operator === '+' ? 'in' : 'from';
    const explanation = `${actionWord} ${number} ${linkWord} the current value ${formula ? `(${formula})` : 'directly'}.`;

    steps.push({ operation: `${operator} ${number}`, value: currentValue, explanation });
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
        explanation: `Multiply ${m2Digit} by ${m1Digit}. Add ${product} in the current value starting from rod ${targetRodFromRight}.`,
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
  const dStrOriginal = dividend.toString();
  const dLen = dStrOriginal.length;

  const buildState = (currDividend: number, currQuotient: number) => {
    const state = new Array(15).fill(0);
    const dStr = currDividend.toString().padStart(dLen, '0');
    for (let i = 0; i < dStr.length && i < 7; i++) state[i] = parseInt(dStr[i]);
    const qS = currQuotient.toString();
    for (let i = 0; i < qS.length && i < 5; i++) state[7 + i] = parseInt(qS[i]);
    const sStr = divisor.toString().split('').reverse().join('');
    for (let i = 0; i < sStr.length && i < 3; i++) state[14 - i] = parseInt(sStr[i]);
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
    const power = qStr.length - 1 - i;
    
    if (qDigit === 0) {
      const localValueAtPos = Math.floor(currentDividend / Math.pow(10, power));
      const localDigit = localValueAtPos % 10;
      let explanation = localValueAtPos === 0 
        ? "No remainder left in this segment to divide. The quotient digit is 0." 
        : `The value ${localDigit} is smaller than ${divisor}. We cannot divide further here, so the quotient digit is 0.`;

      steps.push({ operation: `Quotient Digit: 0`, value: currentQuotient, explanation, fullState: buildState(currentDividend, currentQuotient) });
      continue;
    }

    const localProduct = qDigit * divisor;
    const subtrahend = localProduct * Math.pow(10, power);
    currentDividend -= subtrahend;
    currentQuotient += qDigit * Math.pow(10, power);
    
    steps.push({
      operation: `${divisor} × ${qDigit} = ${localProduct}`,
      value: currentQuotient,
      explanation: `${divisor} goes into the current segment ${qDigit} times. Subtract ${localProduct} from the appropriate rods and update the quotient in the center (Q1-Q5).`,
      fullState: buildState(currentDividend, currentQuotient)
    });
  }
  return steps;
}
