'use client';

import { Toaster } from 'sonner';
import { NextUIProvider } from '@nextui-org/react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

import { AuthProvider } from '@/contexts/AuthContext';

export function Providers({ children }) {
  return (
    <NextThemesProvider attribute='class' defaultTheme='dark' enableSystem>
      <NextUIProvider>
        <AuthProvider>
          {children}

          <Toaster
            position='bottom-right'
            richColors
            theme='dark'
            duration={3000}
          />
        </AuthProvider>
      </NextUIProvider>
    </NextThemesProvider>
  );
}
