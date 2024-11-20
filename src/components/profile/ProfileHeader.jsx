'use client';

import { Avatar, Card, CardBody, Progress } from '@nextui-org/react';

export default function ProfileHeader({ user }) {
  const nextRankProgress = (user.points % 1000) / 10;

  return (
    <Card>
      <CardBody className='flex flex-row items-center gap-6'>
        <Avatar size='lg' name={user.username} className='w-24 h-24' />

        <div className='space-y-4 flex-grow'>
          <div>
            <h1 className='text-2xl font-bold'>{user.username}</h1>
            <p className='text-default-500'>{user.rank}</p>
          </div>

          <div className='space-y-2'>
            <div className='flex justify-between'>
              <p>
                {user.points} / {Math.ceil(nextRankProgress) * 1000} pts
              </p>
              <p>{nextRankProgress.toFixed(1)}%</p>
            </div>
            <Progress value={nextRankProgress} color='primary' size='sm' />
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
