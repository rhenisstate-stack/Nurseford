"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  CheckCircle2,
  XCircle,
  CalendarDays,
  Wallet,
  ArrowRight,
  Repeat,
} from "lucide-react";
import { useRelativeStrataPrograms } from "@/lib/hooks/nexus/strata/learning/programs/relative/useRelativeStrataPrograms";
import {
  useDiscreteDominionSubscriptionPackages,
  type DiscreteSubscriptionPackage,
  type UserSubscriptionPackage,
} from "@/lib/hooks/nexus/subscription/packages/dicreate/useDiscreteDominionSubscriptionPackages";
import { useCurrentSystemUser } from "@/lib/hooks/users/account/current/useCurrentSystemUser";

const formatShortDate = (value?: string | null) => {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
};

const formatMoney = (amount?: number | null, currency?: string | null) => {
  if (amount == null) return "—";
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency || "USD",
    }).format(amount);
  } catch {
    return `${currency ?? ""} ${amount}`.trim();
  }
};

const humanizeMinutes = (raw?: string | number | null) => {
  if (raw == null || raw === "") return null;
  const total = Number(raw);
  if (!Number.isFinite(total) || total <= 0) return typeof raw === "string" ? raw : null;

  const units: [string, number][] = [
    ["year", 525600],
    ["month", 43200],
    ["week", 10080],
    ["day", 1440],
    ["hour", 60],
  ];

  let remaining = Math.floor(total);
  const parts: string[] = [];

  for (const [label, size] of units) {
    const count = Math.floor(remaining / size);
    if (count > 0) {
      parts.push(`${count} ${label}${count === 1 ? "" : "s"}`);
      remaining -= count * size;
    }
  }

  if (parts.length === 0) {
    const mins = Math.floor(total);
    return `${mins} minute${mins === 1 ? "" : "s"}`;
  }

  return parts.join(", ");
};

export function useMyActiveSubscription(parentName: string) {
  const { user } = useCurrentSystemUser();
  const isAuthenticated = !!user;
  const { programs } = useRelativeStrataPrograms();
  const { filteredSubscriptionPackages } = useDiscreteDominionSubscriptionPackages({
    page: 1,
    perPage: 100,
    sortColumn: null,
    sortDirection: "asc",
  });

  const currentProgramGuidIds = useMemo(
    () => new Set(programs.filter((p) => p.segment === parentName).map((p) => p.guidId)),
    [programs, parentName]
  );

  return useMemo(() => {
    if (!isAuthenticated) return null;

    type PackageWithCluster = DiscreteSubscriptionPackage & {
      terminalClusterTableName?: string;
      terminalClusterGuidId?: string;
    };

    const active: { pkg: DiscreteSubscriptionPackage; sub: UserSubscriptionPackage }[] = [];

    filteredSubscriptionPackages.forEach((pkg) => {
      const p = pkg as PackageWithCluster;
      const matches =
        p.terminalClusterTableName === "strata_programs" &&
        !!p.terminalClusterGuidId &&
        currentProgramGuidIds.has(p.terminalClusterGuidId);

      if (!matches) return;

      pkg.userSubscriptions?.forEach((sub) => {
        if (sub.subscriptionStatus === "Active") active.push({ pkg, sub });
      });
    });

    if (active.length === 0) return null;
    return { ...active[0], activeCount: active.length };
  }, [filteredSubscriptionPackages, currentProgramGuidIds, isAuthenticated]);
}

export default function ActiveSubscriptionCard({
  pkg,
  sub,
  activeCount,
  dashboardName,
}: {
  pkg: DiscreteSubscriptionPackage;
  sub: UserSubscriptionPackage;
  activeCount: number;
  dashboardName: string;
}) {
  const isActive = sub.subscriptionStatus === "Active";
  const isPaid = sub.subscriptionHasPaid === "Yes";
  const isAutoRenew = sub.subscriptionAutoRenew === "Yes";
  const cycle = humanizeMinutes(pkg.priceDuration || pkg.duration);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-emerald-500 bg-gradient-to-br from-emerald-700 via-black to-teal-700 p-5 md:p-6 shadow-[0_0_24px_-6px_rgba(16,185,129,0.5)] text-white">
      <div className="pointer-events-none absolute -inset-px rounded-2xl ring-1 ring-emerald-300/30" />

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
        <div className="flex items-center gap-4 min-w-0">
          <div
            className={`flex items-center justify-center w-16 h-16 rounded-full shrink-0 shadow-lg ${isActive
              ? "bg-gradient-to-br from-emerald-400 via-indigo-400 to-cyan-500"
              : "bg-gradient-to-br from-yellow-500 via-blue-500 to-red-600"
              }`}
          >
            {isActive ? (
              <CheckCircle2 className="w-10 h-10 text-white" strokeWidth={1.5} />
            ) : (
              <XCircle className="w-10 h-10 text-white" strokeWidth={1.5} />
            )}
          </div>

          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wide text-emerald-200">
              You&apos;ve Got {activeCount} Active Subscription{activeCount === 1 ? "" : "s"} ✔️
            </p>
            <h3 className="text-xl md:text-2xl font-black truncate">{pkg.name}</h3>
            {pkg.description && (
              <p className="text-xs text-white/70 line-clamp-2">{pkg.description}</p>
            )}
            <div className="flex items-center gap-1.5 flex-wrap mt-2">
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${isActive ? "bg-emerald-400 text-yellow-950" : "bg-red-500 text-black"
                  }`}
              >
                {isActive ? <CheckCircle2 className="w-3 h-3" strokeWidth={3} /> : <XCircle className="w-3 h-3" strokeWidth={3} />}
                Status : {sub.subscriptionStatus ?? "—"}
              </span>
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${isPaid ? "bg-emerald-400 text-blue-950" : "bg-red-500 text-black"
                  }`}
              >
                {isPaid ? <CheckCircle2 className="w-3 h-3" strokeWidth={3} /> : <XCircle className="w-3 h-3" strokeWidth={3} />}
                Paid : {sub.subscriptionHasPaid ?? "—"}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-white/15 text-white">
                <Repeat className="w-3 h-3" />
                Auto Renew : {isAutoRenew ? "Yes" : "No"}
              </span>
            </div>
          </div>
        </div>

        <Link
          href={`/dashboards/${dashboardName}`}
          className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl border-2 border-indigo-300 bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-700 px-7 py-3.5 text-sm font-extrabold uppercase tracking-wide text-white shadow-[0_0_0_3px_rgba(99,102,241,0.35),0_10px_30px_-8px_rgba(79,70,229,0.9)] ring-2 ring-indigo-400/60 ring-offset-2 ring-offset-black transition-all duration-500 ease-out hover:-translate-y-1 hover:scale-[1.04] hover:border-white hover:from-indigo-600 hover:via-violet-600 hover:to-indigo-600 hover:shadow-[0_0_0_4px_rgba(129,140,248,0.55),0_16px_40px_-6px_rgba(99,102,241,1)] hover:ring-indigo-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300 active:translate-y-0 active:scale-95 shrink-0"
        >
          <span className="pointer-events-none absolute inset-0 -translate-x-full skew-x-12 bg-gradient-to-r from-transparent via-white/50 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
          <span className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-white/30" />
          <span className="relative">Go to Dashboard</span>
          <ArrowRight className="relative w-4 h-4 transition-transform duration-300 ease-out group-hover:translate-x-1.5" />
        </Link>
      </div>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-white/15 bg-white/5 px-4 py-3">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-emerald-200">
            <CalendarDays className="w-3.5 h-3.5" /> Valid From
          </div>
          <p className="mt-1 text-sm font-bold">{formatShortDate(sub.validFrom)}</p>
        </div>
        <div className="rounded-xl border border-white/15 bg-white/5 px-4 py-3">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-emerald-200">
            <CalendarDays className="w-3.5 h-3.5" /> Valid Until
          </div>
          <p className="mt-1 text-sm font-bold">{formatShortDate(sub.validUntil)}</p>
        </div>
        <div className="rounded-xl border border-white/15 bg-white/5 px-4 py-3">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-emerald-200">
            <Wallet className="w-3.5 h-3.5" /> Cost
          </div>
          <p className="mt-1 text-sm font-bold">
            {formatMoney(pkg.amount, pkg.currency)}
            {cycle ? <span className="font-normal text-white/70"> / {cycle}</span> : null}
          </p>
        </div>
      </div>
    </div>
  );
}