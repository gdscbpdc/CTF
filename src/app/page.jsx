'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Button, Card } from '@nextui-org/react';
import { Flag, Trophy, Users, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import ChallengeGrid from '@/components/challenges/ChallengeGrid';
import RecentSolves from '@/components/home/RecentSolves';
import LeaderboardPreview from '@/components/home/LeaderboardPreview';

export default function HomePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!user) {
    return (
      <div className='space-y-16'>
        <section className='text-center space-y-6'>
          <h1 className='text-5xl font-bold bg-gradient-to-r from-primary to-danger bg-clip-text text-transparent'>
            GDG CTF Platform
          </h1>
          <p className='text-xl text-foreground-600 max-w-2xl mx-auto'>
            Test your hacking skills, solve challenges, and compete with teams
            from around the world in our Capture The Flag competition.
          </p>
          <div className='flex gap-4 justify-center'>
            <Button
              as={Link}
              href='/register'
              color='primary'
              size='lg'
              endContent={<ChevronRight className='w-4 h-4' />}
            >
              Join the Competition
            </Button>
            <Button as={Link} href='/login' variant='bordered' size='lg'>
              Login
            </Button>
          </div>
        </section>

        <section className='grid md:grid-cols-3 gap-8'>
          <Card className='p-6 space-y-4'>
            <Flag className='w-12 h-12 text-primary' />
            <h2 className='text-xl font-bold'>Diverse Challenges</h2>
            <p className='text-foreground-600'>
              From web exploitation to cryptography, test your skills across
              various security domains.
            </p>
          </Card>

          <Card className='p-6 space-y-4'>
            <Users className='w-12 h-12 text-success' />
            <h2 className='text-xl font-bold'>Team Competition</h2>
            <p className='text-foreground-600'>
              Form teams of up to 4 members and collaborate to solve challenges
              together.
            </p>
          </Card>

          <Card className='p-6 space-y-4'>
            <Trophy className='w-12 h-12 text-warning' />
            <h2 className='text-xl font-bold'>Real-time Leaderboard</h2>
            <p className='text-foreground-600'>
              Track your progress and compete with other teams in real-time on
              our dynamic leaderboard.
            </p>
          </Card>
        </section>

        <section className='space-y-6'>
          <h2 className='text-3xl font-bold text-center'>Competition Rules</h2>
          <Card className='p-6'>
            <ul className='list-disc list-inside space-y-4 text-foreground-600'>
              <li>
                Teams can have up to 4 members. You can register as an
                individual and join or create a team later.
              </li>
              <li>
                Each challenge has a unique flag format. Submit the exact flag
                to score points.
              </li>
              <li>
                Points are awarded based on challenge difficulty. Early solves
                may receive bonus points.
              </li>
              <li>
                Attacking the competition infrastructure or other teams is
                strictly prohibited.
              </li>
              <li>
                Share knowledge and help others learn, but do not share
                challenge solutions during the competition.
              </li>
            </ul>
          </Card>
        </section>

        <section className='text-center space-y-6 bg-gradient-to-r from-primary/20 to-danger/20 rounded-xl p-12'>
          <h2 className='text-3xl font-bold'>Ready to Test Your Skills?</h2>
          <p className='text-xl text-foreground-600'>
            Join hundreds of cybersecurity enthusiasts in our CTF competition.
          </p>
          <Button
            as={Link}
            href='/register'
            color='primary'
            size='lg'
            endContent={<ChevronRight className='w-4 h-4' />}
          >
            Register Now
          </Button>
        </section>
      </div>
    );
  } else
    return (
      <div className='space-y-8 overflow-visible'>
        <section className='text-center bg-gradient-to-r from-primary/70 to-danger/70 rounded-xl p-12'>
          <h1 className='text-4xl font-bold text-white mb-4'>
            Welcome back, {user.name}!
          </h1>
          <p className='text-xl text-white/80 max-w-2xl mx-auto'>
            Continue solving challenges and climb the leaderboard with your
            team.
          </p>
        </section>

        <ChallengeGrid />

        <div className='grid md:grid-cols-2 gap-8'>
          <RecentSolves />
          <LeaderboardPreview />
        </div>
      </div>
    );
}
