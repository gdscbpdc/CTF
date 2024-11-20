import './globals.css';
import { Providers } from './providers';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export const metadata = {
  title: 'CTF | GDG',
  description: 'Capture The Flag event by GDG',
};

export default function RootLayout({ children }) {
  return (
    <html
      lang='en'
      className='dark bg-background text-foreground'
      suppressHydrationWarning
    >
      <body className='antialiased'>
        <Providers>
          <div className='flex flex-col min-h-dvh'>
            <Navbar />
            <main className='flex-grow container mx-auto px-4 py-8'>
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
