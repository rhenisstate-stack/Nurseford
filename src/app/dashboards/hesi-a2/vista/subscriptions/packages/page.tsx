// src/app/dashboards/hesi-a2/vista/subscriptions/packages/descrete/page.tsx
"use client";

import { useMemo, useState } from "react";
import { useFlexPageClasp } from "@/lib/contexts/panel/layout/utils/FlexPageClasp";
import {
  useDiscreteDominionSubscriptionPackages,
  DiscreteSubscriptionPackage,
  UserSubscriptionPackage,
} from "@/lib/hooks/nexus/subscription/packages/dicreate/useDiscreteDominionSubscriptionPackages";
import SearchBar from "@/lib/utils/data/SearchBar";
import PerPageSelect from "@/lib/utils/data/PerPageSelect";
import { APP_TITLE } from "@/lib/config/config";
import { VISTA_QUOTES } from "@/lib/constants/dashboards/nexus/vista/quotes";
import { RefreshCw, XCircle } from "lucide-react";
import { SubscriptionStatusBanner } from "@/components/common/subscription/SubscriptionStatusBanner";

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

const VISTA_STRATA_LEVEL = "Subscription Packages";
const VISTA_STRATA_NAME = "Subscription Package";
const VISTA_DEFAULT_PERPAGE_LIST = 20;

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// Helper Display Components
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

function MoneyDisplay({ amount, currency }: { amount?: number | null; currency?: string | null }) {
  if (amount === undefined || amount === null) return <span>—</span>;
  return <span>{currency ?? ""}{amount.toFixed(2)}</span>;
}

function DateDisplay({ value }: { value?: string | null }) {
  if (!value) return <span>—</span>;
  const d = new Date(value);
  if (isNaN(d.getTime())) return <span>—</span>;
  return <span>{d.toISOString().slice(0, 10)}</span>;
}

function StatusBadge({ label, tone }: { label?: string | null; tone: "status" | "haspaid" | "autorenew" }) {
  if (!label) return <span className="px-2 py-1 rounded-full text-xs font-bold bg-gray-200 text-gray-500 whitespace-nowrap">—</span>;

  let classes = "bg-gray-200 text-gray-800";
  if (tone === "status" && label === "Active") classes = "bg-green-100 text-green-800";
  if (tone === "haspaid") {
    if (label === "Yes") classes = "bg-green-100 text-green-800";
    else if (label === "Half" || label === "Partial") classes = "bg-yellow-100 text-yellow-800";
    else if (label === "Pending") classes = "bg-yellow-100 text-yellow-800";
    else classes = "bg-red-100 text-red-800";
  }
  if (tone === "autorenew" && label === "Active") classes = "bg-green-100 text-green-800";

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-bold whitespace-nowrap ${classes}`}>
      {label}
    </span>
  );
}

// Convert a raw priceDuration (backend sends TOTAL MINUTES) into "X Months Y Days Z Hours W Minutes"
function formatPriceDuration(raw?: string | null): string {
  if (!raw) return "—";
  const totalMinutes = Number(raw);
  if (!Number.isFinite(totalMinutes) || totalMinutes <= 0) return "—";

  const MINUTES_IN_HOUR = 60;
  const MINUTES_IN_DAY = MINUTES_IN_HOUR * 24;
  const MINUTES_IN_MONTH = MINUTES_IN_DAY * 30; // approximate month

  let remaining = totalMinutes;

  const months = Math.floor(remaining / MINUTES_IN_MONTH);
  remaining -= months * MINUTES_IN_MONTH;

  const days = Math.floor(remaining / MINUTES_IN_DAY);
  remaining -= days * MINUTES_IN_DAY;

  const hours = Math.floor(remaining / MINUTES_IN_HOUR);
  remaining -= hours * MINUTES_IN_HOUR;

  const minutes = Math.floor(remaining);

  const parts: string[] = [];
  if (months > 0) parts.push(`${months} Month${months > 1 ? "s" : ""}`);
  if (days > 0) parts.push(`${days} Day${days > 1 ? "s" : ""}`);
  if (hours > 0) parts.push(`${hours} Hour${hours > 1 ? "s" : ""}`);
  if (minutes > 0 && months === 0 && days === 0) parts.push(`${minutes} Minute${minutes > 1 ? "s" : ""}`);

  return parts.length ? parts.join(" ") : "< 1 Minute";
}

// Match a userSubscription to whichever provider array actually holds its record
type MatchedProvider = {
  providerName: "Stripe" | "Paystack" | "IntaSend" | "Flutterwave" | "PayPal" | "Apple" | "Mpesa";
  amount?: number | null;
  currency?: string | null;
  status?: string | null;
  externalId?: string | null;
};

function findProviderForSubscription(
  pkg: DiscreteSubscriptionPackage,
  subscriptionId: number
): MatchedProvider | null {
  const stripe = pkg.stripeSubscriptions?.find((s) => s.subscriptionId === subscriptionId);
  if (stripe) return { providerName: "Stripe", amount: stripe.amount, currency: stripe.currency, status: stripe.status, externalId: stripe.externalId };

  const paystack = pkg.payStackSubscriptions?.find((s) => s.subscriptionId === subscriptionId);
  if (paystack) return { providerName: "Paystack", amount: paystack.amount, currency: paystack.currency, status: paystack.status, externalId: paystack.externalId };

  const intasend = pkg.intaSendSubscriptions?.find((s) => s.subscriptionId === subscriptionId);
  if (intasend) return { providerName: "IntaSend", amount: intasend.amount, currency: intasend.currency, status: intasend.status, externalId: intasend.externalId };

  const flutterwave = pkg.flutterWaveSubscriptions?.find((s) => s.subscriptionId === subscriptionId);
  if (flutterwave) return { providerName: "Flutterwave", amount: flutterwave.amount, currency: flutterwave.currency, status: flutterwave.status, externalId: flutterwave.externalId };

  const paypal = pkg.payPalSubscriptions?.find((s) => s.subscriptionId === subscriptionId);
  if (paypal) return { providerName: "PayPal", amount: paypal.amount, currency: paypal.currency, status: paypal.status, externalId: paypal.externalId };

  const apple = pkg.appleSubscriptions?.find((s) => s.subscriptionId === subscriptionId);
  if (apple) return { providerName: "Apple", amount: apple.amount, currency: apple.currency, status: apple.status, externalId: apple.externalId };

  const mpesa = pkg.mPesaSubscriptions?.find((s) => s.subscriptionId === subscriptionId);
  if (mpesa) return { providerName: "Mpesa", amount: mpesa.amount, currency: mpesa.currency, status: mpesa.status, externalId: mpesa.externalId };

  return null;
}

// A single subscription "flattened" alongside its parent package + resolved provider.
// Packages with zero userSubscriptions never produce a row — that's the whole point.
type FlattenedSubscriptionRow = {
  pkg: DiscreteSubscriptionPackage;
  sub: UserSubscriptionPackage;
  provider: MatchedProvider | null;
};

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// Confirmation Modal — Cancel / Auto Renew
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

type PendingAction = {
  type: "cancel" | "autoRenew";
  packageId: number;
  packageName: string;
  subscriptionId: number;
  subscriptionGuidId: string;
  currentAutoRenew?: string | null;
} | null;

function ConfirmActionModal({
  action,
  onDismiss,
  onConfirm,
  isSubmitting,
}: {
  action: PendingAction;
  onDismiss: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
}) {
  if (!action) return null;

  const isCancel = action.type === "cancel";
  const nextAutoRenewLabel = action.currentAutoRenew === "Active" ? "Turn Off" : "Turn On";

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-2xl border border-[var(--text-color)] bg-[var(--content-bg)] text-[var(--text-color)] p-6 shadow-2xl">
        <h2 className="text-lg font-bold mb-2">
          {isCancel ? "Confirm Cancellation ⚓" : `Confirm Auto Renew — ${nextAutoRenewLabel} ⚓`}
        </h2>

        <p className="text-sm opacity-80 mb-1">
          Package: <strong>{action.packageName}</strong>
        </p>
        <p className="text-sm opacity-80 mb-4 font-mono break-all">
          Subscription: {action.subscriptionGuidId}
        </p>

        <p className="text-sm mb-6 opacity-90">
          {isCancel
            ? "This will cancel this subscription. Depending on the provider, this action may not be reversible."
            : `This will ${nextAutoRenewLabel.toLowerCase()} auto renew for this subscription.`}
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onDismiss}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-md border font-bold bg-[var(--content-bg)] text-[var(--text-color)] disabled:opacity-40"
          >
            Dismiss
          </button>
          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            className={`px-4 py-2 rounded-md border font-bold text-white disabled:opacity-40 ${isCancel
              ? "bg-red-600 border-red-700 hover:bg-red-700"
              : "bg-blue-600 border-blue-700 hover:bg-blue-700"
              }`}
          >
            {isSubmitting ? "Processing…" : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// Main Component
export default function DiscreteSubscriptionPackagesPage() {
  const { leftWidth, rightWidth, navHeight } = useFlexPageClasp();

  const [perPage, setPerPage] = useState(VISTA_DEFAULT_PERPAGE_LIST);
  const [currentPage, setCurrentPage] = useState(1);

  type SortDirection = "asc" | "desc";

  const [sortColumn, setSortColumn] = useState<keyof DiscreteSubscriptionPackage | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

  const {
    filteredSubscriptionPackages,
    skewTotal,
    skewTotalPages,
    subscriptionPackageSearch,
    setSubscriptionPackageSearch,
  } = useDiscreteDominionSubscriptionPackages({
    page: currentPage,
    perPage,
    sortColumn,
    sortDirection,
  });

  const totalPages = skewTotalPages;

  // Only packages that actually have userSubscriptions produce rows.
  // Everything else (the vast majority of the 100 items) is dropped here.
  const flattenedSubscriptions = useMemo<FlattenedSubscriptionRow[]>(() => {
    const rows: FlattenedSubscriptionRow[] = [];

    filteredSubscriptionPackages.forEach((pkg) => {
      if (!pkg.userSubscriptions || pkg.userSubscriptions.length === 0) return;

      pkg.userSubscriptions.forEach((sub) => {
        rows.push({
          pkg,
          sub,
          provider: findProviderForSubscription(pkg, sub.subscriptionId),
        });
      });
    });

    return rows;
  }, [filteredSubscriptionPackages]);

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

  const randomQuote = useMemo(() => {
    return VISTA_QUOTES[Math.floor(Math.random() * VISTA_QUOTES.length)];
  }, []);

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

  // Toast State
  type ToastType = "success" | "error" | "info";

  interface Toast {
    id: number;
    message: string;
    type: ToastType;
  }

  const [toasts, setToasts] = useState<Toast[]>([]);
  const [staticToasts, setStaticToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: ToastType = "success", duration = 3000) => {
    const id = Date.now();
    const updatedToast: Toast = { id, message, type };

    setToasts([updatedToast]);
    setStaticToasts([updatedToast]);

    const timeout = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);

    return () => clearTimeout(timeout);
  };

  const removeStaticToast = (id: number) => {
    setStaticToasts((prev) => prev.filter((toast) => toast.id !== id));
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

  const handleSort = (column: keyof DiscreteSubscriptionPackage) => {
    let direction: SortDirection = "asc";

    if (sortColumn === column) {
      direction = sortDirection === "asc" ? "desc" : "asc";
      setSortDirection(direction);
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }

    setCurrentPage(1);

    setStaticToasts((prev) => prev.filter((t) => !t.message.includes("Sorted By")));
    showToast(`Sorted By "${String(column)}" In ${direction.toUpperCase()} Order`, "success");
  };

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

  const getVisiblePages = (current: number, total: number, windowSize = 2) => {
    const pages: (number | "ellipsis")[] = [];
    const start = Math.max(2, current - windowSize);
    const end = Math.min(total - 1, current + windowSize);

    pages.push(1);
    if (start > 2) pages.push("ellipsis");
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < total - 1) pages.push("ellipsis");
    if (total > 1) pages.push(total);

    return pages;
  };

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  // Cancel / Auto Renew Action Flow
  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  const openCancelConfirm = (pkg: DiscreteSubscriptionPackage, sub: UserSubscriptionPackage) => {
    setPendingAction({
      type: "cancel",
      packageId: pkg.id,
      packageName: pkg.name,
      subscriptionId: sub.subscriptionId,
      subscriptionGuidId: sub.subscriptionGuidId,
      currentAutoRenew: sub.subscriptionAutoRenew,
    });
  };

  const openAutoRenewConfirm = (pkg: DiscreteSubscriptionPackage, sub: UserSubscriptionPackage) => {
    setPendingAction({
      type: "autoRenew",
      packageId: pkg.id,
      packageName: pkg.name,
      subscriptionId: sub.subscriptionId,
      subscriptionGuidId: sub.subscriptionGuidId,
      currentAutoRenew: sub.subscriptionAutoRenew,
    });
  };

  const handleConfirmAction = async () => {
    if (!pendingAction) return;
    setIsSubmittingAction(true);

    try {
      // ⚠️ NOTE: Wire this to the real backend once the RouteKey / service method is confirmed.
      // Suggested shape, following the dominionService pattern used by this hook:
      //
      // await dominionService("SubscriptionPackage", pendingAction.type === "cancel" ? "CancelSubscription" : "ToggleAutoRenew", {
      //   subscriptionId: pendingAction.subscriptionId,
      // });

      showToast(
        pendingAction.type === "cancel"
          ? `Subscription "${pendingAction.subscriptionGuidId}" Cancelled Successfully ⚓`
          : `Auto Renew Updated For "${pendingAction.subscriptionGuidId}" ⚓`,
        "success"
      );

      setPendingAction(null);
    } catch (err) {
      console.error("❌ [DiscreteSubscriptionPackagesPage] Action Failed:", err);
      showToast("Action Failed — Please Try Again ⚓", "error");
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

  const columns: { key: keyof DiscreteSubscriptionPackage; label: string }[] = [
    { key: "name", label: "Plan Name" },
    { key: "amount", label: "Amount" },
    { key: "priceDuration", label: "Duration" },
    { key: "terminalClusterName", label: "Target" },
  ];

  // 1 (row #) + columns.length (sortable) + 10 fixed subscription columns
  const totalTableColumns = columns.length + 11;

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  // Render
  return (
    <>
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
        <div className="p-1 space-y-3 w-full">
          {/* Subscription Status Message Banner */}
          <SubscriptionStatusBanner />

          {/* Header */}
          <div className="relative border border-[var(--text-color)] rounded-2xl bg-[var(--content-bg)] text-[var(--text-color)] px-4 py-0">
            <div className="text-center">
              <h1 className="text-2xl md:text-3xl font-bold">{APP_TITLE} {VISTA_STRATA_LEVEL}</h1>
              <p className="text-sm opacity-70">
                Discrete Registry of All {VISTA_STRATA_NAME} Records Across the {APP_TITLE}.
              </p>
            </div>

            {/* Timed Toast Container - Top Center */}
            <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-[9999] flex flex-col gap-2 items-center">
              {toasts.map((toastType) => (
                <div
                  key={toastType.id}
                  className={`
                    px-5 py-2 rounded-xl shadow-2xl text-black font-semibold
                    transition-all duration-300 flex items-center justify-between gap-3
                    bg-gradient-to-r ${toastType.type === "success" ? "from-green-300 via-pink-300 to-indigo-300 " : ""
                    } ${toastType.type === "error" ? "from-red-500 to-red-700" : ""} ${toastType.type === "info" ? "from-blue-500 to-blue-700" : ""
                    }
                  `}
                >
                  <span>{toastType.message}</span>
                  <button
                    onClick={() => removeStaticToast(toastType.id)}
                    className="ml-3 px-2 py-1 text-sm font-bold bg-yellow-300 border border-cyan-500 text-black rounded-lg hover:bg-gray-200 transition"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {/* Static Toast Container - Bottom Center */}
            <div className="fixed bottom-5 left-1/2 transform -translate-x-1/2 z-[9999] flex flex-col gap-2 items-center">
              {staticToasts.map((toastType) => (
                <div
                  key={toastType.id}
                  className={`
                    px-5 py-2 rounded-xl shadow-2xl text-black font-semibold
                    transition-all duration-300 flex items-center justify-between gap-3
                    bg-gradient-to-r ${toastType.type === "success" ? "from-green-300 via-pink-300 to-indigo-300 " : ""
                    } ${toastType.type === "error" ? "from-red-500 to-red-700" : ""} ${toastType.type === "info" ? "from-blue-500 to-blue-700" : ""
                    }
                  `}
                >
                  <span>{toastType.message}</span>
                  <button
                    onClick={() => removeStaticToast(toastType.id)}
                    className="ml-3 px-2 py-1 text-sm font-bold bg-yellow-300 border border-cyan-500 text-black rounded-lg hover:bg-gray-200 transition"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <PerPageSelect
                value={perPage}
                onChange={(v) => {
                  setPerPage(v);
                  setCurrentPage(1);
                }}
              />
              <span className="text-xs font-bold text-[var(--text-color)]">
                Showing : <strong>{flattenedSubscriptions.length}</strong> Subscription{flattenedSubscriptions.length === 1 ? "" : "s"}
                {" "}Across <strong>{skewTotal}</strong> our Plan{skewTotal === 1 ? "" : "s"}
              </span>
            </div>

            <SearchBar
              value={subscriptionPackageSearch}
              onChange={(v) => {
                setSubscriptionPackageSearch(v);
                setCurrentPage(1);
              }}
              placeholder={`Type & Search ${VISTA_STRATA_LEVEL} . . . 🏌️‍♂️`}
            />
          </div>

          {/* Table */}
          <div className="w-full overflow-x-auto rounded-xl border bg-[var(--content-bg)] text-[var(--text-color)]">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-[var(--content-bg)] text-[var(--text-color)]">
                <tr>
                  <th className="px-4 py-2 text-left">🟢</th>

                  {columns.map((col) => (
                    <th
                      key={col.key}
                      onClick={() => handleSort(col.key)}
                      className="px-4 py-2 text-left cursor-pointer select-none group"
                    >
                      <div className="flex items-center gap-1">
                        <span>{col.label}</span>
                        <span className="flex flex-col items-center text-[8px] transition-opacity">
                          <span
                            className={`${sortColumn === col.key && sortDirection === "asc" ? "text-blue-500 font-bold opacity-100" : "text-gray-400 opacity-0 group-hover:opacity-100"}`}
                            style={{ lineHeight: 0.8 }}
                          >
                            ▲
                          </span>
                          <span className="text-gray-400 text-[6px] leading-[1] opacity-0 group-hover:opacity-100">•</span>
                          <span
                            className={`${sortColumn === col.key && sortDirection === "desc" ? "text-blue-500 font-bold opacity-100" : "text-gray-400 opacity-0 group-hover:opacity-100"}`}
                            style={{ lineHeight: 0.8 }}
                          >
                            ▼
                          </span>
                        </span>
                      </div>
                    </th>
                  ))}

                  <th className="px-4 py-2 text-left whitespace-nowrap">Status</th>
                  <th className="px-4 py-2 text-left whitespace-nowrap">Paid</th>
                  <th className="px-4 py-2 text-left whitespace-nowrap">Auto Renew</th>
                  <th className="px-4 py-2 text-left whitespace-nowrap">Provider</th>
                  <th className="px-4 py-2 text-left whitespace-nowrap">Valid From</th>
                  <th className="px-4 py-2 text-left whitespace-nowrap">Valid Until</th>
                  <th className="px-4 py-2 text-left whitespace-nowrap">Created</th>
                  <th className="px-4 py-2 text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {flattenedSubscriptions.length === 0 && (
                  <tr>
                    <td colSpan={totalTableColumns} className="px-0">
                      <div className="w-full bg-gradient-to-r from-transparent via-red-500/10 to-transparent">
                        <div className="h-px w-full bg-gradient-to-r from-transparent via-red-500 to-transparent" />
                        <div className="px-4 py-10 text-center opacity-70">
                          No Active Subscriptions Found ⚓
                        </div>
                        <div className="h-px w-full bg-gradient-to-r from-transparent via-red-500 to-transparent" />
                      </div>
                    </td>
                  </tr>
                )}

                {flattenedSubscriptions.map(({ pkg, sub, provider }, index) => {
                  const autoNumber = (currentPage - 1) * perPage + index + 1;

                  return (
                    <tr
                      key={sub.subscriptionId}
                      className="
                        bg-[var(--content-bg)] text-[var(--text-color)]
                        hover:bg-[var(--text-color)]/10 dark:hover:bg-[var(--text-color)]/20
                        transition-colors duration-200
                      "
                    >
                      <td className="px-4 py-2 text-xs">{autoNumber}</td>

                      <td className="px-4 py-2 whitespace-nowrap" title={pkg.name}>{pkg.name ?? "—"}</td>
                      <td className="px-4 py-2"><MoneyDisplay amount={pkg.amount} currency={pkg.currency} /></td>
                      <td className="px-4 py-2 whitespace-nowrap">{formatPriceDuration(pkg.priceDuration)}</td>
                      <td className="px-4 py-2 whitespace-nowrap" title={pkg.terminalClusterName ?? ""}>
                        {pkg.terminalClusterName ?? "—"}
                      </td>
                      <td className="px-4 py-2"><StatusBadge label={sub.subscriptionStatus} tone="status" /></td>
                      <td className="px-4 py-2"><StatusBadge label={sub.subscriptionHasPaid} tone="haspaid" /></td>
                      <td className="px-4 py-2"><StatusBadge label={sub.subscriptionAutoRenew} tone="autorenew" /></td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {provider ? (
                          <span className="px-2 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 whitespace-nowrap">
                            {provider.providerName}
                          </span>
                        ) : (
                          <span>—</span>
                        )}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-xs"><DateDisplay value={sub.validFrom} /></td>
                      <td className="px-4 py-2 whitespace-nowrap text-xs"><DateDisplay value={sub.validUntil} /></td>
                      <td className="px-4 py-2 whitespace-nowrap text-xs"><DateDisplay value={sub.createdAt} /></td>

                      <td className="px-4 py-2 whitespace-nowrap">
                        <div className="flex items-center gap-2 flex-nowrap">
                          <button
                            onClick={() => openAutoRenewConfirm(pkg, sub)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-md border text-xs font-bold bg-blue-50 text-blue-800 border-blue-300 hover:bg-blue-100 transition whitespace-nowrap"
                          >
                            <RefreshCw className="w-3 h-3 shrink-0" />
                            Auto Renew
                          </button>

                          <button
                            onClick={() => openCancelConfirm(pkg, sub)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-md border text-xs font-bold bg-red-50 text-red-800 border-red-300 hover:bg-red-100 transition whitespace-nowrap"
                          >
                            <XCircle className="w-3 h-3 shrink-0" />
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>

            </table>
          </div>

          {/* Bottom Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 text-[var(--text-color)]">
            <div className="flex items-center gap-3">
              <PerPageSelect
                value={perPage}
                onChange={(v) => {
                  setPerPage(v);
                  setCurrentPage(1);
                }}
              />
              <span className="text-xs font-bold text-[var(--text-color)]">
                Showing : <strong>{flattenedSubscriptions.length}</strong> Subscription{flattenedSubscriptions.length === 1 ? "" : "s"}
                {" "}Across <strong>{skewTotal}</strong> our Plan{skewTotal === 1 ? "" : "s"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-3 py-1 rounded-md border font-bold disabled:opacity-40 bg-[var(--content-bg)] text-[var(--text-color)]"
              >
                Prior
              </button>

              {getVisiblePages(currentPage, totalPages).map((p, i) =>
                p === "ellipsis" ? (
                  <span key={`ellipsis-${i}`} className="px-2 text-sm opacity-60 select-none">
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`px-3 py-2 rounded-md border text-sm ${p === currentPage
                      ? "bg-blue-400 border-red-500 text-white"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    {p}
                  </button>
                )
              )}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-3 py-1 rounded-md border font-bold disabled:opacity-40 bg-[var(--content-bg)] text-[var(--text-color)]"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        <hr className="my-4 h-px border-0 bg-gradient-to-r from-transparent via-[var(--text-color)] to-transparent" />

        {/* Dynamic Vista Quote */}
        <div className="w-full flex justify-center items-center py-4">
          <div className="
              max-w-5xl w-full
              text-center
              px-6 py-4
              rounded-2xl
              border
              backdrop-blur-xl
              bg-gradient-to-r
              from-purple-500/10
              via-pink-500/10
              to-cyan-500/10
              shadow-lg
              transition-all duration-500
            "
          >
            <div className="flex flex-col md:flex-row justify-center items-center gap-2 text-sm md:text-base">
              <span className="font-bold tracking-wide text-[var(--text-color)]">
                {randomQuote.quoteTitle}
              </span>
              <span className="opacity-70 text-[var(--text-color)]">
                — {randomQuote.quoteDescription}
              </span>
            </div>
          </div>
        </div>

        <hr className="my-4 h-px border-0 bg-gradient-to-r from-transparent via-[var(--text-color)] to-transparent" />
      </main>

      <ConfirmActionModal
        action={pendingAction}
        onDismiss={() => setPendingAction(null)}
        onConfirm={handleConfirmAction}
        isSubmitting={isSubmittingAction}
      />
    </>
  );
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End By : B.L.S.M.C ;  -  Skewblanc - The Winds Chase Us ⚓
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────