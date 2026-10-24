'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { PageContent } from '@/lib/types/PageContent';
import { apiFetch } from '@/lib/api/api/api';

export default function PolicyPage() {
  const [data, setData] = useState<PageContent | null>(null);

  useEffect(() => {
    apiFetch<PageContent>('/NextPolicy')
      .then(setData)
      .catch((err) => console.error('Error fetching policy content:', err));
  }, []);

  return (
    <main>
      <section className="relative overflow-hidden" style={{ backgroundColor: "var(--content-bg)" }}>
        <div className="relative mx-auto max-w-3xl px-5 pt-24 pb-12 md:pt-20 md:pb-16">
          <span className="inline-block font-mono text-xs tracking-widest uppercase text-coral mb-4">
            Legal
          </span>
          <h1 className="font-serif text-4xl md:text-5xl font-semibold leading-tight tracking-tight text-navy mb-4">
            {data?.title || 'Privacy Policy'}<span className="text-coral">.</span>
          </h1>
          <p className="text-navy/60 leading-relaxed">
            Last updated: January 2026. Your privacy matters to us.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-3xl px-5">
          <div className="text-navy/70 leading-relaxed space-y-4">
            <p>
              {data?.content ||
                'We take your privacy seriously. This policy outlines what data we collect, how we use it, and the rights you have over your information.'}
            </p>

            <p>
              By using our services, you agree to the collection and use of information
              in accordance with this policy. We never sell or misuse your data.
            </p>

            <p>
              If you have any questions about this privacy policy, please{' '}
              <Link href="/pages/contact-us" className="text-coral hover:text-coral-hover underline">
                contact us
              </Link>{' '}
              for more information.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
