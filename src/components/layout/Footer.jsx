import Link from 'next/link';
import { Divider } from '@nextui-org/react';

export default function Footer() {
  return (
    <>
      <Divider />
      <footer className='py-6 md:py-12'>
        <div className='container mx-auto px-4 flex flex-col md:flex-row justify-between items-center'>
          <div className='text-center md:text-left'>
            <h3 className='font-bold text-lg'>GDG UAE CTF Platform</h3>
            <p className='text-default-500 text-sm'>
              Capture The Flag Challenge by Google Developers Group UAE
            </p>
          </div>

          <div className='text-default-500 text-sm mt-4 md:mt-0'>
            © {new Date().getFullYear()} GDG UAE. All rights reserved.
          </div>
        </div>
      </footer>
    </>
  );
}
