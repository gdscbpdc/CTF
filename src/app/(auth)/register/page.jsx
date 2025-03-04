'use client';

import { useState } from 'react';
import { Card, CardBody, Input, Button, Divider } from '@nextui-org/react';
import { registerTeam } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  User,
  Mail,
  Lock,
  UserPlus,
  Users,
  Trophy,
  ArrowRight,
} from 'lucide-react';

const emptyMember = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
};

export default function RegisterPage() {
  const router = useRouter();
  const [teamName, setTeamName] = useState('');
  const [members, setMembers] = useState([{ ...emptyMember }]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const addMember = () => {
    if (members.length < 4) {
      setMembers([...members, { ...emptyMember }]);
    }
  };

  const removeMember = (index) => {
    if (members.length > 1) {
      setMembers(members.filter((_, i) => i !== index));
    }
  };

  const updateMember = (index, field, value) => {
    const updatedMembers = [...members];
    updatedMembers[index] = {
      ...updatedMembers[index],
      [field]: value,
    };
    setMembers(updatedMembers);
  };

  const validateForm = () => {
    if (!teamName || teamName.length < 3) {
      setError('Team name must be at least 3 characters long');
      toast.error('Invalid team name', {
        description: 'Team name must be at least 3 characters long',
      });
      return false;
    }

    for (let i = 0; i < members.length; i++) {
      const member = members[i];

      if (!member.name || member.name.length < 2) {
        setError(`Member ${i + 1}: Name must be at least 2 characters long`);
        toast.error('Invalid member name', {
          description: `Member ${
            i + 1
          }: Name must be at least 2 characters long`,
        });
        return false;
      }

      if (!member.email || !member.email.includes('@')) {
        setError(`Member ${i + 1}: Invalid email address`);
        toast.error('Invalid email', {
          description: `Member ${i + 1}: Please enter a valid email address`,
        });
        return false;
      }

      if (!member.password || member.password.length < 8) {
        setError(
          `Member ${i + 1}: Password must be at least 8 characters long`
        );
        toast.error('Invalid password', {
          description: `Member ${
            i + 1
          }: Password must be at least 8 characters long`,
        });
        return false;
      }

      if (member.password !== member.confirmPassword) {
        setError(`Member ${i + 1}: Passwords do not match`);
        toast.error('Password mismatch', {
          description: `Member ${i + 1}: Passwords do not match`,
        });
        return false;
      }
    }

    return true;
  };

  const handleRegister = async () => {
    try {
      setError('');
      setIsLoading(true);

      if (!validateForm()) {
        setIsLoading(false);
        return;
      }

      toast.loading('Creating your team...', {
        description: 'Please wait while we set up your team',
      });

      const result = await registerTeam({
        teamName,
        members: members.map(({ confirmPassword, ...member }) => member),
      });

      if (result.success) {
        toast.success('Team created successfully!', {
          description: `Welcome to ${teamName}! You can now start solving challenges.`,
        });
        router.push('/challenges');
      } else {
        setError(result.message);
        toast.error('Registration failed', {
          description: result.message,
        });
      }
    } catch (error) {
      setError('An error occurred during registration');
      toast.error('Registration error', {
        description: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='flex justify-center items-center size-full'>
      <div className='w-full max-w-2xl space-y-6'>
        <div className='text-center space-y-2'>
          <h1 className='text-4xl font-bold bg-gradient-to-r from-primary to-danger bg-clip-text text-transparent'>
            Create Your Team
          </h1>
          <p className='text-default-500'>
            Join forces with up to 4 members and compete together
          </p>
        </div>

        <Card className='w-full'>
          <CardBody className='space-y-4 py-8 px-5'>
            {error && (
              <div className='text-danger text-sm text-center bg-danger/10 p-3 rounded-lg'>
                {error}
              </div>
            )}

            <div className='space-y-2'>
              <div className='flex items-center gap-2 mb-2'>
                <Trophy className='w-5 h-5 text-primary' />
                <h2 className='text-xl font-semibold'>Team Information</h2>
              </div>
              <Input
                label='Team Name'
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                startContent={<Users className='w-4 h-4 text-default-400' />}
                size='lg'
                variant='bordered'
              />
            </div>

            <Divider className='my-4' />

            {members.map((member, index) => (
              <div key={index} className='space-y-4 bg-content2 p-6 rounded-xl'>
                <div className='flex justify-between items-center'>
                  <div className='flex items-center gap-2'>
                    <User className='w-5 h-5 text-primary' />
                    <h3 className='text-lg font-semibold'>
                      Team Member {index + 1}
                    </h3>
                  </div>
                  {members.length > 1 && (
                    <Button
                      color='danger'
                      variant='light'
                      size='sm'
                      onPress={() => removeMember(index)}
                    >
                      Remove
                    </Button>
                  )}
                </div>

                <Input
                  label='Name'
                  value={member.name}
                  onChange={(e) => updateMember(index, 'name', e.target.value)}
                  startContent={<User className='w-4 h-4 text-default-400' />}
                  size='lg'
                  variant='bordered'
                />
                <Input
                  label='Email'
                  type='email'
                  value={member.email}
                  onChange={(e) => updateMember(index, 'email', e.target.value)}
                  startContent={<Mail className='w-4 h-4 text-default-400' />}
                  size='lg'
                  variant='bordered'
                />
                <Input
                  label='Password'
                  type='password'
                  value={member.password}
                  onChange={(e) =>
                    updateMember(index, 'password', e.target.value)
                  }
                  startContent={<Lock className='w-4 h-4 text-default-400' />}
                  size='lg'
                  variant='bordered'
                />
                <Input
                  label='Confirm Password'
                  type='password'
                  value={member.confirmPassword}
                  onChange={(e) =>
                    updateMember(index, 'confirmPassword', e.target.value)
                  }
                  startContent={<Lock className='w-4 h-4 text-default-400' />}
                  size='lg'
                  variant='bordered'
                />
              </div>
            ))}

            {members.length < 4 && (
              <Button
                color='secondary'
                variant='flat'
                onPress={addMember}
                startContent={<UserPlus className='w-4 h-4' />}
                className='w-full'
                size='lg'
              >
                Add Team Member
              </Button>
            )}

            <Button
              color='primary'
              size='lg'
              fullWidth
              onPress={handleRegister}
              isLoading={isLoading}
              endContent={!isLoading && <ArrowRight className='w-4 h-4' />}
            >
              Create Team
            </Button>

            <Divider className='my-4' />

            <div className='text-center text-sm'>
              Already have an account?{' '}
              <Link
                prefetch
                shallow
                href='/login'
                className='text-primary hover:underline font-medium'
              >
                Login here
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
