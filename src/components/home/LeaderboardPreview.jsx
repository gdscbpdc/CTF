'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardBody, Avatar, Button } from '@nextui-org/react';
import { getTopTeams } from '@/lib/leaderboard';
import LoadingState from '@/components/ui/LoadingState';
import ErrorState from '@/components/ui/ErrorState';
import { db } from '@/services/firebase.config';
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
} from 'firebase/firestore';

const CACHE_KEY = 'leaderboard_preview';
const CACHE_DURATION = 5 * 60 * 1000;

export default function LeaderboardPreview() {
  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeToLeaderboard();
    return () => unsubscribe?.();
  }, []);

  const getCachedData = () => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        return data;
      }
    }
    return null;
  };

  const setCachedData = (data) => {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        data,
        timestamp: Date.now(),
      })
    );
  };

  const subscribeToLeaderboard = () => {
    try {
      const cachedData = getCachedData();
      if (cachedData) {
        setTeams(cachedData);
        setIsLoading(false);
      }

      const q = query(
        collection(db, 'teams'),
        orderBy('points', 'desc'),
        limit(3)
      );

      return onSnapshot(
        q,
        (snapshot) => {
          const teamsData = snapshot.docs.map((doc, index) => ({
            id: doc.id,
            rank: index + 1,
            ...doc.data(),
          }));
          setTeams(teamsData);
          setCachedData(teamsData);
          setIsLoading(false);
        },
        (error) => {
          console.error('Error subscribing to leaderboard:', error);
          setError('Failed to load leaderboard');
          setIsLoading(false);
        }
      );
    } catch (error) {
      console.error('Error setting up subscription:', error);
      setError('Failed to load leaderboard');
      setIsLoading(false);
    }
  };

  if (isLoading && !teams.length)
    return <LoadingState message='Loading leaderboard...' />;
  if (error)
    return <ErrorState message={error} onRetry={subscribeToLeaderboard} />;
  if (teams.length === 0) {
    return (
      <Card>
        <CardHeader className='flex justify-between items-center'>
          <h3 className='text-xl font-bold'>Top Teams</h3>
          <Button as={Link} href='/leaderboard' size='sm' variant='light'>
            View Full Leaderboard
          </Button>
        </CardHeader>
        <CardBody>
          <p className='text-center text-default-500'>No teams found</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className='flex justify-between items-center'>
        <h3 className='text-xl font-bold'>Top Teams</h3>
        <Button as={Link} href='/leaderboard' size='sm' variant='light'>
          View Full Leaderboard
        </Button>
      </CardHeader>
      <CardBody>
        {teams.map((team) => (
          <div key={team.id} className='flex justify-between items-center py-2'>
            <div className='flex items-center gap-3'>
              <span className='font-bold text-default-500'>#{team.rank}</span>
              <Avatar name={team.teamName} size='sm' />
              <span className='font-medium'>{team.teamName}</span>
            </div>
            <div className='flex items-center gap-2'>
              <span className='font-bold text-primary'>{team.points} pts</span>
              {team.lastSolveTime && (
                <span className='text-tiny text-default-400'>
                  Last solve: {formatRelativeTime(team.lastSolveTime)}
                </span>
              )}
            </div>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}

function formatRelativeTime(timestamp) {
  const now = Date.now();
  const time = timestamp.toDate().getTime();
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
