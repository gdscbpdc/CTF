'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Divider,
  Tabs,
  Tab,
  Button,
} from '@nextui-org/react';
import {
  Users,
  Flag,
  Trophy,
  Activity,
  BarChart3,
  Clock,
  Download,
} from 'lucide-react';
import { db } from '@/services/firebase.config';
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  where,
  getDocs,
  doc,
  getDoc,
} from 'firebase/firestore';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import { toast } from 'sonner';
import ChallengeManager from './ChallengeManager';
import LoadingState from '@/components/ui/LoadingState';
import ErrorState from '@/components/ui/ErrorState';
import TeamManager from './TeamManager';
import {
  exportTeamsToCSV,
  downloadCSV,
  exportDetailedSolvesToCSV,
} from '@/lib/export';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [solveStats, setSolveStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isActivityLoading, setIsActivityLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

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

      const solvesQuery = query(
        collection(db, 'solves'),
        where('isCorrect', '==', true)
      );
      const solvesSnapshot = await getDocs(solvesQuery);

      const totalSolves = solvesSnapshot.size;

      const teamSolveStats = [];
      const teamSolvesMap = {};

      solvesSnapshot.forEach((doc) => {
        const solve = doc.data();
        const teamId = solve.teamId;

        if (!teamSolvesMap[teamId]) {
          teamSolvesMap[teamId] = 0;
        }

        teamSolvesMap[teamId]++;
      });

      for (const teamDoc of teamsSnapshot.docs) {
        const teamId = teamDoc.id;
        const teamData = teamDoc.data();

        if (teamSolvesMap[teamId]) {
          teamSolveStats.push({
            name: teamData.teamName,
            solves: teamSolvesMap[teamId],
            points: teamData.points || 0,
          });
        }
      }

      teamSolveStats.sort((a, b) => b.solves - a.solves);

      setSolveStats(teamSolveStats.slice(0, 10));

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

    setIsActivityLoading(true);
    return onSnapshot(q, async (snapshot) => {
      const activity = [];
      for (const document of snapshot.docs) {
        const solve = document.data();

        const teamDoc = await getDoc(doc(db, 'teams', solve.teamId));
        const team = teamDoc.exists() ? teamDoc.data() : null;

        const challengeDoc = await getDoc(
          doc(db, 'challenges', solve.challengeId)
        );
        const challenge = challengeDoc.exists() ? challengeDoc.data() : null;

        if (team && challenge) {
          activity.push({
            id: document.id,
            teamName: team.teamName,
            challengeTitle: challenge.title,
            points: challenge.points,
            timestamp: solve.timestamp.toDate(),
          });
        }
      }
      setRecentActivity(activity);
      setIsActivityLoading(false);
    });
  };

  const handleExportTeams = async () => {
    try {
      setIsExporting(true);
      toast.info('Preparing team data for export...', {
        id: 'export-toast',
        duration: 10000,
      });

      const teamsSnapshot = await getDocs(collection(db, 'teams'));
      const teamsData = [];
      const teamIds = [];

      toast.loading('Fetching team and member data...', {
        id: 'export-toast',
      });

      for (const document of teamsSnapshot.docs) {
        const team = document.data();
        teamIds.push(document.id);

        console.log(team);

        const membersQuery = query(
          collection(db, 'users'),
          where('teamId', '==', document.id)
        );
        const membersSnapshot = await getDocs(membersQuery);
        const members = membersSnapshot.docs.map((memberDoc) => ({
          id: memberDoc.id,
          ...memberDoc.data(),
        }));

        teamsData.push({
          id: document.id,
          ...team,
          members,
          memberCount: members.length,
        });
      }

      toast.loading('Fetching challenge data...', {
        id: 'export-toast',
      });

      const challengesSnapshot = await getDocs(collection(db, 'challenges'));
      const challengesMap = {};
      challengesSnapshot.docs.forEach((doc) => {
        console.log(doc.data());

        challengesMap[doc.id] = {
          id: doc.id,
          ...doc.data(),
        };
      });

      toast.loading('Fetching solve data...', {
        id: 'export-toast',
      });

      const solvesQuery = query(
        collection(db, 'solves'),
        where('isCorrect', '==', true)
      );
      const solvesSnapshot = await getDocs(solvesQuery);
      const solveDetails = {};

      for (const solve of solvesSnapshot.docs) {
        const solveData = solve.data();
        const teamId = solveData.teamId;

        console.log(teamId);

        if (!teamIds.includes(teamId)) continue;

        const challenge = challengesMap[solveData.challengeId];
        if (!challenge) continue;

        let solvedBy = 'Unknown';
        if (solveData.userId) {
          const userDoc = await getDoc(doc(db, 'users', solveData.userId));
          if (userDoc.exists()) {
            solvedBy = userDoc.data().name || userDoc.data().email || 'Unknown';
          }
        }

        if (!solveDetails[teamId]) {
          solveDetails[teamId] = [];
        }

        solveDetails[teamId].push({
          id: solve.id,
          challengeId: solveData.challengeId,
          challengeTitle: challenge.title,
          challengeCategory: challenge.category,
          points: challenge.points,
          timestamp: solveData.timestamp?.toDate(),
          solvedBy,
        });
      }

      toast.loading('Generating CSV files...', {
        id: 'export-toast',
      });

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

      const csvContent = exportTeamsToCSV(teamsData, solveDetails);
      downloadCSV(csvContent, `teams-export-${timestamp}.csv`);

      const detailedCsvContent = exportDetailedSolvesToCSV(
        teamsData,
        solveDetails
      );
      downloadCSV(detailedCsvContent, `teams-solves-detailed-${timestamp}.csv`);

      toast.success('Team data exported successfully!', {
        id: 'export-toast',
        description:
          'Two files have been downloaded: teams summary and detailed solves. All times are in Dubai time (UTC+4).',
      });
    } catch (error) {
      console.error('Error exporting teams:', error);
      toast.error('Failed to export team data', {
        id: 'export-toast',
        description: error.message,
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading)
    return <LoadingState message='Loading dashboard...' fullHeight />;
  if (error) return <ErrorState message={error} onRetry={loadDashboardData} />;

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold'>Admin Dashboard</h1>
        <Button
          color='primary'
          startContent={<Download className='w-4 h-4' />}
          isLoading={isExporting}
          onPress={handleExportTeams}
          tooltip='Export team data with correct solves as CSV files (summary and detailed solves)'
        >
          Export Teams & Solves
        </Button>
      </div>

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
            <p className='text-md'>Team Performance</p>
            <p className='text-small text-default-500'>
              Solves and points per team (top 10)
            </p>
          </div>
        </CardHeader>
        <Divider />
        <CardBody>
          <div className='h-[400px]'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart
                data={solveStats}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 70,
                }}
              >
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis
                  dataKey='name'
                  angle={-45}
                  textAnchor='end'
                  height={80}
                  interval={0}
                  tick={{ fontSize: 12 }}
                />
                <YAxis yAxisId='left' orientation='left' stroke='#8884d8' />
                <YAxis yAxisId='right' orientation='right' stroke='#82ca9d' />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--background)',
                    borderRadius: '8px',
                    border: '1px solid var(--divider)',
                  }}
                  labelStyle={{ color: 'var(--foreground)' }}
                  itemStyle={{ color: 'var(--foreground)' }}
                />
                <Legend />
                <Bar
                  yAxisId='left'
                  dataKey='solves'
                  name='Solves'
                  fill='#8884d8'
                />
                <Bar
                  yAxisId='right'
                  dataKey='points'
                  name='Points'
                  fill='#82ca9d'
                />
              </BarChart>
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
          {isActivityLoading ? (
            <LoadingState message='Loading recent activity...' />
          ) : (
            <div className='space-y-4'>
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className='flex items-center justify-between'
                >
                  <div>
                    <p className='font-medium'>
                      <span className='text-primary font-bold'>
                        {activity.teamName}
                      </span>{' '}
                      solved{' '}
                      <span className='text-secondary font-bold'>
                        {activity.challengeTitle}
                      </span>
                    </p>
                    <p className='text-small text-default-500'>
                      {activity.timestamp.toLocaleString()}
                    </p>
                  </div>
                  <div className='text-success'>+{activity.points} pts</div>
                </div>
              ))}
            </div>
          )}
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
