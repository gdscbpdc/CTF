import Link from 'next/link';

export default function Footer() {
  return (
    <footer className='bg-default-100 py-6 mt-8'>
      <div className='container mx-auto px-4 flex flex-col md:flex-row justify-between items-center'>
        <div className='text-center md:text-left'>
          <h3 className='font-bold text-lg'>GDG UAE CTF Platform</h3>
          <p className='text-default-500 text-sm'>
            Capture The Flag Challenge by Google Developers Group UAE
          </p>
        </div>
        <div className='flex space-x-4 mt-4 md:mt-0'>
          <Link
            href='/about'
            className='text-default-600 hover:text-primary transition-colors'
          >
            About
          </Link>
          <Link
            href='/rules'
            className='text-default-600 hover:text-primary transition-colors'
          >
            Rules
          </Link>
          <Link
            href='/contact'
            className='text-default-600 hover:text-primary transition-colors'
          >
            Contact
          </Link>
        </div>
        <div className='text-default-500 text-sm mt-4 md:mt-0'>
          © {new Date().getFullYear()} GDG UAE. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
