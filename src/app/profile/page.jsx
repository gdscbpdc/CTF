import { getCurrentUser } from '@/lib/auth';
import UserStats from '@/components/profile/UserStats';
import ProfileHeader from '@/components/profile/ProfileHeader';
import SolvedChallenges from '@/components/profile/SolvedChallenges';

export default function ProfilePage() {
  const user = getCurrentUser();

  return (
    <div className='space-y-8'>
      <ProfileHeader user={user} />
      <div className='grid md:grid-cols-2 gap-8'>
        <UserStats user={user} />
        <SolvedChallenges user={user} />
      </div>
    </div>
  );
}
