
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
  
  // 1. Mastery Points
  // Bubble game: 5 points per right answer.
  // General Practice: 1 point per right answer.
  let points = isGame ? (correct * 5) : (correct * 1);

  // 2. Base Completion Reward (Practice Only)
  if (!isGame) {
    points += 5;
  }

  // 3. Time Bonus (Traffic Light System - Practice Tests Only)
  if (!isGame && accuracy >= 80) {
    if (timeInSeconds <= targetTime * 0.7) points += 5; // Green
    else if (timeInSeconds <= targetTime) points += 2;   // Yellow
  }

  // 4. Level Completion Bonus (Bubble Game 90% Accuracy or higher)
  if (isGame && accuracy >= 90) {
    points += 20; 
  }

  // Note: Complexity multiplier removed to keep points consistent with user request (exactly 5 per answer).

  return {
    earnedPoints: Math.round(points),
    promoted: accuracy >= 90
  };
};
