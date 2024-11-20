import ChallengeList from '@/components/challenges/ChallengeList';
import ChallengeFilter from '@/components/challenges/ChallengeFilter';

export default function ChallengesPage() {
  return (
    <div className='space-y-8'>
      <h1 className='text-3xl font-bold'>Challenges</h1>
      <ChallengeFilter />
      <ChallengeList />
    </div>
  );
}
