'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardBody, Avatar, Chip } from '@nextui-org/react';
import { db } from '@/services/firebase.config';
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  doc,
  getDoc,
  where,
} from 'firebase/firestore';
import LoadingState from '@/components/ui/LoadingState';
import ErrorState from '@/components/ui/ErrorState';

const CACHE_DURATION = 5 * 60 * 1000;

export default function RecentSolves() {
  const [solves, setSolves] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usersCache, setUsersCache] = useState(() => {
    try {
      const cached = localStorage.getItem('users_cache');
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) return data;
      }
      return {};
    } catch {
      return {};
    }
  });
  const [challengesCache, setChallengesCache] = useState(() => {
    try {
      const cached = localStorage.getItem('challenges_cache');
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) return data;
      }
      return {};
    } catch {
      return {};
    }
  });

  const updateCache = useCallback((key, data) => {
    localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
  }, []);

  const getCachedUser = useCallback(
    async (userId) => {
      if (usersCache[userId]) return usersCache[userId];

      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUsersCache((prev) => {
          const updated = { ...prev, [userId]: userData };
          updateCache('users_cache', updated);
          return updated;
        });
        return userData;
      }
      return null;
    },
    [usersCache, updateCache]
  );

  const getCachedChallenge = useCallback(
    async (challengeId) => {
      if (challengesCache[challengeId]) return challengesCache[challengeId];

      const challengeDoc = await getDoc(doc(db, 'challenges', challengeId));
      if (challengeDoc.exists()) {
        const challengeData = challengeDoc.data();
        setChallengesCache((prev) => {
          const updated = { ...prev, [challengeId]: challengeData };
          updateCache('challenges_cache', updated);
          return updated;
        });
        return challengeData;
      }
      return null;
    },
    [challengesCache, updateCache]
  );

  useEffect(() => {
    const unsubscribe = subscribeToRecentSolves();
    return () => unsubscribe?.();
  }, []);

  const subscribeToRecentSolves = useCallback(() => {
    try {
      const q = query(
        collection(db, 'solves'),
        where('isCorrect', '==', true),
        orderBy('timestamp', 'desc'),
        limit(10)
      );

      return onSnapshot(
        q,
        async (snapshot) => {
          const solvesPromises = snapshot.docs.map(async (doc) => {
            const solve = doc.data();
            const [user, challenge] = await Promise.all([
              getCachedUser(solve.userId),
              getCachedChallenge(solve.challengeId),
            ]);

            if (user && challenge) {
              return {
                id: doc.id,
                userName: user.name,
                challengeTitle: challenge.title,
                points: challenge.points,
                timestamp: solve.timestamp?.toDate(),
              };
            }
            return null;
          });

          const solvesData = (await Promise.all(solvesPromises)).filter(
            Boolean
          );
          setSolves(solvesData);
          updateCache('recent_solves', solvesData);
          setIsLoading(false);
        },
        (error) => {
          console.error('Error subscribing to solves:', error);
          setError('Failed to load recent solves');
          setIsLoading(false);
        }
      );
    } catch (error) {
      console.error('Error setting up subscription:', error);
      setError('Failed to load recent solves');
      setIsLoading(false);
      return () => {};
    }
  }, [getCachedUser, getCachedChallenge, updateCache]);

  if (isLoading && !solves.length)
    return <LoadingState message='Loading recent solves...' />;
  if (error) return <ErrorState message={error} />;
  if (!solves.length) {
    return (
      <Card>
        <CardHeader>
          <h3 className='text-xl font-bold'>Recent Solves</h3>
        </CardHeader>
        <CardBody>
          <p className='text-center text-default-500'>No solves yet</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <h3 className='text-xl font-bold'>Recent Solves</h3>
      </CardHeader>
      <CardBody>
        {solves.map((solve) => (
          <div
            key={solve.id}
            className='flex justify-between items-center py-2 border-b last:border-b-0'
          >
            <div className='flex items-center gap-3'>
              <Avatar name={solve.userName} size='sm' />
              <div>
                <span className='font-medium'>{solve.userName}</span>
                <p className='text-small text-default-500'>
                  solved {solve.challengeTitle}
                </p>
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <Chip color='default' size='sm' variant='flat'>
                +{solve.points} pts
              </Chip>
              <span className='text-tiny text-default-400'>
                {formatRelativeTime(solve.timestamp)}
              </span>
            </div>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}

function formatRelativeTime(timestamp) {
  if (!timestamp || !(timestamp instanceof Date)) return 'just now';

  const now = Date.now();
  const time = timestamp.getTime();
  const diff = now - time;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'just now';
}
