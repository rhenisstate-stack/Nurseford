import type { Metadata } from 'next';
import ScrollToTopButton from '@/components/common/ScrollToTopButton';
import { APP_NAME } from '@/lib/config/config';

export const metadata: Metadata = {
  title: APP_NAME,
  description: `${APP_NAME} Systems`,
  robots: {
    index: false,
    follow: false,
  },
};

export default function WebLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main
        data-exam-page="true"
        style={{ fontFamily: "'Calibre', 'Calibri', Candara, 'Segoe UI', Arial, sans-serif" }}
        className="flex-grow mt-0 px-0 sm:px-0 lg:px-0"
      >
        {children}
      </main>
      <ScrollToTopButton />
    </>
  );
}
