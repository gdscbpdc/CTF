import ChallengeGrid from '@/components/challenges/ChallengeGrid';
import RecentSolves from '@/components/home/RecentSolves';
import LeaderboardPreview from '@/components/home/LeaderboardPreview';

export default function Home() {
  return (
    <div className='space-y-8'>
      <section className='text-center bg-gradient-to-r from-primary/70 to-secondary/70 rounded-xl p-12'>
        <h1 className='text-4xl font-bold text-white mb-4'>
          GDG UAE Capture The Flag
        </h1>
        <p className='text-xl text-white/80 max-w-2xl mx-auto'>
          Test your hacking skills, solve challenges, and climb the leaderboard!
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
