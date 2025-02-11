'use client';

import Link from 'next/link';
import { Card, CardHeader, CardBody, Chip } from '@nextui-org/react';

import {
  CHALLENGE_CATEGORIES_COLORS,
  CHALLENGE_DIFFICULTIES_COLORS,
} from '@/lib/constants';

export default function ChallengeCard({ challenge }) {
  return (
    <Link href={`/challenges/${challenge.id}`}>
      <Card
        isHoverable
        isPressable
        className={`w-full bg-${
          CHALLENGE_DIFFICULTIES_COLORS[challenge.difficulty]
        }/20`}
      >
        <CardHeader className='flex justify-between items-center gap-2'>
          <h3 className='text-xl font-bold truncate'>{challenge.title}</h3>
          <Chip variant='flat' size='sm'>
            {challenge.points} pts
          </Chip>
        </CardHeader>
        <CardBody>
          <p className='text-default-600 truncate'>
            {challenge.shortDescription}
          </p>
          <div className='flex justify-between mt-4'>
            <Chip
              variant='dot'
              size='sm'
              color={CHALLENGE_CATEGORIES_COLORS[challenge.category]}
            >
              {challenge.category}
            </Chip>
            <span className='text-default-500 text-sm'>
              {challenge.difficulty}
            </span>
          </div>
        </CardBody>
      </Card>
    </Link>
  );
}
