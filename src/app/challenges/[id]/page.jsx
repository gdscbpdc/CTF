import { notFound } from 'next/navigation';
import ChallengeDetails from '@/components/challenges/ChallengeDetails';
import { getChallengeById } from '@/lib/challenges';

export default function ChallengePage({ params }) {
  const challenge = getChallengeById(params.id);

  if (!challenge) {
    notFound();
  }

  return <ChallengeDetails challenge={challenge} />;
}
