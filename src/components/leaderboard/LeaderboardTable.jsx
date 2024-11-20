'use client';

import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Avatar,
} from '@nextui-org/react';

const mockLeaderboard = [
  {
    rank: 1,
    username: 'hackerman',
    points: 5000,
    solves: 42,
    country: 'AE',
  },
  // More mock users...
];

export default function LeaderboardTable() {
  return (
    <Table aria-label='Leaderboard'>
      <TableHeader>
        <TableColumn>Rank</TableColumn>
        <TableColumn>User</TableColumn>
        <TableColumn>Points</TableColumn>
        <TableColumn>Challenges Solved</TableColumn>
      </TableHeader>
      <TableBody>
        {mockLeaderboard.map((user) => (
          <TableRow key={user.rank}>
            <TableCell>{user.rank}</TableCell>
            <TableCell>
              <div className='flex items-center gap-2'>
                <Avatar name={user.username} />
                {user.username}
              </div>
            </TableCell>
            <TableCell>{user.points}</TableCell>
            <TableCell>{user.solves}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
