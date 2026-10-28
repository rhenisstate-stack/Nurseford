'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, ChevronDown } from 'lucide-react';
import SearchBar from './search';
import ThemeModeToggle from '@/components/common/theme/ThemeModeToggle';
import { useCurrentSystemUser } from '@/lib/hooks/users/account/current/useCurrentSystemUser';
import UserAccountDropdown from '@/components/common/user/UserAccountDropdown';
import HeedMessageBell from './HeedMessageBell';

const nursingLinks = [
  {
    label: 'RN Nursing Exam',
    description: 'Registered Nurse core competency & test bank',
    href: '/dashboards/rn-nursing',
  },
  {
    label: 'LPN Nursing Exam',
    description: 'Practical Nurse core competency & test bank',
    href: '/dashboards/lpn-nursing',
  },
];

const exitExamLinks = [
  {
    label: 'RN Exit Exams',
    description: 'ATI & HESI Comprehensive RN Exit Exams',
    href: '/dashboards/rn-nursing/exams/exit-ati-exams-rn/36',
  },
  {
    label: 'LPN Exit Exams',
    description: 'ATI & HESI Comprehensive LPN Exit Exams',
    href: '/dashboards/lpn-nursing/exams/exit-ati-exams-lpn/23',
  },
];

const moreLinks = [
  { label: 'About Us', href: '/pages/about' },
  { label: 'Entrance', href: '/pages/entrance' },
  { label: 'Resources', href: '/pages/resources' },
  { label: 'Contact Us', href: '/pages/contact-us' },
  { label: 'Terms of Service', href: '/pages/terms' },
  { label: 'Privacy Policy', href: '/pages/privacy-policy' },
];

const excludedMobileMoreLinks = new Set([
  'about us',
  'entrance',
  'resources',
  'contact us',
  'privacy policy',
]);

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const nursingRef = useRef<HTMLDivElement>(null);
  const exitRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);

  const { user, authenticated, loading } = useCurrentSystemUser();
  const signedIn = !loading && authenticated && !!user;
  const userName = (user?.userName ?? '').trim();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 10);
      setOpenDropdown(null);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!openDropdown) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (
        (openDropdown === 'nursing' && nursingRef.current && !nursingRef.current.contains(target)) ||
        (openDropdown === 'exit' && exitRef.current && !exitRef.current.contains(target)) ||
        (openDropdown === 'more' && moreRef.current && !moreRef.current.contains(target))
      ) {
        setOpenDropdown(null);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [openDropdown]);

  const toggleDropdown = (name: string) =>
    setOpenDropdown((prev) => (prev === name ? null : name));


  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-border ${
        scrolled ? 'bg-[var(--navbar-bg)]/95 backdrop-blur-md py-2 shadow-lg' : 'bg-[var(--navbar-bg)] py-4'
      }`}
    >
      <div className="mx-auto w-full max-w-[1600px] px-4 md:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 group" onClick={() => setOpenDropdown(null)}>
          <Image
            src="/logo/logo.webp"
            alt="Rhenis Nursing"
            width={28}
            height={28}
            priority
            className="w-7 h-7 object-contain"
          />
          <span className="font-serif text-lg font-semibold text-sage group-hover:text-coral transition-colors">
            Rhenis Nursing
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-7">
          {/* RN / LPN Nursing Exam dropdown */}
          <div className="relative" ref={nursingRef}>
            <button
              type="button"
              onClick={() => toggleDropdown('nursing')}
              className={`flex items-center gap-1 text-sm font-medium transition-colors ${
                openDropdown === 'nursing' ? 'text-coral' : 'text-navy/70 hover:text-navy'
              }`}
              aria-expanded={openDropdown === 'nursing'}
              aria-haspopup="true"
            >
              RN / LPN Nursing Exam
              <ChevronDown
                className={`w-4 h-4 transition-transform ${openDropdown === 'nursing' ? 'rotate-180' : ''}`}
              />
            </button>
            {openDropdown === 'nursing' && (
              <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 z-50">
                <div className="w-72 rounded-2xl border border-border bg-paper p-3 shadow-2xl">
                  {nursingLinks.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpenDropdown(null)}
                      className="flex flex-col gap-0.5 rounded-xl px-4 py-3 hover:bg-paper-dim transition-colors"
                    >
                      <span className="font-serif text-sm font-semibold text-navy">{item.label}</span>
                      <span className="text-xs text-navy/50">{item.description}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RN / LPN Exit Exams dropdown */}
          <div className="relative" ref={exitRef}>
            <button
              type="button"
              onClick={() => toggleDropdown('exit')}
              className={`flex items-center gap-1 text-sm font-medium transition-colors ${
                openDropdown === 'exit' ? 'text-coral' : 'text-navy/70 hover:text-navy'
              }`}
              aria-expanded={openDropdown === 'exit'}
              aria-haspopup="true"
            >
              RN / LPN Exit Exams
              <ChevronDown
                className={`w-4 h-4 transition-transform ${openDropdown === 'exit' ? 'rotate-180' : ''}`}
              />
            </button>
            {openDropdown === 'exit' && (
              <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 z-50">
                <div className="w-72 rounded-2xl border border-border bg-paper p-3 shadow-2xl">
                  {exitExamLinks.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpenDropdown(null)}
                      className="flex flex-col gap-0.5 rounded-xl px-4 py-3 hover:bg-paper-dim transition-colors"
                    >
                      <span className="font-serif text-sm font-semibold text-navy">{item.label}</span>
                      <span className="text-xs text-navy/50">{item.description}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* More dropdown */}
          <div className="relative" ref={moreRef}>
            <button
              type="button"
              onClick={() => toggleDropdown('more')}
              className={`flex items-center gap-1 text-sm font-medium transition-colors ${
                openDropdown === 'more' ? 'text-coral' : 'text-navy/70 hover:text-navy'
              }`}
              aria-expanded={openDropdown === 'more'}
              aria-haspopup="true"
            >
              More
              <ChevronDown
                className={`w-4 h-4 transition-transform ${openDropdown === 'more' ? 'rotate-180' : ''}`}
              />
            </button>
            {openDropdown === 'more' && (
              <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 z-50">
                <div className="w-72 rounded-2xl border border-border bg-paper p-3 shadow-2xl">
                  {moreLinks.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpenDropdown(null)}
                      className="block rounded-xl px-4 py-2.5 text-sm font-medium text-navy/70 hover:bg-paper-dim hover:text-navy transition-colors"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Desktop search */}
        <div className="hidden lg:block">
          <SearchBar />
        </div>

        {/* Auth buttons */}
        <div className="hidden lg:flex items-center gap-3">
          <ThemeModeToggle />
          {!loading && signedIn && <HeedMessageBell />}
          {loading ? (
            <>
              <div className="h-10 w-24 rounded-full bg-paper-dim animate-pulse" />
              <div className="h-10 w-28 rounded-full bg-coral/40 animate-pulse" />
            </>
          ) : signedIn ? (
            <>
              {/* User Account Dropdown (shows account card) */}
              <UserAccountDropdown currentDashboard="rn-nursing" />

              <Link
                href="/dashboards/rn-nursing"
                className="px-5 py-2 rounded-full text-sm font-semibold text-[#0c1929] bg-coral hover:bg-coral-hover transition-colors"
              >
                Dive In
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="px-5 py-2 rounded-full text-sm font-medium text-navy border border-border-light hover:bg-paper-dim transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="px-5 py-2 rounded-full text-sm font-semibold text-[#0c1929] bg-coral hover:bg-coral-hover transition-colors"
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile search + toggle */}
        <div className="flex items-center gap-2 lg:hidden">
          <SearchBar compact />
          <ThemeModeToggle />
          {!loading && signedIn && <HeedMessageBell />}
          <button
            className="text-navy p-1"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-[var(--navbar-bg)] border-t border-border px-5 pb-6 pt-2 max-h-[calc(100vh-70px)] overflow-y-auto">
          <div className="flex flex-col gap-1 py-2">
            <Link href="/" onClick={() => setMobileOpen(false)} className="py-2.5 text-sm font-medium text-navy hover:text-coral transition-colors">
              Home
            </Link>
            <div className="pt-2 pb-0.5 text-xs font-semibold tracking-wider uppercase text-navy/40">
              Nursing Exams
            </div>
            {nursingLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="py-2 text-sm font-medium text-navy hover:text-coral transition-colors pl-2"
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-2 pb-0.5 text-xs font-semibold tracking-wider uppercase text-navy/40">
              Exit Exams
            </div>
            {exitExamLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="py-2 text-sm font-medium text-navy hover:text-coral transition-colors pl-2"
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-2 pb-0.5 text-xs font-semibold tracking-wider uppercase text-navy/40">
              More
            </div>
            {moreLinks
              .filter(
                (item) => !excludedMobileMoreLinks.has(item.label.toLowerCase())
              )
              .map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="py-2.5 text-sm font-medium text-navy/70 hover:text-coral transition-colors"
                >
                  {item.label}
                </Link>
              ))}
          </div>
          <div className="flex flex-col gap-3 pt-4 border-t border-border mt-2">
            {!loading &&
              (signedIn ? (
                <>
                  <div className="flex justify-center py-1">
                    <UserAccountDropdown currentDashboard="rn-nursing" align="center" hideAvatar />
                  </div>
                  <Link
                    href="/dashboards/rn-nursing"
                    onClick={() => setMobileOpen(false)}
                    className="px-5 py-2.5 rounded-full text-sm font-semibold text-[#0c1929] bg-coral text-center hover:bg-coral-hover transition-colors"
                  >
                    Dive In
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    onClick={() => setMobileOpen(false)}
                    className="px-5 py-2.5 rounded-full text-sm font-medium text-navy border border-border-light text-center"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/register"
                    onClick={() => setMobileOpen(false)}
                    className="px-5 py-2.5 rounded-full text-sm font-semibold text-[#0c1929] bg-coral text-center"
                  >
                    Register
                  </Link>
                </>
              ))}
          </div>
        </div>
      )}
    </header>
  );
}
