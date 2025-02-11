'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  Card,
  CardBody,
  Input,
  Button,
  Chip,
  Divider,
  CardHeader,
} from '@nextui-org/react';
import { useAuth } from '@/contexts/AuthContext';
import { submitFlag } from '@/lib/challenges';
import { db } from '@/services/firebase.config';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import ReactMarkdown from 'react-markdown';
import {
  Flag,
  Award,
  Paperclip,
  HelpCircle,
  FileText,
  Send,
  CheckCircle,
  XCircle,
  History,
} from 'lucide-react';

export default function ChallengeDetails({ challenge }) {
  const { user } = useAuth();
  const [flag, setFlag] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attempts, setAttempts] = useState([]);
  const [isLoadingAttempts, setIsLoadingAttempts] = useState(true);

  const loadAttempts = useCallback(async () => {
    if (!user?.id) return;

    try {
      const q = query(
        collection(db, 'solves'),
        where('userId', '==', user.id),
        where('challengeId', '==', challenge.id),
        orderBy('timestamp', 'desc')
      );
      const snapshot = await getDocs(q);
      const attemptsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate(),
      }));
      setAttempts(attemptsData);
    } catch (error) {
      console.error('Error loading attempts:', error);
    } finally {
      setIsLoadingAttempts(false);
    }
  }, [user?.id, challenge.id]);

  useEffect(() => {
    loadAttempts();
  }, [loadAttempts]);

  const handleSubmit = useCallback(async () => {
    if (!flag.trim()) return;

    try {
      setError('');
      setSuccess('');
      setIsSubmitting(true);

      if (!user?.id || !user?.team?.id) {
        setError('You must be logged in and part of a team to submit flags');
        return;
      }

      const result = await submitFlag(
        user.id,
        user.team.id,
        challenge.id,
        flag.trim()
      );

      if (result.success) {
        setSuccess('Correct! Points awarded!');
        setFlag('');
        loadAttempts();
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error('Error submitting flag:', error);
      setError('Error submitting flag. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [challenge.id, flag, user?.id, user?.team?.id, loadAttempts]);

  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === 'Enter' && !isSubmitting && flag.trim()) {
        handleSubmit();
      }
    },
    [handleSubmit, isSubmitting, flag]
  );

  const isSolved = user?.team?.solvedChallenges?.includes(challenge.id);

  return (
    <div className='max-w-4xl mx-auto space-y-6'>
      <Card className='bg-gradient-to-r from-primary-500/10 to-secondary-500/10 border-none'>
        <CardBody className='py-8'>
          <div className='flex flex-col items-center text-center gap-4'>
            <h1 className='text-3xl font-bold'>{challenge.title}</h1>
            <p className='text-default-600 max-w-lg'>
              {challenge.shortDescription}
            </p>
            <div className='flex gap-3'>
              <Chip
                color='default'
                variant='flat'
                startContent={<Flag className='w-3 h-3' />}
              >
                {challenge.category}
              </Chip>
              <Chip
                color={
                  challenge.difficulty === 'Easy'
                    ? 'success'
                    : challenge.difficulty === 'Medium'
                    ? 'warning'
                    : 'danger'
                }
                variant='flat'
                startContent={<Award className='w-3 h-3' />}
              >
                {challenge.difficulty}
              </Chip>
              <Chip
                color='secondary'
                variant='flat'
                startContent={<Award className='w-3 h-3' />}
              >
                {challenge.points} pts
              </Chip>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader className='flex gap-2'>
          <FileText className='w-5 h-5 text-primary' />
          <h2 className='text-xl font-semibold'>Description</h2>
        </CardHeader>
        <Divider />
        <CardBody>
          <div className='prose dark:prose-invert max-w-none'>
            <ReactMarkdown>{challenge.description}</ReactMarkdown>
          </div>
        </CardBody>
      </Card>

      {challenge.prerequisites && (
        <Card>
          <CardHeader className='flex gap-2'>
            <Award className='w-5 h-5 text-primary' />
            <h2 className='text-xl font-semibold'>Prerequisites</h2>
          </CardHeader>
          <Divider />
          <CardBody>
            <ul className='list-disc list-inside space-y-2'>
              {challenge.prerequisites.map((prereq, index) => (
                <li key={index} className='text-default-600'>
                  {prereq}
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      )}

      {(challenge.hint || (challenge.hints && challenge.hints.length > 0)) && (
        <Card>
          <CardHeader className='flex gap-2'>
            <HelpCircle className='w-5 h-5 text-primary' />
            <h2 className='text-xl font-semibold'>Hints</h2>
          </CardHeader>
          <Divider />
          <CardBody>
            {challenge.hint && (
              <p className='text-default-600 mb-4'>{challenge.hint}</p>
            )}
            {challenge.hints && (
              <ul className='list-disc list-inside space-y-2'>
                {challenge.hints.map((hint, index) => (
                  <li key={index} className='text-default-600'>
                    {hint}
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      )}

      {challenge.attachments?.length > 0 && (
        <Card>
          <CardHeader className='flex gap-2'>
            <Paperclip className='w-5 h-5 text-primary' />
            <h2 className='text-xl font-semibold'>Attachments</h2>
          </CardHeader>
          <Divider />
          <CardBody>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {challenge.attachments.map((attachment, index) => (
                <Button
                  key={index}
                  as='a'
                  href={attachment}
                  target='_blank'
                  rel='noopener noreferrer'
                  variant='flat'
                  className='justify-start'
                  startContent={<Paperclip className='w-4 h-4' />}
                >
                  {attachment.split('/').pop()}
                </Button>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      <Card className={isSolved ? 'bg-success/10' : ''}>
        <CardHeader className='flex gap-2'>
          <Flag className='w-5 h-5 text-primary' />
          <h2 className='text-xl font-semibold'>Submit Flag</h2>
        </CardHeader>
        <Divider />
        <CardBody>
          {isSolved ? (
            <div className='flex items-center gap-2 text-success'>
              <CheckCircle className='w-5 h-5' />
              <p className='font-medium'>Challenge completed! Well done!</p>
            </div>
          ) : (
            <div className='space-y-4'>
              <div className='flex gap-2'>
                <Input
                  value={flag}
                  onChange={(e) => setFlag(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder='GDG{flag}'
                  disabled={isSubmitting}
                  size='lg'
                  variant='bordered'
                  className='flex-1'
                />
                <Button
                  color='primary'
                  onPress={handleSubmit}
                  isLoading={isSubmitting}
                  isDisabled={!flag.trim()}
                  size='lg'
                  endContent={!isSubmitting && <Send className='w-4 h-4' />}
                >
                  Submit
                </Button>
              </div>
              {error && (
                <div className='bg-danger-50/10 text-danger p-3 rounded-lg'>
                  {error}
                </div>
              )}
              {success && (
                <div className='bg-success-50/10 text-success p-3 rounded-lg flex items-center gap-2'>
                  <CheckCircle className='w-4 h-4' />
                  {success}
                </div>
              )}
            </div>
          )}
        </CardBody>
      </Card>

      {user && attempts.length > 0 && (
        <Card>
          <CardHeader className='flex gap-2'>
            <History className='w-5 h-5 text-primary' />
            <h2 className='text-xl font-semibold'>Attempt History</h2>
          </CardHeader>
          <Divider />
          <CardBody>
            <div className='space-y-4'>
              {attempts.map((attempt) => (
                <div
                  key={attempt.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    attempt.isCorrect ? 'bg-success-50/10' : 'bg-danger-50/10'
                  }`}
                >
                  <div className='flex items-center gap-2'>
                    {attempt.isCorrect ? (
                      <CheckCircle className='w-4 h-4 text-success' />
                    ) : (
                      <XCircle className='w-4 h-4 text-danger' />
                    )}
                    <span
                      className={
                        attempt.isCorrect ? 'text-success' : 'text-danger'
                      }
                    >
                      {attempt.isCorrect ? 'Correct' : 'Incorrect'} attempt
                    </span>
                  </div>
                  <span className='text-small text-default-500'>
                    {attempt.timestamp?.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {challenge.documentation && (
        <Card>
          <CardHeader className='flex gap-2'>
            <FileText className='w-5 h-5 text-primary' />
            <h2 className='text-xl font-semibold'>Documentation</h2>
          </CardHeader>
          <Divider />
          <CardBody>
            <Button
              as='a'
              href={challenge.documentation}
              target='_blank'
              rel='noopener noreferrer'
              variant='flat'
              color='primary'
              className='w-full justify-start'
              startContent={<FileText className='w-4 h-4' />}
            >
              View Documentation
            </Button>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
