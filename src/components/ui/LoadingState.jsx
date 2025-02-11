import { Spinner } from '@nextui-org/react';

export default function LoadingState({ message = 'Loading...' }) {
  return (
    <div className='flex flex-col items-center justify-center min-h-[200px] gap-4'>
      <Spinner size='lg' color='primary' />
      <p className='text-default-500'>{message}</p>
    </div>
  );
}
