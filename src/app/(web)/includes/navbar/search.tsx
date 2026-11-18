'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Loader2 } from 'lucide-react';

interface SearchItem {
  id: string;
  title: string;
  subtitle?: string;
  category?: string;
  href: string;
}

export default function SearchBar({
  onNavigate,
  compact,
  className = '',
}: {
  onNavigate?: () => void;
  compact?: boolean;
  className?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Dynamic live search with 250ms debounce
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || []);
        } else {
          setResults([]);
        }
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

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
    <div className="flex items-center gap-2 rounded-full border border-border bg-[var(--navbar-bg)] px-3 py-2 focus-within:border-[#2FD9C4]">
      {isLoading ? (
        <Loader2 size={16} className="text-[#2FD9C4] animate-spin shrink-0" />
      ) : (
        <Search size={16} className="text-navy/40 shrink-0" />
      )}
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
        placeholder="Search exams, courses..."
        autoFocus={!!compact && expanded}
        className="w-full bg-transparent text-[16px] sm:text-xs xl:text-sm text-navy dark:text-white placeholder:text-navy/40 dark:placeholder:text-white/40 outline-none truncate"
      />
      {query ? (
        <button
          type="button"
          onClick={() => {
            setQuery('');
            setResults([]);
            setOpen(false);
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
    open && query.trim() ? (
      <div className="absolute left-0 right-0 top-full mt-2 rounded-2xl border border-border bg-white dark:bg-[#15273e] shadow-2xl p-2 z-50 max-h-80 overflow-y-auto">
        {results.length > 0 ? (
          results.slice(0, 10).map((item) => (
            <button
              key={`${item.id}-${item.href}`}
              type="button"
              onClick={() => go(item.href)}
              className="w-full text-left rounded-xl px-4 py-2.5 text-sm font-medium text-navy dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors flex items-center justify-between gap-2"
            >
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{item.title}</div>
                {item.subtitle && (
                  <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{item.subtitle}</div>
                )}
              </div>
              {item.category && (
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300 shrink-0">
                  {item.category}
                </span>
              )}
            </button>
          ))
        ) : !isLoading ? (
          <div className="py-4 text-center text-xs text-slate-500">
            No matches found for &ldquo;{query.trim()}&rdquo;
          </div>
        ) : null}
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
    <div
      ref={wrapRef}
      className={`relative w-36 sm:w-44 lg:w-44 xl:w-60 2xl:w-72 transition-all duration-200 focus-within:w-48 lg:focus-within:w-56 xl:focus-within:w-72 2xl:focus-within:w-80 ${className}`}
    >
      {input}
      {dropdown}
    </div>
  );
}
