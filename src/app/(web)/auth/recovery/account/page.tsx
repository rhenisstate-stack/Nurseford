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
            className="inline-flex items-center justify-center px-7 py-3 rounded-full text-sm font-semibold text-[#0c1929] bg-coral hover:bg-coral-hover transition-colors"
          >
            Recover Password / PIN
          </Link>
          <Link
            href="/auth/support"
            className="inline-flex items-center justify-center px-7 py-3 rounded-full text-sm font-medium text-navy border border-border-light hover:bg-paper-dim transition-colors"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
