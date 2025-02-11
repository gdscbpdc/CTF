'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Divider,
  Tabs,
  Tab,
} from '@nextui-org/react';
import { Users, Flag, Trophy, Activity, BarChart3, Clock } from 'lucide-react';
import { db } from '@/services/firebase.config';
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  where,
  getDocs,
} from 'firebase/firestore';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import ChallengeManager from './ChallengeManager';
import LoadingState from '@/components/ui/LoadingState';
import ErrorState from '@/components/ui/ErrorState';
import TeamManager from './TeamManager';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [solveStats, setSolveStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
    subscribeToActivity();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const teamsSnapshot = await getDocs(collection(db, 'teams'));
      const totalTeams = teamsSnapshot.size;

      const activeTeamsSnapshot = await getDocs(
        query(collection(db, 'teams'), where('solvedChallenges', '!=', []))
      );
      const activeTeams = activeTeamsSnapshot.size;

      const challengesSnapshot = await getDocs(collection(db, 'challenges'));
      const totalChallenges = challengesSnapshot.size;

      const solvesSnapshot = await getDocs(collection(db, 'solves'));
      const totalSolves = solvesSnapshot.size;

      const solves = [];
      solvesSnapshot.forEach((doc) => {
        const solve = doc.data();
        const date = new Date(solve.timestamp.toDate()).toLocaleDateString();
        const existingDate = solves.find((s) => s.date === date);
        if (existingDate) {
          existingDate.solves++;
        } else {
          solves.push({ date, solves: 1 });
        }
      });
      setSolveStats(solves.sort((a, b) => new Date(a.date) - new Date(b.date)));

      setStats({
        totalTeams,
        activeTeams,
        totalChallenges,
        totalSolves,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToActivity = () => {
    const q = query(
      collection(db, 'solves'),
      orderBy('timestamp', 'desc'),
      limit(10)
    );

    return onSnapshot(q, async (snapshot) => {
      const activity = [];
      for (const doc of snapshot.docs) {
        const solve = doc.data();

        const teamDoc = await getDocs(doc(db, 'teams', solve.teamId));
        const team = teamDoc.exists() ? teamDoc.data() : null;

        const challengeDoc = await getDocs(
          doc(db, 'challenges', solve.challengeId)
        );
        const challenge = challengeDoc.exists() ? challengeDoc.data() : null;

        if (team && challenge) {
          activity.push({
            id: doc.id,
            teamName: team.teamName,
            challengeTitle: challenge.title,
            points: challenge.points,
            timestamp: solve.timestamp.toDate(),
          });
        }
      }
      setRecentActivity(activity);
    });
  };

  if (isLoading) return <LoadingState message='Loading dashboard...' />;
  if (error) return <ErrorState message={error} onRetry={loadDashboardData} />;

  return (
    <div className='space-y-8'>
      <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
        <Card>
          <CardBody className='flex flex-row items-center gap-4'>
            <Users className='w-8 h-8 text-primary' />
            <div>
              <p className='text-small text-default-500'>Total Teams</p>
              <p className='text-2xl font-bold'>{stats.totalTeams}</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className='flex flex-row items-center gap-4'>
            <Activity className='w-8 h-8 text-success' />
            <div>
              <p className='text-small text-default-500'>Active Teams</p>
              <p className='text-2xl font-bold'>{stats.activeTeams}</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className='flex flex-row items-center gap-4'>
            <Flag className='w-8 h-8 text-warning' />
            <div>
              <p className='text-small text-default-500'>Total Challenges</p>
              <p className='text-2xl font-bold'>{stats.totalChallenges}</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className='flex flex-row items-center gap-4'>
            <Trophy className='w-8 h-8 text-danger' />
            <div>
              <p className='text-small text-default-500'>Total Solves</p>
              <p className='text-2xl font-bold'>{stats.totalSolves}</p>
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader className='flex gap-3'>
          <BarChart3 className='w-6 h-6' />
          <div className='flex flex-col'>
            <p className='text-md'>Solve Statistics</p>
            <p className='text-small text-default-500'>
              Number of solves per day
            </p>
          </div>
        </CardHeader>
        <Divider />
        <CardBody>
          <div className='h-[300px]'>
            <ResponsiveContainer width='100%' height='100%'>
              <LineChart data={solveStats}>
                <XAxis dataKey='date' />
                <YAxis />
                <Tooltip />
                <Line
                  type='monotone'
                  dataKey='solves'
                  stroke='var(--primary)'
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader className='flex gap-3'>
          <Clock className='w-6 h-6' />
          <div className='flex flex-col'>
            <p className='text-md'>Recent Activity</p>
            <p className='text-small text-default-500'>
              Latest challenge solves
            </p>
          </div>
        </CardHeader>
        <Divider />
        <CardBody>
          <div className='space-y-4'>
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className='flex items-center justify-between'
              >
                <div>
                  <p className='font-medium'>
                    {activity.teamName} solved {activity.challengeTitle}
                  </p>
                  <p className='text-small text-default-500'>
                    {activity.timestamp.toLocaleString()}
                  </p>
                </div>
                <div className='text-success'>+{activity.points} pts</div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <Tabs aria-label='Management' className='self-center'>
            <Tab
              key='challenges'
              title={
                <div className='flex items-center gap-2'>
                  <Flag className='w-4 h-4' />
                  Challenges
                </div>
              }
            >
              <ChallengeManager />
            </Tab>
            <Tab
              key='teams'
              title={
                <div className='flex items-center gap-2'>
                  <Users className='w-4 h-4' />
                  Teams
                </div>
              }
            >
              <TeamManager />
            </Tab>
          </Tabs>
        </CardBody>
      </Card>
    </div>
  );
}
