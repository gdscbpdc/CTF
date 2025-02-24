'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import AdminDashboard from '@/components/admin/AdminDashboard';
import LoadingState from '@/components/ui/LoadingState';
import ErrorState from '@/components/ui/ErrorState';

export default function AdminPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const adminSecret = Cookies.get('admin-secret');
    if (!adminSecret || adminSecret !== process.env.NEXT_PUBLIC_ADMIN_SECRET) {
      router.push('/admin/login');
      return;
    }
    setIsLoading(false);
  }, [router]);

  if (isLoading)
    return <LoadingState message='Verifying admin access...' fullHeight />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className='container mx-auto px-4 py-8'>
      <AdminDashboard />
    </div>
  );
}
