import Navbar from '@/app/(web)/includes/navbar';
import Footer from '@/app/(web)/includes/footer';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import ScrollToTopButton from '@/components/common/ScrollToTopButton';
import { APP_NAME } from '@/lib/config/config';
import '@/styles/web/rhenis.css';

const fraunces = localFont({
  src: './fonts/Fraunces-Variable.ttf.woff2',
  variable: '--font-fraunces',
  display: 'swap',
});

const ibmPlexSans = localFont({
  src: './fonts/IBM-Plex-Sans-Variable.ttf.woff2',
  variable: '--font-ibm-plex-sans',
  display: 'swap',
});

const ibmPlexMono = localFont({
  src: [
    { path: './fonts/IBM-Plex-Mono-400.woff2', weight: '400' },
    { path: './fonts/IBM-Plex-Mono-500.woff2', weight: '500' },
  ],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: APP_NAME,
  description: `${APP_NAME} Systems`,
  icons: {
    icon: '/logo/logo.png',
    shortcut: '/logo/logo.png',
    apple: '/apple-touch-icon.png',
  },
};

export default function WebLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${fraunces.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable} rhenis-web flex min-h-screen flex-col`}
    >
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
      <ScrollToTopButton />
    </div>
  );
}
