import { getChallenges } from '@/lib/challenges';
import ChallengeCard from './ChallengeCard';

export default function ChallengeList() {
  const challenges = getChallenges();

  return (
    <div className='space-y-6'>
      {challenges.length > 0 ? (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {challenges.map((challenge) => (
            <ChallengeCard key={challenge.id} challenge={challenge} />
          ))}
        </div>
      ) : (
        <div className='text-center text-default-500 py-12'>
          <p className='text-lg'>No challenges available at the moment</p>
          <p className='text-sm mt-2'>Check back later or contact an admin</p>
        </div>
      )}
    </div>
  );
}
