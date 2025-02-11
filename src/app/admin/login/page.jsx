'use client';

import { useState } from 'react';
import { Card, CardBody, Input, Button } from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';
import Cookies from 'js-cookie';

export default function AdminLogin() {
  const router = useRouter();
  const [secret, setSecret] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      setError('');

      if (!secret) {
        setError('Please enter the admin secret');
        return;
      }

      if (secret === process.env.NEXT_PUBLIC_ADMIN_SECRET) {
        Cookies.set('admin-secret', secret, {
          secure: true,
          sameSite: 'strict',
          expires: 1,
        });
        router.push('/admin');
      } else {
        setError('Invalid admin secret');
      }
    } catch (error) {
      setError('An error occurred during login');
      console.error('Admin login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className='flex justify-center items-center absolute top-0 left-0 w-full h-full px-4 py-4'>
      <Card className='w-full max-w-md'>
        <CardBody className='space-y-4 py-8 px-5'>
          <div className='flex justify-center'>
            <div className='w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center'>
              <Lock className='w-8 h-8 text-primary' />
            </div>
          </div>
          <div className='text-center space-y-2'>
            <h2 className='text-2xl font-bold'>Admin Access</h2>
            <p className='text-default-500'>
              Enter your admin secret to continue
            </p>
          </div>
          {error && (
            <div className='text-danger text-sm text-center'>{error}</div>
          )}
          <Input
            type='password'
            label='Admin Secret'
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            onKeyDown={handleKeyPress}
            size='lg'
          />
          <Button
            color='primary'
            size='lg'
            fullWidth
            onPress={handleLogin}
            isLoading={isLoading}
          >
            Login
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}
