import './globals.css';
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
          <Header />

          <main className='flex-grow container mx-auto px-4 py-4 min-h-[calc(100vh-4rem)]'>
            {children}
          </main>

          <Footer />
        </Providers>
      </body>
    </html>
  );
}
