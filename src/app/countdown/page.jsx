'use client';

import { useState, useEffect } from 'react';
import { Card, CardBody, Button } from '@nextui-org/react';
import { Timer, Calendar, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const EVENT_START_TIME = '2025-03-05T11:00:00+04:00';

export default function CountdownPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const eventTime = new Date(EVENT_START_TIME).getTime();
      const now = new Date().getTime();
      const difference = eventTime - now;

      if (difference <= 0) {
        router.push('/challenges');
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className='min-h-[80vh] flex flex-col items-center justify-center'>
      <Card className='w-full max-w-4xl bg-gradient-to-br from-primary-500/10 via-secondary-500/10 to-danger-500/10'>
        <CardBody className='py-12 text-center space-y-8'>
          <div className='space-y-4'>
            <h1 className='text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-danger bg-clip-text text-transparent'>
              Event Starting Soon
            </h1>
            <p className='text-xl text-default-600'>
              Get ready for an exciting CTF challenge!
            </p>
          </div>

          <div className='flex flex-wrap justify-center gap-6'>
            <div className='flex items-center gap-2 text-primary'>
              <Calendar className='w-5 h-5' />
              <span>March 5, 2025</span>
            </div>
            <div className='flex items-center gap-2 text-primary'>
              <Timer className='w-5 h-5' />
              <span>11:00 AM GMT+4</span>
            </div>
            <div className='flex items-center gap-2 text-primary'>
              <MapPin className='w-5 h-5' />
              <span>Auditorium, BITS Pilani Dubai</span>
            </div>
          </div>

          <div className='grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto'>
            <Card className='bg-default-100'>
              <CardBody className='py-6 text-center'>
                <div className='text-4xl font-bold text-primary'>
                  {String(timeLeft.days).padStart(2, '0')}
                </div>
                <div className='text-small text-default-500'>Days</div>
              </CardBody>
            </Card>
            <Card className='bg-default-100'>
              <CardBody className='py-6 text-center'>
                <div className='text-4xl font-bold text-primary'>
                  {String(timeLeft.hours).padStart(2, '0')}
                </div>
                <div className='text-small text-default-500'>Hours</div>
              </CardBody>
            </Card>
            <Card className='bg-default-100'>
              <CardBody className='py-6 text-center'>
                <div className='text-4xl font-bold text-primary'>
                  {String(timeLeft.minutes).padStart(2, '0')}
                </div>
                <div className='text-small text-default-500'>Minutes</div>
              </CardBody>
            </Card>
            <Card className='bg-default-100'>
              <CardBody className='py-6 text-center'>
                <div className='text-4xl font-bold text-primary'>
                  {String(timeLeft.seconds).padStart(2, '0')}
                </div>
                <div className='text-small text-default-500'>Seconds</div>
              </CardBody>
            </Card>
          </div>

          <div className='space-y-4'>
            <p className='text-default-500'>
              The competition will begin automatically when the countdown ends.
              Make sure you're ready!
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
