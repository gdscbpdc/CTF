'use client';

import { Card, CardHeader, CardBody, Avatar, Chip } from '@nextui-org/react';

const recentSolves = [
  {
    username: 'hackerman',
    challenge: 'Basic Injection',
    points: 100,
    timestamp: '2 mins ago',
  },
  // More recent solves...
];

export default function RecentSolves() {
  return (
    <Card>
      <CardHeader>
        <h3 className='text-xl font-bold'>Recent Solves</h3>
      </CardHeader>
      <CardBody>
        {recentSolves.map((solve, index) => (
          <div
            key={index}
            className='flex justify-between items-center py-2 border-b last:border-b-0'
          >
            <div className='flex items-center gap-3'>
              <Avatar name={solve.username} size='sm' />
              <div>
                <span className='font-medium'>{solve.username}</span>
                <p className='text-small text-default-500'>
                  solved {solve.challenge}
                </p>
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <Chip color='primary' size='sm' variant='flat'>
                +{solve.points} pts
              </Chip>
              <span className='text-tiny text-default-400'>
                {solve.timestamp}
              </span>
            </div>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
