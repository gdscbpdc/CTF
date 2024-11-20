import { Tabs, Tab } from '@nextui-org/react';

import UserManager from './UserManager';
import ChallengeManager from './ChallengeManager';

export default function AdminDashboard() {
  return (
    <div>
      <h1 className='text-3xl font-bold mb-6'>Admin Dashboard</h1>
      <Tabs>
        <Tab key='challenges' title='Challenges'>
          <ChallengeManager />
        </Tab>
        <Tab key='users' title='Users'>
          <UserManager />
        </Tab>
      </Tabs>
    </div>
  );
}
