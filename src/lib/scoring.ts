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
  // Reduced from 50 to 10 to slow down progression
  let points = isGame ? 0 : 10; 

  // 2. Accuracy Points
  // Bubble game: +5 per correct (was 10). Practice: +1 per correct (was 2).
  points += isGame ? (correct * 5) : (correct * 1);

  // 3. Time Bonus (Traffic Light System)
  if (!isGame && accuracy >= 80) {
    if (timeInSeconds <= targetTime * 0.7) points += 10; // Green (was 20)
    else if (timeInSeconds <= targetTime) points += 5;   // Yellow (was 10)
  }

  // 4. Level Completion Bonus (Bubble Game 90% Accuracy)
  if (isGame && accuracy >= 90) {
    points += 25; // Was 50
  }

  // 5. Complexity Multiplier
  // For tests: level is 1 (easy), 2 (medium), 3 (hard)
  // For games: level is levelId
  points = points * (1 + (level * 0.1));

  return {
    earnedPoints: Math.round(points),
    promoted: accuracy >= 90
  };
};
