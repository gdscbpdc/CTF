'use client';

import { useState } from 'react';
import {
  Card,
  CardBody,
  Input,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Divider,
} from '@nextui-org/react';
import { loginUser, sendPasswordReset } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });
  const [resetEmail, setResetEmail] = useState('');
  const [error, setError] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const handleLogin = async () => {
    try {
      setError('');
      setIsLoading(true);
      const result = await loginUser(credentials);

      if (result.success) {
        router.push('/');
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    try {
      setResetError('');
      setResetSuccess('');
      setIsResetting(true);

      if (!resetEmail) {
        setResetError('Please enter your email address');
        return;
      }

      await sendPasswordReset(resetEmail);
      setResetSuccess('Password reset email sent! Please check your inbox.');
      setResetEmail('');
    } catch (error) {
      setResetError(error.message || 'Failed to send reset email');
    } finally {
      setIsResetting(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className='flex justify-center items-center absolute top-0 left-0 w-full h-full'>
      <div className='w-full max-w-md space-y-8'>
        <h1 className='text-4xl font-bold text-center bg-gradient-to-r from-primary to-danger bg-clip-text text-transparent'>
          Welcome Back
        </h1>

        <Card className='w-full'>
          <CardBody className='space-y-4 py-8'>
            {error && (
              <div className='text-danger text-sm text-center bg-danger/10 p-3 rounded-lg'>
                {error}
              </div>
            )}
            <Input
              label='Email'
              type='email'
              value={credentials.email}
              onChange={(e) =>
                setCredentials({
                  ...credentials,
                  email: e.target.value,
                })
              }
              onKeyDown={handleKeyPress}
              startContent={<Mail className='w-4 h-4 text-default-400' />}
              size='lg'
              variant='bordered'
            />
            <Input
              label='Password'
              type={isVisible ? 'text' : 'password'}
              endContent={
                <button type='button' onClick={() => setIsVisible(!isVisible)}>
                  {isVisible ? (
                    <Eye className='size-full text-default-400' />
                  ) : (
                    <EyeOff className='size-full text-default-400' />
                  )}
                </button>
              }
              value={credentials.password}
              onChange={(e) =>
                setCredentials({
                  ...credentials,
                  password: e.target.value,
                })
              }
              onKeyDown={handleKeyPress}
              startContent={<Lock className='w-4 h-4 text-default-400' />}
              size='lg'
              variant='bordered'
            />
            <div className='flex justify-end'>
              <Button variant='light' onPress={onOpen} className='text-primary'>
                Forgot password?
              </Button>
            </div>
            <Button
              color='primary'
              size='lg'
              fullWidth
              onPress={handleLogin}
              isLoading={isLoading}
              endContent={!isLoading && <ArrowRight className='w-4 h-4' />}
            >
              Sign In
            </Button>
            <Divider className='my-4' />
            <div className='text-center text-sm'>
              Don't have an account?{' '}
              <Link
                href='/register'
                className='text-primary hover:underline font-medium'
              >
                Register here
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>

      <Modal isOpen={isOpen} onClose={onClose} size='sm'>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className='flex flex-col gap-1'>
                Reset Password
                <span className='text-small text-default-500 font-normal'>
                  Enter your email to receive reset instructions
                </span>
              </ModalHeader>
              <ModalBody>
                {resetError && (
                  <div className='text-danger text-sm bg-danger/10 p-3 rounded-lg'>
                    {resetError}
                  </div>
                )}
                {resetSuccess && (
                  <div className='text-success text-sm bg-success/10 p-3 rounded-lg'>
                    {resetSuccess}
                  </div>
                )}
                <Input
                  label='Email'
                  type='email'
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  startContent={<Mail className='w-4 h-4 text-default-400' />}
                  variant='bordered'
                  size='lg'
                />
              </ModalBody>
              <ModalFooter>
                <Button variant='light' onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color='primary'
                  onPress={handlePasswordReset}
                  isLoading={isResetting}
                >
                  Send Reset Link
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
