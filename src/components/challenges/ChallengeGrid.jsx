'use client';

import { useState, useEffect } from 'react';
import { ScrollShadow } from '@nextui-org/react';
import { collection, query, onSnapshot } from 'firebase/firestore';

import ChallengeCard from './ChallengeCard';
import { db } from '@/services/firebase.config';
import ErrorState from '@/components/ui/ErrorState';
import LoadingState from '@/components/ui/LoadingState';

export default function ChallengeGrid() {
  const [challenges, setChallenges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeToChanges();
    return () => unsubscribe?.();
  }, []);

  const subscribeToChanges = () => {
    try {
      const q = query(collection(db, 'challenges'));
      return onSnapshot(
        q,
        (snapshot) => {
          const challengesData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setChallenges(challengesData);
          setIsLoading(false);
        },
        (error) => {
          console.error('Error subscribing to challenges:', error);
          setError('Failed to load challenges');
          setIsLoading(false);
        }
      );
    } catch (error) {
      console.error('Error setting up subscription:', error);
      setError('Failed to load challenges');
      setIsLoading(false);
    }
  };

  if (isLoading) return <LoadingState message='Loading challenges...' />;
  if (error) return <ErrorState message={error} onRetry={subscribeToChanges} />;
  if (!challenges.length) return <ErrorState message='No challenges found' />;

  return (
    <ScrollShadow orientation='horizontal' className='w-full'>
      <div className='grid grid-rows-2 grid-cols-5 gap-4 w-max'>
        {challenges.map((challenge) => (
          <div className='w-[300px] md:w-[400px]' key={challenge.id}>
            <ChallengeCard challenge={challenge} />
          </div>
        ))}
      </div>
    </ScrollShadow>
  );
}
