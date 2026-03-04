/**
 * Calculates points earned for a session
 * @param {Object} data - session stats { correct, total, timeInSeconds, targetTime, level, isGame }
 */
export const calculatePoints = ({ correct, total, timeInSeconds, targetTime, level, isGame }: {
  correct: number;
  total: number;
  timeInSeconds: number;
  targetTime: number;
  level: number;
  isGame: boolean;
}) => {
  const accuracy = total > 0 ? (correct / total) * 100 : 0;
  
  // 1. Completion Points (Only for full practice sets)
  // Base reward for finishing a session
  let points = isGame ? 0 : 5; 

  // 2. Accuracy Points
  // Bubble game: +10 per correct. Practice: +1 per correct.
  points += isGame ? (correct * 10) : (correct * 1);

  // 3. Time Bonus (Traffic Light System - Tests Only)
  if (!isGame && accuracy >= 80) {
    if (timeInSeconds <= targetTime * 0.7) points += 5; // Green
    else if (timeInSeconds <= targetTime) points += 2;   // Yellow
  }

  // 4. Level Completion Bonus (Bubble Game 90% Accuracy)
  if (isGame && accuracy >= 90) {
    points += 15; 
  }

  // 5. Complexity Multiplier (Dampened)
  // 2% bonus per level instead of 10% to prevent inflation
  points = points * (1 + (level * 0.02));

  return {
    earnedPoints: Math.round(points),
    promoted: accuracy >= 90
  };
};
