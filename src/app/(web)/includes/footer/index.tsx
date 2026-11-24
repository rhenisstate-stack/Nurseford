'use client';

import Link from 'next/link';
import { APP_NAME } from "@/lib/config/config";
import { Phone, Mail, Compass, Headset } from 'lucide-react';

const quickLinks = [
  { href: '/pages/about', label: 'About Us' },
  { href: '/subjects', label: 'All Subjects & Exams' },
];

const legalLinks = [
  { href: '/pages/terms', label: 'Terms of Service' },
  { href: '/pages/privacy-policy', label: 'Privacy Policy' },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-50 dark:bg-[#0c1524] text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-white/10 transition-colors">
        {/* Main Footer Content */}
        <div className="mx-auto w-full max-w-[1500px] px-4 sm:px-6 md:px-10 lg:px-14 xl:px-18 py-8 md:py-10 pb-16 md:pb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-10">
            {/* Col 1: Brand */}
            <div>
              <Link href="/" className="inline-flex items-center gap-2.5 mb-4 group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo/logo.webp"
                  alt="Nurseford"
                  className="w-8 h-8 shrink-0 object-contain group-hover:scale-105 transition-transform"
                />
                <span className="font-serif text-2xl font-bold tracking-tight text-navy dark:text-white">
                  Nurseford
                </span>
              </Link>

              <p className="text-xs sm:text-sm leading-relaxed max-w-xs mb-3 text-navy/70 dark:text-white/70">
                Nursing exam-prep built by nurses, for nurses. Study smarter, pass faster.
              </p>

              {/* Status beacon */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-semibold mb-3">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>All Q-Bank Systems Live</span>
              </div>

              <p className="text-xs text-navy/60 dark:text-white/60">
                We are always there for You !
              </p>
            </div>

            {/* Col 2: EXPLORE & LEGAL */}
            <div>
              <h4 className="font-mono text-xs tracking-widest uppercase text-navy dark:text-white font-bold mb-4 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[#ff6b35]" />
                <span>Explore &amp; Legal</span>
              </h4>
              <ul className="space-y-2.5 text-xs sm:text-sm">
                {quickLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="hover:text-navy dark:hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
                {legalLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="hover:text-navy dark:hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3: CONTACT */}
            <div>
              <h4 className="font-mono text-xs tracking-widest uppercase text-navy dark:text-white font-bold mb-4 flex items-center gap-1.5">
                <Headset className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Contact</span>
              </h4>
              <ul className="space-y-2.5 text-xs sm:text-sm text-navy/70 dark:text-white/70">
                <li>
                  <a
                    href="tel:+18702596083"
                    className="inline-flex items-center gap-2 hover:text-navy dark:hover:text-white transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-teal-600 dark:text-[#2FD9C4]" />
                    <span>+1 (870) 259-6083</span>
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:support@nurseford.com"
                    className="inline-flex items-center gap-2 hover:text-navy dark:hover:text-white transition-colors break-words"
                  >
                    <Mail className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>support@nurseford.com</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright & Disclaimer */}
          <div className="mt-12 pt-6 border-t border-slate-200 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-3 text-[11px] text-navy/50 dark:text-white/50 text-center md:text-left">
            <p>
              &copy; {currentYear} {APP_NAME}. All rights reserved.
            </p>
            <p className="max-w-md">
              Nurseford is an independent test-preparation resource and is not affiliated with, endorsed by, or sponsored by NCSBN, ATI, Elsevier, or Examplify.
            </p>
          </div>
        </div>
      </footer>
  );
}
