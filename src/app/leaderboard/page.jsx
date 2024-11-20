import LeaderboardTable from '@/components/leaderboard/LeaderboardTable';

export default function LeaderboardPage() {
  return (
    <div className='space-y-8'>
      <h1 className='text-3xl font-bold'>Global Leaderboard</h1>
      <LeaderboardTable />
    </div>
  );
}
