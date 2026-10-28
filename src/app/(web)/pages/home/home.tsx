import Hero from '@/app/(web)/includes/components/Hero';
import ExamTracks from '@/app/(web)/includes/components/ExamTracks';
import ShopTeaser from '@/app/(web)/includes/components/shop/ShopTeaser';
import StudyKit from '@/app/(web)/includes/components/StudyKit';
import HowItWorks from '@/app/(web)/includes/components/HowItWorks';
import FAQ from '@/app/(web)/includes/components/FAQ';
import ContactUs from '@/app/(web)/includes/components/sections/contact-us';
import ClosingCTA from '@/app/(web)/includes/components/ClosingCTA';

type HomePageProps = {
  data?: unknown;
};

export default function HomePage({ data }: HomePageProps) {
  return (
    <main>
      <Hero />
      <ExamTracks />
      <ShopTeaser />
      <StudyKit />
      <HowItWorks />
      <FAQ />
      <ContactUs />
      <ClosingCTA />
    </main>
  );
}
