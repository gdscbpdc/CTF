export function generateUserStatistics(user) {
  return {
    totalChallenges: 50,
    solvedChallenges: user.solvedChallenges.length,
    solveRate: (user.solvedChallenges.length / 50) * 100,
    categoryBreakdown: {
      Web: 10,
      Crypto: 5,
      Forensics: 8,
      ReverseEngineering: 7,
      PWN: 6,
    },
    pointsDistribution: [
      { category: 'Web', points: 400 },
      { category: 'Crypto', points: 200 },
      { category: 'Forensics', points: 300 },
    ],
  };
}
