'use client';

import { useState, useEffect } from 'react';
import { Card, CardBody } from '@nextui-org/react';
import { EVENT_END_TIME, isEventEnded } from '@/lib/constants';

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isActive, setIsActive] = useState(false);
  const [colorState, setColorState] = useState('secondary');

  useEffect(() => {
    const startTime = new Date('2025-03-05T07:30:00Z');
    const endTime = EVENT_END_TIME;

    const updateTimer = () => {
      const now = new Date();

      if (now < startTime) {
        const diff = startTime - now;
        setTimeLeft(calculateTimeLeft(diff));
        setIsActive(false);
        setColorState('secondary');
      } else if (now >= startTime && now < endTime) {
        const diff = endTime - now;
        setTimeLeft(calculateTimeLeft(diff));
        setIsActive(true);

        const totalDuration = endTime - startTime;
        const timeElapsed = now - startTime;
        const progressPercentage = (timeElapsed / totalDuration) * 100;

        if (progressPercentage < 50) {
          setColorState('success');
        } else if (progressPercentage < 75) {
          setColorState('warning');
        } else {
          setColorState('danger');
        }
      } else {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        setIsActive(false);
        setColorState('secondary');
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, []);

  const calculateTimeLeft = (diff) => {
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return { hours, minutes, seconds };
  };

  if (isEventEnded()) {
    return null;
  }

  const getColorClasses = () => {
    const colorMap = {
      secondary: {
        shadow: 'shadow-secondary/50',
        gradient:
          'before:from-secondary/20 before:via-secondary/10 before:to-secondary/20',
        text: 'text-secondary',
      },
      success: {
        shadow: 'shadow-success/50',
        gradient:
          'before:from-success/20 before:via-success/10 before:to-success/20',
        text: 'text-success',
      },
      warning: {
        shadow: 'shadow-warning/50',
        gradient:
          'before:from-warning/20 before:via-warning/10 before:to-warning/20',
        text: 'text-warning',
      },
      danger: {
        shadow: 'shadow-danger/50',
        gradient:
          'before:from-danger/20 before:via-danger/10 before:to-danger/20',
        text: 'text-danger',
      },
    };

    return colorMap[colorState];
  };

  const colors = getColorClasses();

  return (
    <Card
      className={`
        relative 
        overflow-hidden
        ${colors.shadow}
        shadow-md
        hover:scale-[1.02] 
        transition-transform 
        duration-300
        before:content-[''] 
        before:absolute 
        before:inset-0 
        before:bg-gradient-to-r 
        ${colors.gradient}
        before:animate-gradient
      `}
    >
      <CardBody className='flex flex-row items-center justify-center gap-8 py-6 relative z-10'>
        <div className='text-center'>
          <p
            className={`
            text-lg font-semibold mb-2
            ${colors.text}
            ${isActive && colorState === 'danger' ? 'animate-pulse' : ''}
          `}
          >
            {!isActive ? 'CTF Starts In:' : ' CTF Ends In:'}
          </p>
          <div className='flex gap-4 items-start justify-center'>
            <TimeUnit
              value={timeLeft.hours}
              label='HRS'
              colorState={colorState}
            />
            <span className={`text-3xl font-bold ${colors.text}`}>:</span>
            <TimeUnit
              value={timeLeft.minutes}
              label='MIN'
              colorState={colorState}
            />
            <span className={`text-3xl font-bold ${colors.text}`}>:</span>
            <TimeUnit
              value={timeLeft.seconds}
              label='SEC'
              colorState={colorState}
            />
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

const TimeUnit = ({ value, label, colorState }) => (
  <div className='flex flex-col items-center'>
    <div
      className={`
      text-4xl font-bold font-mono
      bg-gradient-to-b from-foreground to-foreground/50
      bg-clip-text text-transparent
      animate-shimmer
      ${colorState === 'danger' ? 'animate-bounce' : ''}
    `}
    >
      {String(value).padStart(2, '0')}
    </div>
    <div className='text-xs text-default-500 mt-1'>{label}</div>
  </div>
);
