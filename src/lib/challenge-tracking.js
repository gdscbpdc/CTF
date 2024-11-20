export function trackChallengeAttempt(user, challenge, success) {
  return {
    userId: user.id,
    challengeId: challenge.id,
    attemptTimestamp: new Date(),
    success: success,
    challengeTitle: challenge.title,
  };
}

export function generateSolveHistory(user, challenges) {
  return challenges
    .filter((challenge) => user.solvedChallenges.includes(challenge.id))
    .map((challenge) => ({
      challengeId: challenge.id,
      title: challenge.title,
      category: challenge.category,
      difficulty: challenge.difficulty,
      solvedAt: new Date(), // This would be tracked in a real system
    }));
}
