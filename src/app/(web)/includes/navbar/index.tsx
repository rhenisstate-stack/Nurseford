'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown, User, CreditCard } from 'lucide-react';
import SearchBar from './search';
import ThemeModeToggle from '@/components/common/theme/ThemeModeToggle';
import { useCurrentSystemUser } from '@/lib/hooks/users/account/current/useCurrentSystemUser';
import UserAccountDropdown from '@/components/common/user/UserAccountDropdown';
import HeedMessageBell from './HeedMessageBell';
import { useLeftSidebar } from '@/lib/contexts/panel/layout/includes/sidebar/LeftSidebarContext';

const nursingSchoolLinks = [
  {
    label: 'RN Nursing Test Bank',
    description: 'Registered Nurse prep',
    href: '/dashboards/rn-nursing',
  },
  {
    label: 'LPN Nursing Test Bank',
    description: 'Licensed Practical Nurse prep',
    href: '/dashboards/lpn-nursing',
  },
];

const courseLinks = [
  {
    label: 'All Nursing Courses',
    description: 'Explore full RN, LPN, and Exit course catalogue',
    href: '/courses',
  },
  {
    label: 'Browse by Subjects',
    description: 'Explore curriculum by clinical specialty',
    href: '/subjects',
  },
  {
    label: 'Med-Surg Collection',
    description: '18,500+ Medical-Surgical & Adult Health questions',
    href: '/subjects?subject=Med-Surg+%2F+Adult+Health',
  },
  {
    label: 'RN Nursing Courses',
    description: 'ATI, HESI, Examplify, and General RN tracks',
    href: '/courses?program=RN+Nursing+Exams',
  },
  {
    label: 'LPN Nursing Courses',
    description: 'Licensed Practical Nurse exams and test suites',
    href: '/courses?program=LPN+Nursing+Exams',
  },
  {
    label: 'Exit Exam Simulators',
    description: 'RN and LPN Exit Exam mock tests',
    href: '/courses?program=RN+Exit+Exams',
  },
];

const exitExamLinks = [
  {
    label: 'RN Exit Exams',
    description: 'Registered Nurse exit exam simulations',
    href: '/dashboards/rn-nursing',
  },
  {
    label: 'LPN Exit Exams',
    description: 'Practical Nurse exit exam simulations',
    href: '/dashboards/lpn-nursing',
  },
];

const resourceLinks = [
  { label: 'Sample Questions', href: '/pages/sample-questions' },
  { label: 'Subscriptions', href: '/dashboards/rn-nursing/vista/subscriptions/items' },
  { label: 'Study Resources', href: '/pages/resources' },
  { label: 'About Us', href: '/pages/about' },
  { label: 'Contact Us', href: '/pages/contact-us' },
  { label: 'Terms of Service', href: '/pages/terms' },
  { label: 'Privacy Policy', href: '/pages/privacy-policy' },
];

export default function Navbar() {
  const pathname = usePathname() || '';
  const isHomePage = pathname === '/' || pathname === '';
  const isCoursesPage =
    pathname === '/courses' ||
    pathname === '/pages/courses' ||
    pathname.startsWith('/courses') ||
    pathname.startsWith('/subjects');

  const { isOpened: isLeftOpened, toggle: toggleLeftSidebar } = useLeftSidebar();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const coursesRef = useRef<HTMLDivElement>(null);
  const nursingRef = useRef<HTMLDivElement>(null);
  const exitRef = useRef<HTMLDivElement>(null);
  const resourceRef = useRef<HTMLDivElement>(null);

  const { user, authenticated, loading } = useCurrentSystemUser();
  const signedIn = !loading && authenticated && !!user;

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
        (openDropdown === 'courses' && coursesRef.current && !coursesRef.current.contains(target)) ||
        (openDropdown === 'nursing' && nursingRef.current && !nursingRef.current.contains(target)) ||
        (openDropdown === 'exit' && exitRef.current && !exitRef.current.contains(target)) ||
        (openDropdown === 'resources' && resourceRef.current && !resourceRef.current.contains(target))
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

  const toggleDropdown = (name: string) => {
    setOpenDropdown((prev) => (prev === name ? null : name));
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-border ${
        scrolled ? 'bg-[var(--navbar-bg)]/95 backdrop-blur-md py-2.5 shadow-sm' : 'bg-[var(--navbar-bg)] py-3.5'
      }`}
    >
      <div className="mx-auto w-full max-w-[1600px] px-3 sm:px-4 md:px-6 lg:px-6 xl:px-8 flex items-center justify-between gap-2 xl:gap-4 min-w-0">
        {/* Brand & Sidebar Toggle */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <Link href="/" className="flex items-center shrink-0" onClick={() => setOpenDropdown(null)} aria-label="Nurseford Home">
            <Image
              src="/logo/logo.webp"
              alt="Nurseford"
              width={32}
              height={32}
              priority
              className="w-8 h-8 object-contain"
            />
          </Link>

          {isCoursesPage && (
            <button
              type="button"
              onClick={toggleLeftSidebar}
              className="flex items-center justify-center w-8 h-8 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-navy dark:text-white shrink-0"
              aria-label="Toggle Sidebar"
              title={isLeftOpened ? "Collapse Sidebar" : "Expand Sidebar"}
            >
              {isLeftOpened ? (
                <X className="w-4 h-4" strokeWidth={2.5} />
              ) : (
                <Menu className="w-4 h-4" strokeWidth={2.5} />
              )}
            </button>
          )}
        </div>

        {/* Desktop nav: ONLY rendered on Home Page */}
        {isHomePage && (
          <nav className="hidden lg:flex items-center gap-3.5 xl:gap-6 2xl:gap-8 shrink-0">
            {/* Courses dropdown */}
            <div className="relative" ref={coursesRef}>
              <button
                type="button"
                onClick={() => toggleDropdown('courses')}
                className={`flex items-center gap-1.5 text-sm font-semibold transition-colors cursor-pointer ${
                  openDropdown === 'courses' ? 'text-teal-600 dark:text-[#2FD9C4]' : 'text-navy/80 hover:text-navy dark:text-white/80 dark:hover:text-white'
                }`}
                aria-expanded={openDropdown === 'courses'}
                aria-haspopup="true"
              >
                Courses
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${openDropdown === 'courses' ? 'rotate-180' : ''}`}
                />
              </button>
              {openDropdown === 'courses' && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 z-50">
                  <div className="w-80 rounded-2xl border border-border bg-white dark:bg-[#1E293B] p-3 shadow-2xl">
                    <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-[#2FD9C4]">
                      Explore Curriculum & Subjects
                    </div>
                    {courseLinks.map((item) => (
                      <Link
                        key={item.href + item.label}
                        href={item.href}
                        onClick={() => setOpenDropdown(null)}
                        className="flex flex-col gap-0.5 rounded-xl px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors"
                      >
                        <span className="font-serif text-sm font-semibold text-navy dark:text-white">{item.label}</span>
                        <span className="text-xs text-navy/50 dark:text-white/50">{item.description}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Nursing School dropdown */}
            <div className="relative" ref={nursingRef}>
              <button
                type="button"
                onClick={() => toggleDropdown('nursing')}
                className={`flex items-center gap-1.5 text-sm font-semibold transition-colors ${
                  openDropdown === 'nursing' ? 'text-blue-600 dark:text-blue-400' : 'text-navy/80 hover:text-navy dark:text-white/80 dark:hover:text-white'
                }`}
                aria-expanded={openDropdown === 'nursing'}
                aria-haspopup="true"
              >
                Nursing School
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${openDropdown === 'nursing' ? 'rotate-180' : ''}`}
                />
              </button>
              {openDropdown === 'nursing' && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 z-50">
                  <div className="w-72 rounded-2xl border border-border bg-white dark:bg-[#1E293B] p-3 shadow-2xl">
                    {nursingSchoolLinks.map((item) => (
                      <Link
                        key={item.href + item.label}
                        href={item.href}
                        onClick={() => setOpenDropdown(null)}
                        className="flex flex-col gap-0.5 rounded-xl px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors"
                      >
                        <span className="font-serif text-sm font-semibold text-navy dark:text-white">{item.label}</span>
                        <span className="text-xs text-navy/50 dark:text-white/50">{item.description}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Exit Exams dropdown */}
            <div className="relative" ref={exitRef}>
              <button
                type="button"
                onClick={() => toggleDropdown('exit')}
                className={`flex items-center gap-1.5 text-sm font-semibold transition-colors ${
                  openDropdown === 'exit' ? 'text-blue-600 dark:text-blue-400' : 'text-navy/80 hover:text-navy dark:text-white/80 dark:hover:text-white'
                }`}
                aria-expanded={openDropdown === 'exit'}
                aria-haspopup="true"
              >
                Exit Exams
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${openDropdown === 'exit' ? 'rotate-180' : ''}`}
                />
              </button>
              {openDropdown === 'exit' && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 z-50">
                  <div className="w-72 rounded-2xl border border-border bg-white dark:bg-[#1E293B] p-3 shadow-2xl">
                    {exitExamLinks.map((item) => (
                      <Link
                        key={item.href + item.label}
                        href={item.href}
                        onClick={() => setOpenDropdown(null)}
                        className="flex flex-col gap-0.5 rounded-xl px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors"
                      >
                        <span className="font-serif text-sm font-semibold text-navy dark:text-white">{item.label}</span>
                        <span className="text-xs text-navy/50 dark:text-white/50">{item.description}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Resources dropdown */}
            <div className="relative" ref={resourceRef}>
              <button
                type="button"
                onClick={() => toggleDropdown('resources')}
                className={`flex items-center gap-1.5 text-sm font-semibold transition-colors ${
                  openDropdown === 'resources' ? 'text-blue-600 dark:text-blue-400' : 'text-navy/80 hover:text-navy dark:text-white/80 dark:hover:text-white'
                }`}
                aria-expanded={openDropdown === 'resources'}
                aria-haspopup="true"
              >
                Resources
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${openDropdown === 'resources' ? 'rotate-180' : ''}`}
                />
              </button>
              {openDropdown === 'resources' && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 z-50">
                  <div className="w-64 rounded-2xl border border-border bg-white dark:bg-[#1E293B] p-3 shadow-2xl">
                    {resourceLinks.map((item) => (
                      <Link
                        key={item.href + item.label}
                        href={item.href}
                        onClick={() => setOpenDropdown(null)}
                        className="block rounded-xl px-4 py-2.5 text-sm font-medium text-navy/80 dark:text-white/80 hover:bg-slate-50 dark:hover:bg-white/10 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </nav>
        )}

        {/* Desktop search + Actions */}
        <div className="hidden lg:flex items-center gap-2 xl:gap-3 2xl:gap-4 shrink-0 min-w-0">
          <div className="shrink min-w-0">
            <SearchBar />
          </div>

          <div className="h-5 w-px bg-slate-200 dark:bg-white/10 shrink-0" />

          <div className="shrink-0">
            <ThemeModeToggle />
          </div>

          {/* Subscription Button */}
          <Link
            href="/dashboards/rn-nursing/vista/subscriptions/items"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs xl:text-sm font-bold bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-[#2FD9C4] border border-teal-500/50 hover:bg-teal-100 dark:hover:bg-teal-900/60 shadow-2xs transition-all duration-150 active:scale-[0.98] shrink-0"
            title="Subscription Packages"
          >
            <CreditCard className="w-3.5 h-3.5 text-teal-600 dark:text-[#2FD9C4]" />
            <span>Subscription</span>
          </Link>

          {!loading && signedIn && (
            <div className="shrink-0">
              <HeedMessageBell />
            </div>
          )}

          {loading ? (
            <div className="h-9 w-20 xl:w-24 rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse shrink-0" />
          ) : signedIn ? (
            <div className="flex items-center gap-2 xl:gap-3 shrink-0">
              <div className="shrink-0">
                <UserAccountDropdown currentDashboard="rn-nursing" />
              </div>
              <Link
                href="/dashboards/rn-nursing"
                className="px-3 xl:px-4 py-2 rounded-lg text-xs xl:text-sm font-semibold bg-[#0A2540] hover:bg-[#071829] dark:bg-[#1E3A8A] dark:hover:bg-[#1d4ed8] text-white transition-all duration-200 shadow-2xs active:scale-[0.98] shrink-0 whitespace-nowrap"
              >
                Dashboard
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2 xl:gap-3 shrink-0">
              <Link
                href="/auth/login"
                className="flex items-center gap-1.5 text-xs xl:text-sm font-semibold text-navy/80 hover:text-navy dark:text-white/80 dark:hover:text-white transition-colors shrink-0 whitespace-nowrap"
              >
                <span className="w-7 h-7 rounded-full border border-navy/30 dark:border-white/30 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-navy/70 dark:text-white/70" />
                </span>
                <span>Sign In</span>
              </Link>
              <Link
                href="/auth/register"
                className="px-3 xl:px-4 py-2 rounded-lg text-xs xl:text-sm font-semibold bg-[#0A2540] hover:bg-[#071829] dark:bg-[#1E3A8A] dark:hover:bg-[#1d4ed8] text-white shadow-2xs transition-all duration-200 active:scale-[0.98] shrink-0 whitespace-nowrap"
              >
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile search + toggle */}
        <div className="flex items-center gap-2 lg:hidden">
          <SearchBar compact />
          <ThemeModeToggle />
          {!loading && signedIn && <HeedMessageBell />}
          <button
            className="text-navy dark:text-white p-1"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileOpen && (
        <div className="lg:hidden bg-[var(--navbar-bg)] border-t border-border px-5 pb-6 pt-2 max-h-[calc(100vh-70px)] overflow-y-auto">
          <div className="flex flex-col gap-1 py-2">
            <Link href="/" onClick={() => setMobileOpen(false)} className="py-2.5 text-sm font-semibold text-navy dark:text-white hover:text-blue-600 transition-colors">
              Home
            </Link>

            {/* ONLY ON HOME PAGE */}
            {isHomePage && (
              <>
                <div className="pt-2 pb-1 text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-[#2FD9C4]">
                  Courses & Subjects
                </div>
                {courseLinks.map((item) => (
                  <Link
                    key={item.href + item.label}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="py-1.5 text-sm font-medium text-navy/80 dark:text-white/80 hover:text-teal-600 transition-colors pl-2"
                  >
                    {item.label}
                  </Link>
                ))}

                <div className="pt-3 pb-1 text-xs font-bold uppercase tracking-wider text-navy/40 dark:text-white/40">
                  Nursing School
                </div>
                {nursingSchoolLinks.map((item) => (
                  <Link
                    key={item.href + item.label}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="py-2 text-sm font-medium text-navy/80 dark:text-white/80 hover:text-blue-600 transition-colors pl-2"
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="pt-3 pb-1 text-xs font-bold uppercase tracking-wider text-navy/40 dark:text-white/40">
                  Exit Exams
                </div>
                {exitExamLinks.map((item) => (
                  <Link
                    key={item.href + item.label}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="py-2 text-sm font-medium text-navy/80 dark:text-white/80 hover:text-blue-600 transition-colors pl-2"
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="pt-3 pb-1 text-xs font-bold uppercase tracking-wider text-navy/40 dark:text-white/40">
                  Resources
                </div>
                {resourceLinks.map((item) => (
                  <Link
                    key={item.href + item.label}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="py-2 text-sm font-medium text-navy/80 dark:text-white/80 hover:text-blue-600 transition-colors pl-2"
                  >
                    {item.label}
                  </Link>
                ))}
              </>
            )}
          </div>

          <div className="flex flex-col gap-2.5 pt-4 border-t border-border mt-3">
            <Link
              href="/dashboards/rn-nursing/vista/subscriptions/items"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-[#2FD9C4] border border-teal-500/50 text-center shadow-2xs transition-all duration-200 active:scale-[0.98]"
            >
              <CreditCard className="w-4 h-4 text-teal-600 dark:text-[#2FD9C4]" />
              <span>Subscription Packages</span>
            </Link>
            {!loading &&
              (signedIn ? (
                <>
                  <div className="flex justify-center py-1">
                    <UserAccountDropdown currentDashboard="rn-nursing" align="center" hideAvatar />
                  </div>
                  <Link
                    href="/dashboards/rn-nursing"
                    onClick={() => setMobileOpen(false)}
                    className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-[#0A2540] dark:bg-[#1E3A8A] text-white text-center shadow-2xs transition-all duration-200 active:scale-[0.98]"
                  >
                    Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold border border-slate-300 dark:border-white/20 bg-white dark:bg-white/5 text-navy dark:text-white text-center shadow-2xs transition-all duration-200 active:scale-[0.98]"
                  >
                    <User className="w-4 h-4" />
                    <span>Sign In</span>
                  </Link>
                  <Link
                    href="/auth/register"
                    onClick={() => setMobileOpen(false)}
                    className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-[#0A2540] dark:bg-[#1E3A8A] text-white text-center shadow-2xs transition-all duration-200 active:scale-[0.98]"
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
