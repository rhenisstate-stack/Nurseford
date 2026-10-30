'use client';

import { useState } from 'react';
import Link from 'next/link';
import Annex from '@/app/(web)/auth/modals/Annex';
import { APP_NAME } from "@/lib/config/config";

const quickLinks = [
  { href: '/pages/about', label: 'About Us' },
  { href: '/#how-it-works', label: 'How We Help' },
  { href: '/#exams', label: 'Exam Tracks' },
];

const resourceLinks = [
  { href: '/pages/resources', label: 'Resources' },
  { href: '/pages/contact-us', label: 'Contact Us' },
  { href: '/pages/terms', label: 'Terms of Service' },
  { href: '/pages/privacy-policy', label: 'Privacy Policy' },
];

export default function Footer() {
  const [annexOpen, setAnnexOpen] = useState(false);

  return (
    <>
      <footer className="bg-paper-dim text-navy/60 border-t border-border">
        <div className="mx-auto max-w-6xl px-5 py-14 md:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 md:gap-8">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-4 group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo/logo.webp"
                  alt="NurseFord"
                  className="w-7 h-7 shrink-0 object-contain"
                />
                <span className="font-serif text-lg font-semibold text-sage">
                  NurseFord
                </span>
              </Link>
              <p className="text-sm leading-relaxed max-w-xs">
                Nursing exam-prep built by nurses, for nurses. Study smarter, pass
                faster.
              </p>
              <p className="text-sm leading-relaxed max-w-xs mt-3">
                We are always there for You !
              </p>
            </div>

            <div>
              <h4 className="font-mono text-xs tracking-widest uppercase text-navy/40 mb-4">
                Quick Links
              </h4>
              <ul className="space-y-2.5">
                {quickLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm hover:text-navy transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <button
                    type="button"
                    onClick={() => setAnnexOpen(true)}
                    className="text-sm hover:text-navy transition-colors"
                  >
                    Powered by {APP_NAME} Team
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-mono text-xs tracking-widest uppercase text-navy/40 mb-4">
                Resources &amp; Legal
              </h4>
              <ul className="space-y-2.5">
                {resourceLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm hover:text-navy transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-mono text-xs tracking-widest uppercase text-navy/40 mb-4">
                Contact
              </h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <a
                    href="tel:+18702596083"
                    className="hover:text-navy transition-colors"
                  >
                    +1 (870) 259-6083
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:support@nurseford.com"
                    className="hover:text-navy transition-colors break-words"
                  >
                    support@nurseford.com
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>

      <Annex isOpen={annexOpen} onClose={() => setAnnexOpen(false)} />
    </>
  );
}