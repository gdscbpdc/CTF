export function getChallenges() {
  return [
    {
      id: '1',
      title: 'Basic Injection',
      category: 'Web',
      difficulty: 'Easy',
      points: 100,
      shortDescription: 'Find the vulnerability in this login form',
      fullDescription: 'Detailed challenge description...',
      flag: 'GDGUAE{h4ck3r_1n_tr41n1ng}',
    },
    // More sample challenges...
  ];
}

export function getChallengeById(id) {
  return getChallenges().find((challenge) => challenge.id === id);
}
