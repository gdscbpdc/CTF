'use client';

import {
  Card,
  CardHeader,
  CardBody,
  Chip,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from '@nextui-org/react';

import { getChallenges } from '@/lib/challenges';
import { generateSolveHistory } from '@/lib/challenge-tracking';

export default function SolvedChallenges({ user }) {
  const challenges = getChallenges();
  const solveHistory = generateSolveHistory(user, challenges);

  return (
    <Card>
      <CardHeader>
        <h3 className='text-xl font-bold'>Solved Challenges</h3>
      </CardHeader>
      <CardBody>
        {solveHistory.length > 0 ? (
          <Table>
            <TableHeader>
              <TableColumn>Challenge</TableColumn>
              <TableColumn>Category</TableColumn>
              <TableColumn>Difficulty</TableColumn>
              <TableColumn>Solved At</TableColumn>
            </TableHeader>
            <TableBody>
              {solveHistory.map((solve) => (
                <TableRow key={solve.challengeId}>
                  <TableCell>{solve.title}</TableCell>
                  <TableCell>
                    <Chip size='sm' color='secondary' variant='dot'>
                      {solve.category}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size='sm'
                      color={
                        solve.difficulty === 'Easy'
                          ? 'success'
                          : solve.difficulty === 'Medium'
                          ? 'warning'
                          : solve.difficulty === 'Hard'
                          ? 'danger'
                          : 'default'
                      }
                      variant='flat'
                    >
                      {solve.difficulty}
                    </Chip>
                  </TableCell>
                  <TableCell>{solve.solvedAt.toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className='text-center text-default-500'>
            No challenges solved yet
          </p>
        )}
      </CardBody>
    </Card>
  );
}
