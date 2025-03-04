import { Trophy } from 'lucide-react';
import { Card, CardBody } from '@nextui-org/react';

const Podium = ({ team, index }) => {
  return (
    <Card
      key={team.id}
      className={
        index === 0
          ? 'bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 mb-10'
          : index === 1
          ? 'bg-gradient-to-br from-slate-400/20 to-slate-500/20 mt-10'
          : 'bg-gradient-to-br from-amber-600/20 to-amber-700/20 mt-10'
      }
    >
      <CardBody className='py-8 text-center space-y-4'>
        <Trophy
          className={
            index === 0
              ? 'w-12 h-12 mx-auto text-yellow-500'
              : index === 1
              ? 'w-12 h-12 mx-auto text-slate-400'
              : 'w-12 h-12 mx-auto text-amber-600'
          }
        />
        <div>
          <p className='text-xl font-bold'>{team.teamName}</p>
          <p className='text-default-500'>
            {team.points} points • {team.solvedChallenges?.length || 0} solves
          </p>
        </div>
      </CardBody>
    </Card>
  );
};

export default Podium;
