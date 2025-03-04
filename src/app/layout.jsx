import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { Providers } from './providers';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';

export const metadata = {
  title: 'CTF | GDG',
  description: 'Capture The Flag event by GDG',
};

export default function RootLayout({ children }) {
  return (
    <html lang='en' className='dark' suppressHydrationWarning>
      <head>
        <link rel='manifest' href='/manifest.json' />
        <meta name='apple-mobile-web-app-title' content='CTF | GDG' />
        <meta name='application-name' content='CTF | GDG' />
        <meta name='theme-color' content='#000000' />
        <meta name='msapplication-navbutton-color' content='#000000' />
        <meta name='mobile-web-app-capable' content='yes' />
        <meta name='apple-mobile-web-app-status-bar-style' content='black' />
      </head>

      <body className='antialiased text-foreground bg-background'>
        <Providers>
          <AuthProvider>
            <NotificationProvider>
              <div className='min-h-dvh h-full'>
                <Header />
                <main className='container mx-auto p-4 lg:p-8'>{children}</main>
              </div>
            </NotificationProvider>
          </AuthProvider>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
