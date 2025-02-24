import { cn, Spinner } from '@nextui-org/react';

export default function LoadingState({
  message = 'Loading...',
  fullHeight = false,
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4',
        fullHeight ? 'absolute inset-0 h-dvh w-dvw' : 'min-h-[200px]'
      )}
    >
      <Spinner size='lg' color='primary' />
      <p className='text-default-500'>{message}</p>
    </div>
  );
}
