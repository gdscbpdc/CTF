'use client';

import { NextUIProvider } from '@nextui-org/react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { AuthProvider } from '@/contexts/AuthContext';

export function Providers({ children }) {
  return (
    <NextThemesProvider attribute='class' defaultTheme='system' enableSystem>
      <NextUIProvider>
        <AuthProvider>{children}</AuthProvider>
      </NextUIProvider>
    </NextThemesProvider>
  );
}
