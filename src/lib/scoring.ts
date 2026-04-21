/**
 * Calculates points earned for a session
 * @param {Object} data - session stats { correct, total, answered, timeInSeconds, targetTime, level, isGame }
 */
export const calculatePoints = ({ correct, total, answered, timeInSeconds, targetTime, level, isGame }: {
  correct: number;
  total: number;
  answered: number;
  timeInSeconds: number;
  targetTime: number;
  level: number;
  isGame: boolean;
}) => {
  const accuracy = total > 0 ? (correct / total) * 100 : 0;
  
  // 1. Mastery Points
  // 1 point per right answer across all activities (Tests and Game)
  let points = correct * 1;

  // 2. Base Completion Reward (Practice Only)
  // Only award if the user finished the entire set of questions
  if (!isGame && answered === total && total > 0) {
    points += 5;
  }

  // 3. Time Bonus (Traffic Light System - Practice Tests Only)
  // Only award if the test was fully completed with high accuracy
  if (!isGame && answered === total && accuracy >= 80) {
    if (timeInSeconds <= targetTime * 0.7) points += 5; // Green
    else if (timeInSeconds <= targetTime) points += 2;   // Yellow
  }

  // 4. Level Completion Bonus (Bubble Game 90% Accuracy or higher)
  if (isGame && accuracy >= 90) {
    points += 20; 
  }

  return {
    earnedPoints: Math.round(points),
    promoted: accuracy >= 90
  };
};
