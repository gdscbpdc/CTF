import { notFound } from 'next/navigation';
import ChallengeDetails from '@/components/challenges/ChallengeDetails';
import { getChallengeById } from '@/lib/challenges';

export default async function ChallengePage({ params }) {
  try {
    const id = params.id;

    const challenge = await getChallengeById(id);

    if (!challenge) {
      notFound();
    }

    return <ChallengeDetails challenge={challenge} />;
  } catch (error) {
    console.error('Error loading challenge:', error);
    throw error;
  }
}
