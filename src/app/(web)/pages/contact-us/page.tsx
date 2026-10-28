'use client';

import { useEffect, useState } from 'react';
import type { PageContent } from '@/lib/types/PageContent';
import { apiFetch } from '@/lib/api/api/api';

const contactChannels = [
  {
    label: 'Email Us',
    value: 'support@rhenisnursing.com',
    href: 'mailto:support@rhenisnursing.com',
  },
  {
    label: 'Phone',
    value: '+1 (870) 259-6083',
    href: 'tel:+18702596083',
  },
  {
    label: 'Response Time',
    value: 'Within 24 hours',
  },
];

export default function ContactPage() {
  const [data, setData] = useState<PageContent | null>(null);

  useEffect(() => {
    apiFetch<PageContent>('/NextContact')
      .then(setData)
      .catch((err) => console.error('Error fetching contact content:', err));
  }, []);

  return (
    <main>
      <section className="relative overflow-hidden" style={{ backgroundColor: "var(--content-bg)" }}>
        <div className="relative mx-auto max-w-6xl px-5 pt-24 pb-12 md:pt-20 md:pb-16">
          <div className="max-w-3xl">
            <span className="inline-block font-mono text-xs tracking-widest uppercase text-coral mb-4">
              Contact
            </span>
            <h1 className="font-serif text-4xl md:text-5xl font-semibold leading-tight tracking-tight text-navy mb-4">
              {data?.title || 'Contact Us'}<span className="text-coral">.</span>
            </h1>
            <p className="text-navy/60 leading-relaxed">
              {data?.content ||
                'We’re here to help. Whether you have a question about features, pricing, or anything else — our team is ready to answer all your questions.'}
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-6xl px-5">
          <div className="grid md:grid-cols-3 gap-5">
            {contactChannels.map((channel) => {
              const inner = (
                <>
                  <div className="font-serif text-xl font-semibold text-navy mb-2">{channel.label}</div>
                  <div className="text-sm text-navy/60">{channel.value}</div>
                </>
              );
              return channel.href ? (
                <a
                  key={channel.label}
                  href={channel.href}
                  className="relative rounded-2xl border border-black/50 dark:border-border bg-paper p-7 flex flex-col overflow-hidden hover:bg-paper-dim transition-colors"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-coral" />
                  {inner}
                </a>
              ) : (
                <div
                  key={channel.label}
                  className="relative rounded-2xl border border-black/50 dark:border-border bg-paper p-7 flex flex-col overflow-hidden"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal" />
                  {inner}
                </div>
              );
            })}
          </div>

          <div className="mt-10 rounded-2xl border border-black/50 dark:border-border bg-paper-dim p-8">
            <span className="inline-block font-mono text-xs tracking-widest uppercase text-sage mb-3">
              Send a Message
            </span>
            <h2 className="font-serif text-2xl font-semibold text-navy mb-6">
              We&apos;d Love to Hear From You
            </h2>
            <form
              className="space-y-4"
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="grid sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Your name"
                  className="w-full rounded-xl border border-border bg-paper px-4 py-3 text-sm text-navy placeholder:text-navy/40 outline-none focus:border-coral transition-colors"
                />
                <input
                  type="email"
                  placeholder="Your email"
                  className="w-full rounded-xl border border-border bg-paper px-4 py-3 text-sm text-navy placeholder:text-navy/40 outline-none focus:border-coral transition-colors"
                />
              </div>
              <textarea
                placeholder="How can we help?"
                rows={5}
                className="w-full rounded-xl border border-border bg-paper px-4 py-3 text-sm text-navy placeholder:text-navy/40 outline-none focus:border-coral transition-colors"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center px-7 py-3 rounded-full text-sm font-semibold text-[#0c1929] bg-coral hover:bg-coral-hover transition-colors"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
