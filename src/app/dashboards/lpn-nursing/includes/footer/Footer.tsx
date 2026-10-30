"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useFlexPageClasp } from "@/lib/contexts/panel/layout/utils/FlexPageClasp";
import Annex from "@/app/(web)/auth/modals/Annex";
import { APP_NAME } from "@/lib/config/config";

const quickLinks = [
  { href: "/pages/about", label: "About Us" },
  { href: "/#how-it-works", label: "How We Help" },
  { href: "/#exams", label: "Exam Tracks" },
];

const resourceLinks = [
  { href: "/pages/resources", label: "Resources" },
  { href: "/pages/contact-us", label: "Contact Us" },
  { href: "/pages/terms", label: "Terms of Service" },
  { href: "/pages/privacy-policy", label: "Privacy Policy" },
];

export default function Footer() {
  const { leftWidth, rightWidth } = useFlexPageClasp();
  const [annexOpen, setAnnexOpen] = useState(false);

  return (
    <>
      <footer
        className="border-t border-[var(--text-color)]/10 transition-all duration-300 ease-in-out"
        style={{
          marginLeft: leftWidth,
          marginRight: rightWidth,
        }}
      >
        <div className="mx-auto max-w-6xl px-5 py-6 md:py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {/* Brand */}
            <div>
              <Link href="/" className="flex items-center gap-2 mb-4 group">
                <Image
                  src="/logo/logo.webp"
                  alt="NurseFord"
                  width={28}
                  height={28}
                  className="w-7 h-7 shrink-0 object-contain"
                />
                <span className="font-serif text-lg font-semibold text-[var(--text-color)]">
                  NurseFord
                </span>
              </Link>
              <p className="text-sm leading-relaxed max-w-xs text-[var(--text-color)]/60">
                Nursing exam-prep built by nurses, for nurses. Study smarter, pass
                faster.
              </p>
              <p className="text-sm leading-relaxed max-w-xs mt-3 text-[var(--text-color)]/60">
                We are always there for You !
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-mono text-xs tracking-widest uppercase text-[var(--text-color)]/50 mb-4">
                Quick Links
              </h4>
              <ul className="space-y-2.5">
                {quickLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[var(--text-color)]/60 hover:text-[var(--text-color)] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <button
                    type="button"
                    onClick={() => setAnnexOpen(true)}
                    className="text-sm text-[var(--text-color)]/60 hover:text-[var(--text-color)] transition-colors"
                  >
                    Powered by {APP_NAME} Team
                  </button>
                </li>
              </ul>
            </div>

            {/* Resources & Legal */}
            <div>
              <h4 className="font-mono text-xs tracking-widest uppercase text-[var(--text-color)]/50 mb-4">
                Resources &amp; Legal
              </h4>
              <ul className="space-y-2.5">
                {resourceLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[var(--text-color)]/60 hover:text-[var(--text-color)] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-mono text-xs tracking-widest uppercase text-[var(--text-color)]/50 mb-4">
                Contact
              </h4>
              <ul className="space-y-2.5 text-sm text-[var(--text-color)]/60">
                <li>
                  <a
                    href="tel:+18702596083"
                    className="hover:text-[var(--text-color)] transition-colors"
                  >
                    +1 (870) 259-6083
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:support@nurseford.com"
                    className="hover:text-[var(--text-color)] transition-colors break-words"
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
