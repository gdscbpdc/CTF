import { redirect } from 'next/navigation';
import AdminDashboard from '@/components/admin/AdminDashboard';
import { getCurrentUser } from '@/lib/auth';

export default function AdminPage() {
  const user = getCurrentUser();

  if (!user || !user.isAdmin) {
    redirect('/login');
  }

  return <AdminDashboard />;
}
