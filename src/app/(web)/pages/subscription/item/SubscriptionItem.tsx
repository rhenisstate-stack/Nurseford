"use client";

import { useMemo, useState } from "react";
import { useDistinctDominionSubscriptionItems } from "@/lib/hooks/nexus/subscription/items/distinct/useDistinctDominionSubscriptionItems";
import { dominionService } from "@/lib/services/nexus/dominion/dominionService";

interface SubscriptionItemProps {
    parentTableName: string;
    parentName: string;
    dashboardName?: string;
    heading?: string;
    subheading?: string;
    perPage?: number;
    showSearch?: boolean;
    onSubscribe?: (item: { guidId?: string; id: number; name: string }) => void;
}

export default function SubscriptionItem({
    parentTableName,
    parentName,
    dashboardName = "",
    heading = "Exam Prep Plans",
    subheading,
    perPage = 50,
    showSearch = true,
    onSubscribe,
}: SubscriptionItemProps) {
    // ── Data Hook: untouched, purely dynamic ──
    const {
        filteredSubscriptionItems,
        subscriptionItemSearch,
        setSubscriptionItemSearch,
        skewTotal,
    } = useDistinctDominionSubscriptionItems({
        parentTableName,
        parentName,
        page: 1,
        perPage,
        sortDirection: "asc",
    });

    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const sortedItems = useMemo(() =>
        [...filteredSubscriptionItems].sort(
            (a, b) => (a.cardNumber ?? 0) - (b.cardNumber ?? 0)
        ),
        [filteredSubscriptionItems]
    );

    // ── Checkout / Subscription action: untouched ──
    const handleSubscribe = async (item: (typeof sortedItems)[number]) => {
        if (onSubscribe) {
            onSubscribe(item);
            return;
        }

        setErrorMessage(null);

        const returnUrl = `${window.location.origin}/pages/subscription/package?dashboard=${encodeURIComponent(dashboardName)}`;

        const result = await dominionService("SubscriptionPackage", "Store", {
            subscriptionItemId: item.id,
            subscriptionItemGuidId: item.guidId,
            returnUrl,
        });

        if (result?.error) {
            console.error("🔔 Subscription Failed :", result.error);
            setErrorMessage(typeof result.error === "string" ? result.error : "Subscription failed ⚓");
            return;
        }

        const redirectUrl = (result as { redirectUrl?: string } | undefined)?.redirectUrl;
        if (redirectUrl) {
            window.location.href = redirectUrl;
            return;
        }

        console.log("🔔 Subscribed:", result);
    };

    const formatDuration = (raw?: unknown) => {
        if (raw === undefined || raw === null || raw === "") return null;
        if (typeof raw === "string" && isNaN(Number(raw))) {
            const clean = raw.trim();
            return clean.startsWith("/") ? clean : `/ ${clean}`;
        }
        const num = Number(raw);
        if (isNaN(num) || num <= 0) return null;

        const totalDays = num >= 1440 ? Math.round(num / (60 * 24)) : num;

        if (totalDays >= 28) {
            const months = Math.round(totalDays / 30);
            return `/ ${months} month${months !== 1 ? "s" : ""}`;
        }

        const days = Math.max(1, Math.round(totalDays));
        return `/ ${days} day${days !== 1 ? "s" : ""}`;
    };

    const formatAmount = (amount?: number, currency?: string | null) => {
        if (amount === undefined || amount === null) return null;
        try {
            return new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: currency || "USD",
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
            }).format(amount);
        } catch {
            return `${currency ?? "USD"} ${amount}`;
        }
    };

    return (
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
            {/* Header: Visible in both Light and Dark mode */}
            <div className="mb-8 text-center max-w-2xl mx-auto">
                <span className="inline-block font-mono text-xs tracking-widest uppercase text-teal-600 dark:text-teal-400 font-semibold mb-1.5">
                    SUBSCRIPTION PLANS
                </span>
                <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 dark:text-white tracking-tight">
                    {heading}
                </h2>
                <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300 font-normal">
                    {subheading ?? `Choose the Package that Fits your Prime Timeline. ${skewTotal} Plan${skewTotal !== 1 ? "s" : ""} Available.`}
                </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
                <div className="mb-8 flex justify-center">
                    <div className="flex w-full max-w-md items-center justify-between gap-3 rounded-xl border border-rose-500/30 bg-rose-950/60 backdrop-blur-sm px-5 py-4 text-center shadow-lg">
                        <p className="text-sm font-semibold text-rose-200">{errorMessage}</p>
                        <button
                            type="button"
                            onClick={() => setErrorMessage(null)}
                            className="rounded p-1 text-rose-300 hover:text-white font-bold cursor-pointer"
                            aria-label="Dismiss"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}

            {/* Search Input */}
            {showSearch && (
                <div className="mb-8 flex justify-center">
                    <input
                        type="text"
                        value={subscriptionItemSearch}
                        onChange={(e) => setSubscriptionItemSearch(e.target.value)}
                        placeholder="Search plans…"
                        className="w-full max-w-md rounded-xl border border-slate-300 dark:border-white/20 bg-white dark:bg-slate-900/80 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 shadow-sm focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                    />
                </div>
            )}

            {/* Empty state */}
            {sortedItems.length === 0 && (
                <p className="text-center text-slate-500 dark:text-slate-400 py-8">No Plans Found ⚓</p>
            )}

            {/* Cards Grid */}
            <div
                className={`grid gap-6 ${
                    sortedItems.length === 1
                        ? "grid-cols-1 max-w-md mx-auto"
                        : sortedItems.length === 2
                        ? "grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto"
                        : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                }`}
            >
                {sortedItems.map((item) => {
                    const style = item.style;

                    const titleBg = style?.titleBackground ?? "#2563EB";
                    const titleColor = style?.titleColor ?? "#FFFFFF";
                    const bodyGradient =
                        style?.bodyGradientStart && style?.bodyGradientEnd
                            ? `linear-gradient(${style.bodyGradientDirection ?? "to bottom"}, ${style.bodyGradientStart}, ${style.bodyGradientEnd})`
                            : undefined;

                    const footerBg = style?.footerButtonBackground ?? titleBg;
                    const footerColor = style?.footerButtonColor ?? "#FFFFFF";
                    const footerText = style?.footerButtonText || "Subscribe Now";

                    const priceLabel = formatAmount(item.amount, item.currency);
                    const durationLabel = formatDuration(item.priceDuration || item.duration);

                    return (
                        <div
                            key={item.guidId ?? item.id}
                            className="relative flex flex-col transition-transform duration-200 hover:-translate-y-1"
                        >
                            {/* Featured Tag: dynamic only if item.isFeatured */}
                            {item.isFeatured && (
                                <div className="absolute left-3 -top-3 z-20 flex items-center gap-1 rounded-full bg-indigo-600 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-md">
                                    ⭐ Featured
                                </div>
                            )}

                            {/* Badge Tag: dynamic only if style.badgeName exists */}
                            {style?.badgeName && (
                                <div
                                    className="absolute right-3 -top-3 z-20 rounded-full px-3.5 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow-md border border-white/20"
                                    style={{
                                        background: style.badgeBackground ?? "#FFFFFF",
                                        color: style.badgeColor ?? "#EF4444",
                                        fontSize: style.badgeFontSize,
                                    }}
                                >
                                    {style.badgeName}
                                </div>
                            )}

                            {/* Card Body: dark visible navy card styling */}
                            <div
                                className="flex flex-1 flex-col overflow-hidden rounded-2xl border-2 border-slate-700/80 hover:border-cyan-400/50 bg-[#0B192C] shadow-xl hover:shadow-2xl transition-all duration-300"
                                style={{ background: bodyGradient || "#0B192C" }}
                            >
                                {/* Title Bar */}
                                <div
                                    className="flex items-center justify-between px-6 py-4"
                                    style={{ background: titleBg, color: titleColor }}
                                >
                                    <h3
                                        className="font-serif text-xl sm:text-2xl font-bold uppercase tracking-wider pr-4"
                                        style={{ fontSize: style?.titleFontSize }}
                                    >
                                        {item.name}
                                    </h3>
                                </div>

                                {/* Content Section */}
                                <div className="flex flex-1 flex-col gap-3.5 p-6">
                                    {/* Price and Duration */}
                                    {priceLabel && (
                                        <div className="flex items-baseline">
                                            <span className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                                                {priceLabel}
                                            </span>
                                            {durationLabel && (
                                                <span className="text-base sm:text-lg font-semibold text-white/80 ml-1.5">
                                                    {durationLabel}
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* Discount / Comparison: purely dynamic if planPrice is in item */}
                                    {item.planPrice && item.planPrice > (item.amount ?? 0) && (
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400">
                                            <span>Was {formatAmount(item.planPrice, item.currency)}</span>
                                            <span>➡️</span>
                                            <span>Now {priceLabel}</span>
                                        </div>
                                    )}

                                    {/* Description */}
                                    {item.description && (
                                        <p
                                            className="text-sm leading-relaxed text-slate-200"
                                            style={{ color: style?.descriptionColor, fontSize: style?.descriptionFontSize }}
                                        >
                                            {item.description}
                                        </p>
                                    )}

                                    {/* Duration / Plan info if available */}
                                    {item.duration && (
                                        <p className="text-xs font-medium text-slate-400">
                                            Access length: {item.duration}
                                        </p>
                                    )}

                                    {item.plan && (
                                        <p className="text-xs font-medium text-slate-400">
                                            Plan: {item.plan}
                                        </p>
                                    )}

                                    {/* Features Box: visible translucent styling */}
                                    {item.features && (
                                        <div
                                            className="mt-1 max-h-88 overflow-y-auto rounded-xl border border-white/10 bg-slate-800/60 p-4 pr-3 text-sm text-slate-200 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-400 [&_*]:!bg-transparent [&_*]:!text-slate-200 [&_ul]:!space-y-2 [&_ul]:!p-0 [&_ul]:!m-0 [&_li]:!leading-relaxed"
                                            style={{ fontSize: style?.bodyFontSize }}
                                            dangerouslySetInnerHTML={{ __html: item.features }}
                                        />
                                    )}
                                </div>

                                {/* Subscribe Button */}
                                <div className="px-6 pb-6 pt-1">
                                    <button
                                        type="button"
                                        onClick={() => handleSubscribe(item)}
                                        className="w-full rounded-xl py-3 px-4 text-sm sm:text-base font-bold shadow-lg transition-all duration-200 hover:opacity-95 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                                        style={{
                                            background: footerBg,
                                            color: footerColor,
                                            fontSize: style?.footerButtonFontSize,
                                        }}
                                    >
                                        <span>{footerText}</span>
                                        <span className="text-base font-black">→</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End By : B.L.S.M.C ;  Skewblanc - The Winds Chase Us ⚓
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
