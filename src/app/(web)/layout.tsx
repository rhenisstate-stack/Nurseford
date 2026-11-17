import Navbar from '@/app/(web)/includes/navbar';
import Footer from '@/app/(web)/includes/footer';
import type { Metadata } from 'next';
import ScrollToTopButton from '@/components/common/ScrollToTopButton';
import Whastapp from '@/app/(web)/includes/partials/Whastapp';
import Tawkto from '@/app/(web)/includes/partials/Tawkto';
import { APP_DESCRIPTION, APP_NAME, SEO } from '@/lib/config/config';
import '@/styles/web/rhenis.css';

const resolvedSiteUrl = /^https?:\/\//i.test((SEO.siteUrl || '').trim())
  ? SEO.siteUrl.trim().replace(/\/+$/, '')
  : `https://${(SEO.siteUrl || 'nurseford.com').trim().replace(/\/+$/, '')}`;

export const metadata: Metadata = {
  metadataBase: new URL(resolvedSiteUrl),
  title: {
    default: `${APP_NAME} | RN & LPN Nursing Exam Prep & Exit Q-Bank`,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    siteName: APP_NAME,
    title: `${APP_NAME} | RN & LPN Nursing Exam Prep & Exit Q-Bank`,
    description: APP_DESCRIPTION,
    url: '/',
    images: [
      {
        url: '/logo/logo.png',
        width: 512,
        height: 512,
        alt: APP_NAME,
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: `${APP_NAME} | RN & LPN Nursing Exam Prep & Exit Q-Bank`,
    description: APP_DESCRIPTION,
    images: ['/logo/logo.png'],
  },
  icons: {
    icon: '/logo/logo.png',
    shortcut: '/logo/logo.png',
    apple: '/apple-touch-icon.png',
  },
};

export default function WebLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="nurseford-web rhenis-web flex min-h-screen flex-col"
    >
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
      <ScrollToTopButton />
      <Whastapp />
      <Tawkto />
    </div>
  );
}
