export const RANKS = [
  {
    name: 'Script Kiddie',
    minPoints: 0,
    maxPoints: 500,
  },
  {
    name: 'Hacker in Training',
    minPoints: 501,
    maxPoints: 1000,
  },
  {
    name: 'Elite Hacker',
    minPoints: 1001,
    maxPoints: 2000,
  },
  {
    name: 'Cyber Ninja',
    minPoints: 2001,
    maxPoints: Infinity,
  },
];

export function getUserRank(points) {
  return (
    RANKS.find((rank) => points >= rank.minPoints && points <= rank.maxPoints)
      ?.name || 'Unknown'
  );
}
