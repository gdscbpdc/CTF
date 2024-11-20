'use client';

import {
  Navbar as NextUINavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link,
  Button,
} from '@nextui-org/react';
import { ThemeSwitcher } from './ThemeSwitcher';
import { getCurrentUser } from '@/lib/auth';

export default function Navbar() {
  const user = getCurrentUser();

  return (
    <NextUINavbar
      maxWidth='full'
      position='sticky'
      className='bg-background/90 backdrop-blur-md'
    >
      <NavbarBrand>
        <Link href='/' className='font-bold text-inherit'>
          GDG CTF
        </Link>
      </NavbarBrand>
      <NavbarContent className='hidden sm:flex gap-4' justify='center'>
        <NavbarItem>
          <Link href='/challenges' color='foreground'>
            Challenges
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link href='/leaderboard' color='foreground'>
            Leaderboard
          </Link>
        </NavbarItem>
      </NavbarContent>
      <NavbarContent justify='end'>
        <NavbarItem>
          <ThemeSwitcher />
        </NavbarItem>
        <NavbarItem>
          {user ? (
            <Button as={Link} color='primary' href='/profile' variant='flat'>
              Profile
            </Button>
          ) : (
            <Button as={Link} color='primary' href='/login' variant='flat'>
              Login
            </Button>
          )}
        </NavbarItem>
      </NavbarContent>
    </NextUINavbar>
  );
}
