'use client';

import Link from 'next/link';
import { Card, CardHeader, CardBody, Avatar, Button } from '@nextui-org/react';

const topPlayers = [
  { rank: 1, username: 'hackerman', points: 5000 },
  { rank: 2, username: 'codebreaker', points: 4500 },
  { rank: 3, username: 'cryptoqueen', points: 4200 },
];

export default function LeaderboardPreview() {
  return (
    <Card>
      <CardHeader className='flex justify-between items-center'>
        <h3 className='text-xl font-bold'>Top Players</h3>
        <Button as={Link} href='/leaderboard' size='sm' variant='light'>
          View Full Leaderboard
        </Button>
      </CardHeader>
      <CardBody>
        {topPlayers.map((player) => (
          <div
            key={player.rank}
            className='flex justify-between items-center py-2 border-b last:border-b-0'
          >
            <div className='flex items-center gap-3'>
              <span className='font-bold text-default-500'>#{player.rank}</span>
              <Avatar name={player.username} size='sm' />
              <span className='font-medium'>{player.username}</span>
            </div>
            <span className='font-bold text-primary'>{player.points} pts</span>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
