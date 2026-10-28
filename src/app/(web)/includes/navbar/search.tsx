'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';

const searchIndex = [
  { label: 'RN Nursing Exam', href: '/pages/exams/rn-nursing', keywords: 'registered nurse rn nursing practice questions bank test prep med-surg pediatrics' },
  { label: 'LPN Nursing Exam', href: '/pages/exams/lpn-nursing', keywords: 'licensed practical nurse lpn nursing practice questions bank test prep pn' },
  { label: 'RN Exit Exams', href: '/dashboards/rn-nursing/exams/exit-ati-exams-rn/36', keywords: 'rn exit exams ati hesi comprehensive exit predictor' },
  { label: 'LPN Exit Exams', href: '/dashboards/lpn-nursing/exams/exit-ati-exams-lpn/23', keywords: 'lpn exit exams ati hesi comprehensive exit predictor' },
  { label: 'Home', href: '/', keywords: 'home' },
  { label: 'About Us', href: '/pages/about', keywords: 'about who we are' },
  { label: 'Resources', href: '/pages/resources', keywords: 'resources study guides' },
  { label: 'Contact Us', href: '/pages/contact-us', keywords: 'contact help support reach' },
  { label: 'Subscription', href: '/pages/subscription/package', keywords: 'subscription plan pricing' },
  { label: 'Terms of Service', href: '/pages/terms', keywords: 'terms service' },
  { label: 'Privacy Policy', href: '/pages/privacy-policy', keywords: 'privacy policy data' },
];

export default function SearchBar({
  onNavigate,
  compact,
}: {
  onNavigate?: () => void;
  compact?: boolean;
}) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const results = query.trim()
    ? searchIndex
        .filter((item) =>
          `${item.label} ${item.keywords}`.toLowerCase().includes(query.trim().toLowerCase())
        )
        .slice(0, 8)
    : [];

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
        if (compact) setExpanded(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [compact]);

  const go = (href: string) => {
    setOpen(false);
    setExpanded(false);
    setQuery('');
    onNavigate?.();
    router.push(href);
  };

  const close = () => {
    setOpen(false);
    if (compact) setExpanded(false);
  };

  const input = (
    <div className="flex items-center gap-2 rounded-full border border-border bg-[var(--navbar-bg)] px-3 py-2 focus-within:border-coral">
      <Search size={16} className="text-navy/40 shrink-0" />
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && results[0]) go(results[0].href);
          if (e.key === 'Escape') close();
        }}
        placeholder="Search..."
        autoFocus={!!compact && expanded}
        className="w-full bg-transparent text-[16px] sm:text-sm text-navy placeholder:text-navy/40 outline-none"
      />
      {query ? (
        <button
          type="button"
          onClick={() => {
            setQuery('');
            setOpen(true);
          }}
          aria-label="Clear search"
          className="shrink-0"
        >
          <X size={14} className="text-navy/40" />
        </button>
      ) : (
        compact && (
          <button type="button" onClick={() => setExpanded(false)} aria-label="Close search" className="shrink-0">
            <X size={14} className="text-navy/40" />
          </button>
        )
      )}
    </div>
  );

  const dropdown =
    open && results.length > 0 ? (
      <div className="absolute left-0 right-0 top-full mt-2 rounded-2xl border border-border bg-paper shadow-2xl p-2 z-50">
        {results.map((item) => (
          <button
            key={item.href}
            type="button"
            onClick={() => go(item.href)}
            className="block w-full text-left rounded-xl px-4 py-2.5 text-sm font-medium text-navy hover:bg-paper-dim transition-colors"
          >
            {item.label}
          </button>
        ))}
      </div>
    ) : null;

  if (compact) {
    return (
      <div ref={wrapRef} className="relative">
        {expanded ? (
          <div className="absolute right-0 top-full mt-2 w-72 max-w-[85vw]">
            <div className="relative">
              {input}
              {dropdown}
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            aria-label="Open search"
            className="flex items-center justify-center w-10 h-10 rounded-lg border border-border"
          >
            <Search size={18} className="text-navy" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div ref={wrapRef} className="relative">
      {input}
      {dropdown}
    </div>
  );
}
