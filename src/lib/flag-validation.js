export function validateFlag(challenge, submittedFlag) {
  // Basic flag validation
  if (!challenge || !submittedFlag) {
    return {
      success: false,
      message: 'Invalid submission',
    };
  }

  const isCorrect = submittedFlag.trim() === challenge.flag;

  return {
    success: isCorrect,
    message: isCorrect
      ? 'Flag successfully submitted!'
      : 'Incorrect flag. Try again.',
  };
}

export function awardPoints(user, challenge) {
  // Check if challenge has already been solved
  if (user.solvedChallenges.includes(challenge.id)) {
    return {
      pointsEarned: 0,
      alreadySolved: true,
    };
  }

  return {
    pointsEarned: challenge.points,
    alreadySolved: false,
  };
}
