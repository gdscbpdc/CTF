'use client';

import { notFound } from 'next/navigation';
import ChallengeDetails from '@/components/challenges/ChallengeDetails';
import { getChallengeById } from '@/lib/challenges';
import { useEffect } from 'react';
import { isEventEnded } from '@/lib/constants';
import { useRouter } from 'next/navigation';

export default async function ChallengePage({ params }) {
  const router = useRouter();

  useEffect(() => {
    if (isEventEnded()) {
      router.push('/');
    }
  }, [router]);

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
