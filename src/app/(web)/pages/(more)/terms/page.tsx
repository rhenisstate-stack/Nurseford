'use client';

import Link from 'next/link';
import BrandText from '../../../includes/components/BrandText';

const sections = [
  {
    title: '1. Acceptance of Terms',
    body: 'By accessing and using NurseFord ("the Platform"), you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, please discontinue use of the Platform.',
  },
  {
    title: '2. Use of the Platform',
    body: 'You agree to use the Platform only for lawful purposes and in accordance with these terms. You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account.',
  },
  {
    title: '3. Subscriptions and Payments',
    body: 'Access to premium study materials and Q-Bank features may require a paid subscription. All payments are processed securely, and your subscription renews according to the plan you select. Prices are subject to change with notice.',
  },
  {
    title: '4. Intellectual Property',
    body: 'All content on the Platform, including practice questions, study guides, rationales, and design, is the property of NurseFord and is protected by applicable copyright laws. You may not reproduce, distribute, or resell any content without express written permission.',
  },
  {
    title: '5. Limitation of Liability',
    body: 'The Platform is provided "as is" without warranties of any kind. NurseFord is not liable for any exam outcomes or damages arising from your use of the Platform. Study materials are intended to supplement, not replace, formal nursing education.',
  },
  {
    title: '6. Termination',
    body: 'We reserve the right to suspend or terminate access to the Platform for any violation of these terms, misuse of content, or conduct we determine to be harmful to the Platform or its users.',
  },
  {
    title: '7. Changes to These Terms',
    body: 'We may update these Terms and Conditions from time to time. Continued use of the Platform after changes are posted constitutes acceptance of the revised terms.',
  },
];

export default function TermsPage() {
  return (
    <main>
      <section className="relative overflow-hidden" style={{ backgroundColor: "var(--content-bg)" }}>
        <div className="relative mx-auto max-w-3xl px-5 pt-24 pb-12 md:pt-20 md:pb-16">
          <span className="inline-block font-mono text-xs tracking-widest uppercase text-coral mb-4">
            Legal
          </span>
          <h1 className="font-serif text-4xl md:text-5xl font-semibold leading-tight tracking-tight text-navy mb-4">
            Terms and Conditions<span className="text-coral">.</span>
          </h1>
          <p className="text-navy/60 leading-relaxed">
            Last updated: January 2026. Please read these terms carefully before using{' '}
            <BrandText text="NurseFord" />.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-3xl px-5">
          <div className="space-y-8">
            {sections.map((section) => (
              <div key={section.title}>
                <h2 className="font-serif text-2xl font-semibold text-navy mb-3">{section.title}</h2>
                <p className="text-navy/60 leading-relaxed text-sm"><BrandText text={section.body} /></p>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-2xl border border-black/50 dark:border-border bg-paper-dim p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-xl font-semibold text-navy">Questions?</h2>
              <p className="text-sm text-navy/60 mt-1">
                Contact us and we&apos;ll be happy to clarify any of these terms.
              </p>
            </div>
            <Link
              href="/pages/contact-us"
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-full text-sm font-semibold text-[#0c1929] bg-coral hover:bg-coral-hover transition-colors shrink-0"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

