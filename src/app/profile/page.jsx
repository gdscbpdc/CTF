'use client';

import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Button,
  Avatar,
  Chip,
  Divider,
  Progress,
} from '@nextui-org/react';
import {
  Trophy,
  Flag,
  Target,
  Activity,
  CheckCircle,
  XCircle,
  User,
  Lock,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import ErrorState from '@/components/ui/ErrorState';
import LoadingState from '@/components/ui/LoadingState';
import { getUserProfile, getUserStats, updateUserProfile } from '@/lib/profile';

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState('');

  useEffect(() => {
    if (user?.id) {
      loadProfileAndStats();
    }
  }, [user?.id]);

  const loadProfileAndStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [profileData, statsData] = await Promise.all([
        getUserProfile(user.id),
        getUserStats(user.id),
      ]);
      setProfile(profileData);
      setStats(statsData);
      setFormData((prev) => ({
        ...prev,
        name: profileData.name,
      }));
    } catch (error) {
      console.error('Error loading profile:', error);
      setError('Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      setUpdateError('');
      setUpdateSuccess('');
      setIsUpdating(true);

      if (formData.newPassword !== formData.confirmPassword) {
        setUpdateError('New passwords do not match');
        return;
      }

      await updateUserProfile(user.id, formData);
      setUpdateSuccess('Profile updated successfully');
      loadProfileAndStats();

      setFormData((prev) => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    } catch (error) {
      setUpdateError(error.message || 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading)
    return <LoadingState message='Loading profile...' fullHeight />;
  if (error)
    return <ErrorState message={error} onRetry={loadProfileAndStats} />;

  return (
    <div className='space-y-6'>
      <Card>
        <CardBody className='flex flex-col md:flex-row items-center gap-6 p-8'>
          <Avatar name={profile?.name} className='w-24 h-24 text-large' />
          <div className='flex-grow text-center md:text-left'>
            <h1 className='text-2xl font-bold'>{profile?.name}</h1>
            <p className='text-default-500'>{profile?.email}</p>
            <div className='flex flex-wrap gap-2 mt-2 justify-center md:justify-start'>
              <Chip color='default'>
                {profile?.team?.teamName || 'No Team'}
              </Chip>
              <Chip color='secondary'>Rank #{profile?.rank || '-'}</Chip>
              <Chip color='success'>{profile?.totalPoints || 0} Points</Chip>
            </div>
          </div>
        </CardBody>
      </Card>

      <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
        <Card>
          <CardBody className='flex flex-row items-center gap-4'>
            <Trophy className='w-8 h-8 text-warning' />
            <div>
              <p className='text-small text-default-500'>Total Points</p>
              <p className='text-2xl font-bold'>{profile?.totalPoints || 0}</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className='flex flex-row items-center gap-4'>
            <Flag className='w-8 h-8 text-success' />
            <div>
              <p className='text-small text-default-500'>Challenges Solved</p>
              <p className='text-2xl font-bold'>
                {stats?.successfulSolves || 0}
              </p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className='flex flex-row items-center gap-4'>
            <Target className='w-8 h-8 text-primary' />
            <div>
              <p className='text-small text-default-500'>Success Rate</p>
              <p className='text-2xl font-bold'>
                {stats?.successRate?.toFixed(1) || 0}%
              </p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className='flex flex-row items-center gap-4'>
            <Activity className='w-8 h-8 text-danger' />
            <div>
              <p className='text-small text-default-500'>Total Attempts</p>
              <p className='text-2xl font-bold'>{stats?.totalAttempts || 0}</p>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <Card>
          <CardHeader className='flex gap-3'>
            <Activity className='w-5 h-5' />
            <div className='flex flex-col'>
              <p className='text-md'>Progress by Category</p>
              <p className='text-small text-default-500'>
                Your solve rate in different categories
              </p>
            </div>
          </CardHeader>
          <Divider />
          <CardBody className='gap-4'>
            {stats?.solvesByCategory &&
              Object.entries(stats.solvesByCategory).map(
                ([category, solves]) => (
                  <div key={category}>
                    <div className='flex justify-between mb-2'>
                      <span>{category}</span>
                      <span className='text-default-500'>{solves} solves</span>
                    </div>
                    <Progress
                      value={solves}
                      maxValue={10}
                      color='primary'
                      className='mb-4'
                    />
                  </div>
                )
              )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader className='flex gap-3'>
            <Activity className='w-5 h-5' />
            <div className='flex flex-col'>
              <p className='text-md'>Recent Activity</p>
              <p className='text-small text-default-500'>
                Your latest challenge attempts
              </p>
            </div>
          </CardHeader>
          <Divider />
          <CardBody>
            <div className='space-y-4'>
              {profile?.recentActivity?.map((activity) => (
                <div
                  key={activity.id}
                  className='flex items-center justify-between cursor-pointer hover:bg-default-100 p-2 rounded-lg'
                  onClick={() =>
                    router.push(`/challenges/${activity.challengeId}`)
                  }
                >
                  <div className='flex items-center gap-2'>
                    {activity.isCorrect ? (
                      <CheckCircle className='w-4 h-4 text-success' />
                    ) : (
                      <XCircle className='w-4 h-4 text-danger' />
                    )}
                    <div>
                      <p className='font-medium'>{activity.description}</p>
                      <p className='text-small text-default-500'>
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {activity.isCorrect && (
                    <Chip color='success' size='sm'>
                      +{activity.points} pts
                    </Chip>
                  )}
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader className='flex gap-3'>
          <User className='w-5 h-5' />
          <div className='flex flex-col'>
            <p className='text-md'>Profile Settings</p>
            <p className='text-small text-default-500'>
              Update your profile information
            </p>
          </div>
        </CardHeader>
        <Divider />
        <CardBody className='space-y-4'>
          {updateError && (
            <div className='text-danger text-sm bg-danger/10 p-3 rounded-lg'>
              {updateError}
            </div>
          )}
          {updateSuccess && (
            <div className='text-success text-sm bg-success/10 p-3 rounded-lg'>
              {updateSuccess}
            </div>
          )}

          <Input
            label='Name'
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            variant='bordered'
            startContent={<User className='w-4 h-4 text-default-400' />}
          />

          <Divider />

          <div className='space-y-4'>
            <h3 className='text-lg font-semibold flex items-center gap-2'>
              <Lock className='w-4 h-4' /> Change Password
            </h3>
            <Input
              label='Current Password'
              type='password'
              value={formData.currentPassword}
              onChange={(e) =>
                setFormData({ ...formData, currentPassword: e.target.value })
              }
              variant='bordered'
            />
            <Input
              label='New Password'
              type='password'
              value={formData.newPassword}
              onChange={(e) =>
                setFormData({ ...formData, newPassword: e.target.value })
              }
              variant='bordered'
            />
            <Input
              label='Confirm New Password'
              type='password'
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              variant='bordered'
            />
          </div>

          <div className='flex justify-center'>
            <Button
              color='primary'
              onPress={handleUpdate}
              isLoading={isUpdating}
            >
              Save Changes
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
