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
} from '@nextui-org/react';
import { Trophy } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

import { getLeaderboard } from '@/lib/leaderboard';
import ErrorState from '@/components/ui/ErrorState';
import LoadingState from '@/components/ui/LoadingState';

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
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        {leaderboard.teams.slice(0, 3).map((team, index) => (
          <Card
            key={team.id}
            className={
              index === 0
                ? 'bg-gradient-to-br from-yellow-500/20 to-yellow-600/20'
                : index === 1
                ? 'bg-gradient-to-br from-slate-400/20 to-slate-500/20'
                : 'bg-gradient-to-br from-amber-600/20 to-amber-700/20'
            }
          >
            <CardBody className='py-8 text-center space-y-4'>
              <Trophy
                className={
                  index === 0
                    ? 'w-12 h-12 mx-auto text-yellow-500'
                    : index === 1
                    ? 'w-12 h-12 mx-auto text-slate-400'
                    : 'w-12 h-12 mx-auto text-amber-600'
                }
              />
              <div>
                <p className='text-xl font-bold'>{team.teamName}</p>
                <p className='text-default-500'>
                  {team.points} points • {team.solvedChallenges?.length || 0}{' '}
                  solves
                </p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className='flex justify-center'>
          <h2 className='text-xl font-bold'>Leaderboard</h2>
        </CardHeader>
        <CardBody>
          <Table aria-label='Leaderboard'>
            <TableHeader>
              <TableColumn>POSITION</TableColumn>
              <TableColumn>RANK</TableColumn>
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
                  <TableCell>{team.rank}</TableCell>
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
    </div>
  );
}
