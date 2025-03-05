'use client';

import {
  Card,
  CardBody,
  CardHeader,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  Chip,
  Button,
} from '@nextui-org/react';
import { Trophy } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

import { getLeaderboard } from '@/lib/leaderboard';
import ErrorState from '@/components/ui/ErrorState';
import Podium from '@/components/leaderboard/podium';
import LoadingState from '@/components/ui/LoadingState';
import CountdownTimer from '@/components/leaderboard/CountdownTimer';
import Link from 'next/link';

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  const loadLeaderboard = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getLeaderboard(page);
      setLeaderboard(data);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      setError('Failed to load leaderboard');
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  if (isLoading)
    return <LoadingState message='Loading leaderboard...' fullHeight />;
  if (error) return <ErrorState message={error} onRetry={loadLeaderboard} />;
  if (!leaderboard?.teams?.length)
    return <ErrorState message='No teams found' />;

  return (
    <div className='space-y-6'>
      <CountdownTimer />

      <div className='grid grid-cols-3 gap-6'>
        <Podium
          team={leaderboard.teams[1]}
          index={1}
          key={leaderboard.teams[1].id}
        />
        <Podium
          team={leaderboard.teams[0]}
          index={0}
          key={leaderboard.teams[0].id}
        />
        <Podium
          team={leaderboard.teams[2]}
          index={2}
          key={leaderboard.teams[2].id}
        />
      </div>

      <Card>
        <CardHeader className='flex justify-center'>
          <h2 className='text-xl font-bold'>Leaderboard</h2>
        </CardHeader>
        <CardBody>
          <Table aria-label='Leaderboard'>
            <TableHeader>
              <TableColumn>POSITION</TableColumn>
              <TableColumn>TEAM</TableColumn>
              <TableColumn>POINTS</TableColumn>
              <TableColumn>SOLVES</TableColumn>
            </TableHeader>
            <TableBody>
              {leaderboard.teams.map((team, index) => (
                <TableRow key={team.id}>
                  <TableCell>
                    {index === 0 ? (
                      <Trophy className='w-5 h-5 text-yellow-500' />
                    ) : index === 1 ? (
                      <Trophy className='w-5 h-5 text-slate-400' />
                    ) : index === 2 ? (
                      <Trophy className='w-5 h-5 text-amber-600' />
                    ) : (
                      `#${index + 1}`
                    )}
                  </TableCell>
                  <TableCell>{team.teamName}</TableCell>
                  <TableCell>{team.points}</TableCell>
                  <TableCell>{team.solvedChallenges?.length || 0}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className='flex justify-center mt-6'>
            <Pagination
              total={leaderboard.totalPages || 1}
              page={page}
              onChange={setPage}
            />
          </div>
        </CardBody>
      </Card>

      <Card className='bg-gradient-to-r from-primary-500/10 to-secondary-500/10'>
        <CardBody className='py-8'>
          <div className='flex flex-col md:flex-row items-center gap-8 justify-center'>
            <div className='flex-1 max-w-md space-y-4 text-center md:text-left'>
              <h2 className='text-2xl font-bold'>
                Share Your Solution Journey!
              </h2>
              <p className='text-default-600'>
                We'd love to hear how you solved each challenge! Scan the QR
                code to share your approach, thought process, and any creative
                techniques you used. Your insights will help us evaluate the
                winners.
              </p>

              <Button
                as={Link}
                href='https://docs.google.com/forms/d/e/1FAIpQLSdnZCLF9ky0m49V5RBNsP-KoFnrRYvkNWklkTeUZFaI-1fK3w/viewform?usp=header'
                target='_blank'
                color='primary'
              >
                Or Click Here
              </Button>
            </div>
            <div className='relative'>
              <Image
                src='/qr.jpeg'
                alt='Feedback QR Code'
                width={200}
                height={200}
                className='rounded-xl shadow-lg'
              />
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
