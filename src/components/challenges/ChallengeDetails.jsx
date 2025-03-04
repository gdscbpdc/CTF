'use client';

import {
  Card,
  CardBody,
  Input,
  Button,
  Chip,
  Divider,
  CardHeader,
} from '@nextui-org/react';
import {
  Flag,
  Award,
  HelpCircle,
  FileText,
  Send,
  CheckCircle,
  XCircle,
  History,
  Eye,
  EyeOff,
  Link,
  FileDown,
  FileIcon,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useState, useCallback, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { submitFlag } from '@/lib/challenges';
import { toast } from 'sonner';

import { db } from '@/services/firebase.config';

export default function ChallengeDetails({ challenge }) {
  const { user } = useAuth();
  const [flag, setFlag] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attempts, setAttempts] = useState([]);
  const [isLoadingAttempts, setIsLoadingAttempts] = useState(true);
  const [hintVisible, setHintVisible] = useState({});

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
        toast.error('Authentication required', {
          description:
            'You must be logged in and part of a team to submit flags',
        });
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
        toast.success('Challenge completed!', {
          description: `Congratulations! You've earned ${challenge.points} points!`,
        });
      } else {
        setError(result.message);
        toast.error('Incorrect flag', {
          description: result.message,
        });
      }
    } catch (error) {
      console.error('Error submitting flag:', error);
      setError('Error submitting flag. Please try again.');
      toast.error('Submission error', {
        description: 'Failed to submit flag. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [
    challenge.id,
    flag,
    user?.id,
    user?.team?.id,
    loadAttempts,
    challenge.points,
  ]);

  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === 'Enter' && !isSubmitting && flag.trim()) {
        handleSubmit();
      }
    },
    [handleSubmit, isSubmitting, flag]
  );

  const isSolved = user?.team?.solvedChallenges?.includes(challenge.id);

  const toggleHintVisibility = (index) => {
    setHintVisible((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  console.log(challenge);

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

      {challenge.prerequisites && challenge.prerequisites.length > 0 && (
        <Card>
          <CardHeader className='flex gap-2'>
            <Award className='w-5 h-5 text-primary' />
            <h2 className='text-xl font-semibold'>Prerequisites</h2>
          </CardHeader>
          <Divider />
          <CardBody>
            <div className='space-y-2'>
              {challenge.prerequisites.map((prereq, index) => (
                <div key={index} className='text-default-600'>
                  {prereq}
                </div>
              ))}
            </div>
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
              <div className='flex items-center justify-between'>
                <p className='text-default-600 mb-4'>
                  {hintVisible.hint ? challenge.hint : '*****'}
                </p>
                <button onClick={() => toggleHintVisibility('hint')}>
                  {hintVisible.hint ? (
                    <EyeOff className='w-5 h-5' />
                  ) : (
                    <Eye className='w-5 h-5' />
                  )}
                </button>
              </div>
            )}
            {challenge.hints && (
              <div className='space-y-2'>
                {challenge.hints.map((hint, index) => (
                  <div
                    key={index}
                    className='flex items-center justify-between text-default-600'
                  >
                    {hintVisible[index] ? hint : '*****'}
                    <button onClick={() => toggleHintVisibility(index)}>
                      {hintVisible[index] ? (
                        <EyeOff className='w-5 h-5' />
                      ) : (
                        <Eye className='w-5 h-5' />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {challenge.links && challenge.links.length > 0 && (
        <Card>
          <CardHeader className='flex gap-2'>
            <Link className='w-5 h-5 text-primary' />
            <h2 className='text-xl font-semibold'>Useful Links</h2>
          </CardHeader>
          <Divider />
          <CardBody>
            <div className='space-y-2'>
              {challenge.links.split('\n').map((link, index) => {
                const trimmedLink = link.trim();
                if (!trimmedLink) return null;
                return (
                  <div key={index} className='text-primary'>
                    <a
                      href={trimmedLink}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='hover:underline'
                    >
                      {trimmedLink}
                    </a>
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>
      )}

      {challenge.attachments && challenge.attachments.length > 0 && (
        <Card>
          <CardHeader className='flex gap-2'>
            <FileDown className='w-5 h-5 text-primary' />
            <h2 className='text-xl font-semibold'>Attachments</h2>
          </CardHeader>
          <Divider />
          <CardBody>
            <div className='space-y-2'>
              {challenge.attachments.map((attachment, index) => (
                <a
                  key={index}
                  href={attachment.url}
                  download={attachment.name}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-primary hover:underline flex items-center gap-2'
                >
                  <FileIcon className='w-4 h-4' />
                  {attachment.name}
                </a>
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

      {challenge.documentation && challenge.documentation.length > 0 && (
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
