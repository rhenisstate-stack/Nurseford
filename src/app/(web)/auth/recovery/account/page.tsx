'use client';

import Link from 'next/link';

export default function RecoveryAccountPage() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-16 min-h-screen" style={{ backgroundColor: "var(--content-bg)" }}>
      <div className="w-full max-w-md bg-paper border border-black/50 dark:border-border rounded-2xl p-8 text-center">
        <span className="inline-block font-mono text-xs tracking-widest uppercase text-coral mb-4">
          Account Recovery
        </span>
        <h1 className="font-serif text-3xl font-semibold text-navy mb-3">Recover Your Account</h1>
        <p className="text-sm text-navy/60 leading-relaxed mb-8">
          Use the password or PIN recovery flow to regain access to your account.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href="/auth/recovery/password"
            className="inline-flex items-center justify-center px-7 py-3 rounded-full text-sm font-semibold border border-[#ff6b35]/80 dark:border-[#ff6b35]/60 bg-[#ff6b35]/15 dark:bg-[#ff6b35]/20 hover:bg-[#ff6b35]/25 dark:hover:bg-[#ff6b35]/30 text-[#ea580c] dark:text-[#ff8a65] shadow-2xs transition-all duration-200 active:scale-[0.98]"
          >
            Recover Password / PIN
          </Link>
          <Link
            href="/auth/support"
            className="inline-flex items-center justify-center px-7 py-3 rounded-full text-sm font-semibold border border-blue-500/80 dark:border-blue-400/60 bg-blue-500/15 dark:bg-blue-500/20 hover:bg-blue-500/25 dark:hover:bg-blue-500/30 text-blue-700 dark:text-blue-300 shadow-2xs transition-all duration-200 active:scale-[0.98]"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
