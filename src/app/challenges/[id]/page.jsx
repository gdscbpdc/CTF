import { notFound } from 'next/navigation';
import ChallengeDetails from '@/components/challenges/ChallengeDetails';
import { getChallengeById } from '@/lib/challenges';

export default async function ChallengePage({ params }) {
  try {
    const id = params.id;
    console.log('Fetching challenge with ID:', id);

    const challenge = await getChallengeById(id);
    console.log('Challenge data:', challenge);

    if (!challenge) {
      console.log('Challenge not found, redirecting to 404');
      notFound();
    }

    return <ChallengeDetails challenge={challenge} />;
  } catch (error) {
    console.error('Error loading challenge:', error);
    throw error;
  }
}
