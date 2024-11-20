'use client';

import { Card, CardBody, Input, Button, Link } from '@nextui-org/react';
import { useState } from 'react';
import { registerUser } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');

  const handleRegister = () => {
    // Basic client-side validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const result = registerUser({
      username: formData.username,
      email: formData.email,
      password: formData.password,
    });

    if (result.success) {
      // Redirect to login or dashboard
      router.push('/login');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className='flex justify-center items-center min-h-[calc(100vh-4rem)]'>
      <Card className='w-full max-w-md'>
        <CardBody className='space-y-4'>
          <h2 className='text-2xl font-bold text-center'>Register</h2>
          {error && <div className='text-danger text-center'>{error}</div>}
          <Input
            label='Username'
            value={formData.username}
            onChange={(e) =>
              setFormData({
                ...formData,
                username: e.target.value,
              })
            }
          />
          <Input
            label='Email'
            type='email'
            value={formData.email}
            onChange={(e) =>
              setFormData({
                ...formData,
                email: e.target.value,
              })
            }
          />
          <Input
            label='Password'
            type='password'
            value={formData.password}
            onChange={(e) =>
              setFormData({
                ...formData,
                password: e.target.value,
              })
            }
          />
          <Input
            label='Confirm Password'
            type='password'
            value={formData.confirmPassword}
            onChange={(e) =>
              setFormData({
                ...formData,
                confirmPassword: e.target.value,
              })
            }
          />
          <Button color='primary' fullWidth onClick={handleRegister}>
            Register
          </Button>
          <div className='text-center'>
            Already have an account?{' '}
            <Link href='/login' color='primary'>
              Login
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
