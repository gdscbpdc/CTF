'use client';

import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
  Button,
  Avatar,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from '@nextui-org/react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Trophy, Flag, Users, LogOut, User, Home, Shield } from 'lucide-react';

import { logoutUser } from '@/lib/auth';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  {
    label: 'Home',
    href: '/',
    icon: Home,
  },
  {
    label: 'Challenges',
    href: '/challenges',
    icon: Flag,
    requiresTeam: true,
  },
  {
    label: 'Leaderboard',
    href: '/leaderboard',
    icon: Trophy,
  },
  {
    label: 'Team',
    href: '/team',
    icon: Users,
    requiresTeam: true,
  },
];

export default function Header() {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isAdminPage = pathname.startsWith('/admin');
  const isAdminLoggedIn = !!Cookies.get('admin-secret');

  const handleLogout = async () => {
    await logoutUser();
    window.location.href = '/';
  };

  const handleAdminLogout = () => {
    Cookies.remove('admin-secret');
    window.location.href = '/';
  };

  if (loading) {
    return null;
  }

  return (
    <Navbar
      isBordered
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
      className='mb-6'
      maxWidth='full'
    >
      <NavbarContent className='sm:hidden pr-3' justify='start'>
        <NavbarBrand>
          <p className='font-bold text-inherit'>
            {isAdminPage ? 'GDG CTF Admin' : 'GDG CTF'}
          </p>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className='hidden sm:flex' justify='start'>
        <NavbarBrand>
          <p className='font-bold text-inherit'>
            {isAdminPage ? 'GDG CTF Admin' : 'GDG CTF'}
          </p>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className='hidden sm:flex space-x-5' justify='center'>
        {!isAdminPage &&
          navItems.map((item) => {
            if (item.requiresTeam && !user?.team) return null;
            const Icon = item.icon;
            return (
              <NavbarItem
                key={item.href}
                isActive={pathname === item.href}
                className='hidden sm:flex'
              >
                <Link
                  className={`flex items-center gap-2 ${
                    pathname === item.href
                      ? 'text-primary'
                      : 'text-foreground-500'
                  }`}
                  href={item.href}
                >
                  <Icon className='w-4 h-4' />
                  {item.label}
                </Link>
              </NavbarItem>
            );
          })}
      </NavbarContent>

      <NavbarContent justify='end'>
        {/* <NavbarItem>
          <ThemeToggle />
        </NavbarItem> */}

        {isAdminPage ? (
          pathname === '/admin/login' ? (
            <NavbarItem>
              <Button as={Link} href='/' color='primary'>
                CTF Home
              </Button>
            </NavbarItem>
          ) : (
            <NavbarItem>
              <Button
                color='danger'
                variant='flat'
                startContent={<LogOut className='w-4 h-4' />}
                onPress={handleAdminLogout}
              >
                Admin Logout
              </Button>
            </NavbarItem>
          )
        ) : user ? (
          <NavbarItem>
            <Dropdown placement='bottom-end'>
              <DropdownTrigger>
                <Avatar
                  as='button'
                  name={user.name[0]}
                  className='transition-transform'
                />
              </DropdownTrigger>
              <DropdownMenu aria-label='Profile Actions' variant='flat'>
                <DropdownItem
                  key='profile'
                  startContent={<User className='w-4 h-4' />}
                >
                  <Link href='/profile'>Profile</Link>
                </DropdownItem>
                {isAdminLoggedIn && (
                  <DropdownItem
                    key='admin'
                    startContent={<Shield className='w-4 h-4' />}
                  >
                    <Link href='/admin'>Admin Panel</Link>
                  </DropdownItem>
                )}
                <DropdownItem
                  key='logout'
                  className='text-danger'
                  color='danger'
                  startContent={<LogOut className='w-4 h-4' />}
                  onPress={handleLogout}
                >
                  Log Out
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </NavbarItem>
        ) : (
          <>
            <NavbarItem className='hidden sm:flex'>
              <Button as={Link} href='/login' variant='flat'>
                Login
              </Button>
            </NavbarItem>
            <NavbarItem className='hidden sm:flex'>
              <Button as={Link} href='/register' color='primary'>
                Register
              </Button>
            </NavbarItem>
          </>
        )}
      </NavbarContent>

      <NavbarContent className='sm:hidden' justify='end'>
        <NavbarMenuToggle />
      </NavbarContent>

      <NavbarMenu>
        {!isAdminPage &&
          navItems.map((item) => {
            if (item.requiresTeam && !user?.team) return null;
            const Icon = item.icon;
            return (
              <NavbarMenuItem key={item.href}>
                <Link
                  className={`flex items-center gap-2 w-full ${
                    pathname === item.href
                      ? 'text-primary'
                      : 'text-foreground-500'
                  }`}
                  href={item.href}
                >
                  <Icon className='w-4 h-4' />
                  {item.label}
                </Link>
              </NavbarMenuItem>
            );
          })}

        {!user && !isAdminPage && (
          <>
            <NavbarMenuItem>
              <Button fullWidth as={Link} href='/login' variant='flat'>
                Login
              </Button>
            </NavbarMenuItem>

            <NavbarMenuItem>
              <Button fullWidth as={Link} href='/register' color='primary'>
                Register
              </Button>
            </NavbarMenuItem>
          </>
        )}
      </NavbarMenu>
    </Navbar>
  );
}
