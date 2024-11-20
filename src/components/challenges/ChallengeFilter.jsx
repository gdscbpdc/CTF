'use client';

import { Select, SelectItem, Checkbox } from '@nextui-org/react';
import { CHALLENGE_CATEGORIES, CHALLENGE_DIFFICULTIES } from '@/lib/constants';

export default function ChallengeFilter() {
  return (
    <div className='grid md:grid-cols-3 gap-4'>
      <Select label='Category'>
        {CHALLENGE_CATEGORIES.map((category) => (
          <SelectItem key={category} value={category}>
            {category}
          </SelectItem>
        ))}
      </Select>
      <Select label='Difficulty'>
        {CHALLENGE_DIFFICULTIES.map((difficulty) => (
          <SelectItem key={difficulty} value={difficulty}>
            {difficulty}
          </SelectItem>
        ))}
      </Select>
      <div className='flex flex-col gap-2'>
        <Checkbox>Unsolved</Checkbox>
        <Checkbox>Solved</Checkbox>
      </div>
    </div>
  );
}
