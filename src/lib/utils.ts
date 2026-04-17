import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function extractFirstImage(html: string): string | null {
  if (!html) return null;
  // Robust regex to find the first <img> tag and capture its src attribute value
  const match = html.match(/<img\s+[^>]*src=["']([^"']+)["']/i);
  return match ? match[1] : null;
}

interface Step {
  operation: string;
  value: number;
  explanation?: string;
  atRodFromRight?: number;
}

export function parseCalculationSteps(questionText: string): Step[] {
  if (!questionText || typeof questionText !== 'string') {
    return [];
  }
  
  // Check if it's a multiplication question
  if (questionText.includes('×')) {
    const parts = questionText.split('×').map(p => parseInt(p.trim()));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return generateMultiplicationSteps(parts[0], parts[1]);
    }
  }

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

  // Iterate through each digit of multiplier (right to left)
  for (let i = 0; i < m2Str.length; i++) {
    const m2Digit = parseInt(m2Str[i]);
    const m2Power = m2Str.length - 1 - i;

    // Iterate through each digit of multiplicand
    for (let j = 0; j < m1Str.length; j++) {
      const m1Digit = parseInt(m1Str[j]);
      const m1Power = m1Str.length - 1 - j;
      
      const product = m1Digit * m2Digit;
      const targetRodFromRight = m1Power + m2Power + 1;

      // Logic to add product to rods
      let rodIdx = 7 - targetRodFromRight;
      rods[rodIdx] += product;
      
      // Handle carries across the abacus
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
