// src/app/dashboards/nclex-pn/vista/subscriptions/items/page.tsx
"use client";

import Link from "next/link";
import { FiShoppingCart, FiArrowLeft } from "react-icons/fi";
import { useFlexPageClasp } from "@/lib/contexts/panel/layout/utils/FlexPageClasp";
import { useCurrentSystemUser } from "@/lib/hooks/users/account/current/useCurrentSystemUser";
import SubscriptionItem from "@/app/(web)/pages/subscription/item/SubscriptionItem";

const TARGET_PROGRAM = "nclex-pn"; // Lowercase hyphened, matches dashboard path
const DASHBOARD_NAME = "nclex-pn";
const PARENT_TABLE_NAME = "program";
const PARENT_NAME = "NCLEX_PN"; // Uppercase + underscore, matches backend program Segment column

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

export default function SubscriptionItemsPage() {
  const { leftWidth, rightWidth, navHeight } = useFlexPageClasp();
  const { user, loading: userLoading } = useCurrentSystemUser();

  return (
    <main
      className="pt-16 transition-all duration-300 ease-in-out overflow-x-hidden"
      style={{
        marginLeft: leftWidth,
        marginRight: rightWidth,
        minHeight: `calc(100vh - ${navHeight}px)`,
        backgroundColor: "var(--content-bg)",
        color: "var(--content-text)",
      }}
    >
      <div className="p-3 md:p-4 space-y-2 w-full max-w-7xl mx-auto">

        <Link
          href={`/dashboards/${TARGET_PROGRAM}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold opacity-60 hover:opacity-100 text-[var(--text-color)] transition-opacity"
        >
          <FiArrowLeft className="w-3.5 h-3.5" />
          Back to Dashboard
        </Link>

        {/* Current user header */}
        <div className="rounded-2xl border border-[var(--text-color)]/15 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-cyan-500/10 backdrop-blur-xl px-5 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-lg font-bold text-[var(--text-color)] flex items-center gap-2">
                <FiShoppingCart className="w-4 h-4 text-indigo-500" />
                Subscription Plans
              </h1>
              <p className="text-md opacity-60 text-[var(--text-color)]">
                {userLoading ? "Loading…" : `${user?.userName ?? "Guest"} . .  ${user?.email ?? ""}`}
              </p>
            </div>
          </div>

          <Link
            href={`/dashboards/${TARGET_PROGRAM}/vista/subscriptions/packages`}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-semibold text-xs bg-[var(--text-color)]/10 text-[var(--text-color)] hover:bg-[var(--text-color)]/20 transition shrink-0"
          >
            View My Subscriptions
          </Link>
        </div>

        {/* ─────────────────────────────────────────────────────────────────────── */}
        <SubscriptionItem
          parentTableName={PARENT_TABLE_NAME}
          parentName={PARENT_NAME}
          dashboardName={DASHBOARD_NAME}
          heading="Subscription Plans"
          showSearch={false}
        />

      </div>
    </main>
  );
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End By : B.L.S.M.C ;  -  SkewBlanc - The Winds Chase Us ⚓
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────