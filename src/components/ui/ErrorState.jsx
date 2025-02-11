import { Button } from '@nextui-org/react';
import { AlertTriangle } from 'lucide-react';

export default function ErrorState({
  message = 'Something went wrong',
  onRetry,
}) {
  return (
    <div className='flex flex-col items-center justify-center min-h-[200px] gap-4'>
      <AlertTriangle className='w-12 h-12 text-danger' />
      <p className='text-danger text-center'>{message}</p>
      {onRetry && (
        <Button color='primary' variant='flat' onPress={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
}
