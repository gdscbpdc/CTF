'use client';

import {
  Card,
  CardBody,
  CardHeader,
  Divider,
  Progress,
  Avatar,
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Chip,
} from '@nextui-org/react';
import {
  Trophy,
  Users,
  Flag,
  Activity,
  Medal,
  Target,
  Clock,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { getTeamRank } from '@/lib/leaderboard';
import { useAuth } from '@/contexts/AuthContext';
import TeamChat from '@/components/chat/TeamChat';
import ErrorState from '@/components/ui/ErrorState';
import LoadingState from '@/components/ui/LoadingState';
import { getTeamProgress, getTeamActivity, getTeamDetails } from '@/lib/teams';

export default function TeamPage() {
  const { user } = useAuth();
  const [progress, setProgress] = useState(null);
  const [teamDetails, setTeamDetails] = useState(null);
  const [teamActivity, setTeamActivity] = useState([]);
  const [teamRank, setTeamRank] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.team?.id) {
      loadTeamData();
    }
  }, [user?.team?.id]);

  const loadTeamData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [progressData, details, activity, rank] = await Promise.all([
        getTeamProgress(user.team.id),
        getTeamDetails(user.team.id),
        getTeamActivity(user.team.id),
        getTeamRank(user.team.id),
      ]);
      setProgress(progressData);
      setTeamDetails(details);
      setTeamActivity(activity);
      setTeamRank(rank);
    } catch (error) {
      console.error('Error loading team data:', error);
      setError('Failed to load team data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading)
    return <LoadingState message='Loading team data...' fullHeight />;
  if (error) return <ErrorState message={error} onRetry={loadTeamData} />;

  if (!user?.team) {
    return (
      <Card>
        <CardBody className='p-8 text-center'>
          <p className='text-default-500'>
            Join a team to view team statistics and chat.
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className='space-y-8'>
      <Card>
        <CardBody className='py-8 flex flex-col md:flex-row items-center gap-6'>
          <Avatar name={user.team.teamName} className='w-24 h-24 text-large' />
          <div className='flex-grow text-center md:text-left'>
            <h1 className='text-3xl font-bold'>{user.team.teamName}</h1>
            <div className='flex flex-wrap gap-2 mt-2 justify-center md:justify-start'>
              <Chip color='secondary'>Rank #{teamRank || '-'}</Chip>
              <Chip color='success'>{user.team.points} Points</Chip>
              <Chip color='primary'>
                {teamDetails?.members?.length || 0} Members
              </Chip>
            </div>
          </div>
        </CardBody>
      </Card>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <Card>
          <CardBody className='flex flex-row items-center gap-4'>
            <Trophy className='w-8 h-8 text-warning' />
            <div>
              <p className='text-small text-default-500'>Team Points</p>
              <p className='text-2xl font-bold'>{user.team.points}</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className='flex flex-row items-center gap-4'>
            <Medal className='w-8 h-8 text-primary' />
            <div>
              <p className='text-small text-default-500'>Global Rank</p>
              <p className='text-2xl font-bold'>#{teamRank || '-'}</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className='flex flex-row items-center gap-4'>
            <Flag className='w-8 h-8 text-success' />
            <div>
              <p className='text-small text-default-500'>Solved Challenges</p>
              <p className='text-2xl font-bold'>
                {user.team.solvedChallenges?.length || 0}
              </p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className='flex flex-row items-center gap-4'>
            <Target className='w-8 h-8 text-danger' />
            <div>
              <p className='text-small text-default-500'>Completion</p>
              <p className='text-2xl font-bold'>
                {progress?.completionPercentage?.toFixed(1) || 0}%
              </p>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        <div className='space-y-8'>
          <Card>
            <CardHeader className='flex gap-3'>
              <Users className='w-5 h-5' />
              <div className='flex flex-col'>
                <p className='text-md'>Team Members</p>
                <p className='text-small text-default-500'>
                  {teamDetails?.members?.length || 0} members in the team
                </p>
              </div>
            </CardHeader>
            <Divider />
            <CardBody>
              <div className='space-y-4'>
                {teamDetails?.members?.map((member) => (
                  <div
                    key={member.id}
                    className='flex items-center justify-between'
                  >
                    <div className='flex items-center gap-3'>
                      <Avatar name={member.name} size='sm' />
                      <div>
                        <p className='font-medium'>{member.name}</p>
                        <p className='text-small text-default-500'>
                          {member.email}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader className='flex gap-3'>
              <Activity className='w-5 h-5' />
              <div className='flex flex-col'>
                <p className='text-md'>Progress by Category</p>
                <p className='text-small text-default-500'>
                  Track your team's progress in each category
                </p>
              </div>
            </CardHeader>
            <Divider />
            <CardBody className='gap-4'>
              {progress?.categoryProgress &&
                Object.entries(progress.categoryProgress).map(
                  ([category, data]) => (
                    <div key={category}>
                      <div className='flex justify-between mb-2'>
                        <span>{category}</span>
                        <span className='text-default-500'>
                          {data.solved}/{data.total}
                        </span>
                      </div>
                      <Progress
                        value={(data.solved / data.total) * 100}
                        color='primary'
                        className='mb-4'
                      />
                    </div>
                  )
                )}
            </CardBody>
          </Card>
        </div>

        <div className='space-y-8'>
          <Card>
            <CardHeader className='flex gap-3'>
              <Clock className='w-5 h-5' />
              <div className='flex flex-col'>
                <p className='text-md'>Recent Activity</p>
                <p className='text-small text-default-500'>
                  Latest team achievements
                </p>
              </div>
            </CardHeader>
            <Divider />
            <CardBody>
              <Table removeWrapper aria-label='Recent team activity'>
                <TableHeader>
                  <TableColumn>CHALLENGE</TableColumn>
                  <TableColumn>POINTS</TableColumn>
                  <TableColumn>TIME</TableColumn>
                </TableHeader>
                <TableBody>
                  {teamActivity.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell>
                        <div className='flex flex-col'>
                          <span className='font-medium'>
                            {activity.challenge.name}
                          </span>
                          <span className='text-tiny text-default-500'>
                            {activity.challenge.category}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Chip color='success' size='sm' variant='flat'>
                          +{activity.challenge.points}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <span className='text-small text-default-500'>
                          {new Date(activity.timestamp).toLocaleString()}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardBody>
          </Card>

          <TeamChat />
        </div>
      </div>
    </div>
  );
}
