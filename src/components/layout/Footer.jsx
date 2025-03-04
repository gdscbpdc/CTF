import Image from 'next/image';
import { Divider } from '@nextui-org/react';

export default function Footer() {
  return (
    <>
      <Divider />
      <footer className='py-6 md:py-12 container mx-auto px-4 grid place-items-center'>
        <Image
          priority
          src='/on_campus.png'
          alt='Logo'
          width={600}
          height={100}
          className='h-12 md:h-16 w-auto'
        />
      </footer>
    </>
  );
}
