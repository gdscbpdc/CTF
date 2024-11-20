import { getChallenges } from '@/lib/challenges';
import ChallengeCard from './ChallengeCard';

export default function ChallengeGrid() {
  const challenges = getChallenges();

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
      {challenges.map((challenge) => (
        <ChallengeCard key={challenge.id} challenge={challenge} />
      ))}
    </div>
  );
}
