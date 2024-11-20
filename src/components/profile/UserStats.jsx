'use client';

import { Card, CardBody } from '@nextui-org/react';
import { generateUserStatistics } from '@/lib/statistics';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export default function UserStats({ user }) {
  const stats = generateUserStatistics(user);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <Card>
      <CardBody className='space-y-4'>
        <div className='grid grid-cols-2 gap-4'>
          <div>
            <h4 className='text-sm text-default-500'>Total Challenges</h4>
            <p className='text-2xl font-bold'>{stats.totalChallenges}</p>
          </div>
          <div>
            <h4 className='text-sm text-default-500'>Solved Challenges</h4>
            <p className='text-2xl font-bold'>{stats.solvedChallenges}</p>
          </div>
        </div>

        <div>
          <h4 className='text-sm text-default-500 mb-2'>Points Distribution</h4>
          <ResponsiveContainer width='100%' height={200}>
            <PieChart>
              <Pie
                data={stats.pointsDistribution}
                cx='50%'
                cy='50%'
                labelLine={false}
                outerRadius={80}
                fill='#8884d8'
                dataKey='points'
              >
                {stats.pointsDistribution.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardBody>
    </Card>
  );
}
