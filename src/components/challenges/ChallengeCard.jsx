'use client';

import Link from 'next/link';
import { Card, CardHeader, CardBody, Chip } from '@nextui-org/react';

export default function ChallengeCard({ challenge }) {
  return (
    <Link href={`/challenges/${challenge.id}`}>
      <Card
        className='bg-default-100 hover:bg-default-200 transition-colors duration-300'
        shadow='sm'
      >
        <CardHeader className='flex justify-between items-center'>
          <h3 className='text-xl font-bold'>{challenge.title}</h3>
          <Chip color='primary' variant='flat' size='sm'>
            {challenge.points} pts
          </Chip>
        </CardHeader>
        <CardBody>
          <p className='text-default-600'>{challenge.shortDescription}</p>
          <div className='flex justify-between mt-4'>
            <Chip color='secondary' variant='dot' size='sm'>
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
