'use client';

import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import LoadingState from '@/components/ui/LoadingState';
import AdminDashboard from '@/components/admin/AdminDashboard';

export default function AdminPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

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

  return <AdminDashboard />;
}
