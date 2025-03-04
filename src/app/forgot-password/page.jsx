'use client';

import { useState } from 'react';
import {
  Card,
  CardBody,
  Input,
  Button,
  Link as NextUILink,
} from '@nextui-org/react';
import Link from 'next/link';
import { Mail, ArrowLeft } from 'lucide-react';
import { sendPasswordReset } from '@/lib/auth';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setError('');
      setSuccess('');
      setIsLoading(true);

      if (!email) {
        setError('Please enter your email address');
        return;
      }

      await sendPasswordReset(email);
      setSuccess(
        'Password reset instructions have been sent to your email address'
      );
      setEmail('');
    } catch (error) {
      setError(error.message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className='flex justify-center items-center absolute top-0 left-0 w-full h-full'>
      <div className='w-full max-w-md space-y-6'>
        <h1 className='text-4xl font-bold text-center bg-gradient-to-r from-primary to-danger bg-clip-text text-transparent'>
          Reset Password
        </h1>

        <Card className='w-full'>
          <CardBody className='space-y-4 py-8'>
            {error && (
              <div className='text-danger text-sm text-center bg-danger/10 p-3 rounded-lg'>
                {error}
              </div>
            )}
            {success && (
              <div className='text-success text-sm text-center bg-success/10 p-3 rounded-lg'>
                {success}
              </div>
            )}

            <div className='space-y-2'>
              <p className='text-default-500 text-center'>
                Enter your email address and we'll send you instructions to
                reset your password.
              </p>
              <Input
                label='Email'
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyPress}
                startContent={<Mail className='w-4 h-4 text-default-400' />}
                size='lg'
                variant='bordered'
              />
            </div>

            <Button
              color='primary'
              size='lg'
              fullWidth
              onPress={handleSubmit}
              isLoading={isLoading}
            >
              Send Reset Link
            </Button>

            <div className='text-center'>
              <Link
                prefetch
                shallow
                href='/login'
                className='text-primary hover:underline font-medium inline-flex items-center gap-2'
              >
                <ArrowLeft className='w-4 h-4' />
                Back to Login
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
