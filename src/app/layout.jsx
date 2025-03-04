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
      <body className='antialiased text-foreground bg-background'>
        <Providers>
          <AuthProvider>
            <NotificationProvider>
              <div className='min-h-screen'>
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
