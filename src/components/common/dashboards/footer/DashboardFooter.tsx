"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useFlexPageClasp } from "@/lib/contexts/panel/layout/utils/FlexPageClasp";
import { APP_NAME } from "@/lib/config/config";
import { Compass, Headset, Phone, Mail } from "lucide-react";

const quickLinks = [
  { href: "/pages/about", label: "About Us" },
  { href: "/subjects", label: "All Subjects & Exams" },
];

const legalLinks = [
  { href: "/pages/terms", label: "Terms of Service" },
  { href: "/pages/privacy-policy", label: "Privacy Policy" },
];

export default function DashboardFooter() {
  const { leftWidth, rightWidth } = useFlexPageClasp();
  const currentYear = new Date().getFullYear();

  return (
    <footer
        className="border-t border-[var(--text-color)]/10 transition-all duration-300 ease-in-out text-[var(--text-color)]"
        style={{
          marginLeft: leftWidth,
          marginRight: rightWidth,
          backgroundColor: "var(--content-bg)",
        }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8 py-8 md:py-10 pb-16 md:pb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-10">
            {/* Col 1: Brand */}
            <div>
              <Link href="/" className="inline-flex items-center gap-2 mb-3 group">
                <Image
                  src="/logo/logo.webp"
                  alt="Nurseford"
                  width={28}
                  height={28}
                  className="w-7 h-7 shrink-0 object-contain group-hover:scale-105 transition-transform"
                />
                <span className="font-serif text-lg font-semibold text-[var(--text-color)]">
                  Nurseford
                </span>
              </Link>

              <p className="text-xs sm:text-sm leading-relaxed max-w-xs opacity-75 mb-3">
                Nursing exam-prep built by nurses, for nurses. Study smarter, pass faster.
              </p>

              {/* Status beacon */}
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[11px] font-semibold mb-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>All Q-Bank Systems Live</span>
              </div>

              <p className="text-xs opacity-60">
                We are always there for You !
              </p>
            </div>

            {/* Col 2: EXPLORE & LEGAL */}
            <div>
              <h4 className="font-mono text-xs tracking-widest uppercase font-bold mb-3.5 flex items-center gap-1.5 opacity-90">
                <Compass className="w-3.5 h-3.5 text-[#ff6b35]" />
                <span>Explore &amp; Legal</span>
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm">
                {quickLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="opacity-75 hover:opacity-100 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
                {legalLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="opacity-75 hover:opacity-100 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3: CONTACT */}
            <div>
              <h4 className="font-mono text-xs tracking-widest uppercase font-bold mb-3.5 flex items-center gap-1.5 opacity-90">
                <Headset className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Contact</span>
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm opacity-75">
                <li>
                  <a
                    href="tel:+18702596083"
                    className="inline-flex items-center gap-1.5 hover:opacity-100 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-teal-600 dark:text-[#2FD9C4]" />
                    <span>+1 (870) 259-6083</span>
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:support@nurseford.com"
                    className="inline-flex items-center gap-1.5 hover:opacity-100 transition-colors break-words"
                  >
                    <Mail className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>support@nurseford.com</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright & Disclaimer */}
          <div className="mt-8 pt-4 border-t border-[var(--text-color)]/10 flex flex-col md:flex-row items-center justify-between gap-2.5 text-[11px] opacity-60 text-center md:text-left">
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
