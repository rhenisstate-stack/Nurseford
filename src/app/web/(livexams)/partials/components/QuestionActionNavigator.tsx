"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Bell, Star, Pin, Bookmark, Flag, X } from "lucide-react";
import { useLiveStrataExamContext } from "@/lib/contexts/panel/assessment/LiveStrataExamContext";

type Kind = "star" | "pin" | "bookmark" | "flag";

const KINDS: { key: Kind; json: string; label: string; Icon: typeof Star; on: string; chip: string }[] = [
    { key: "star", json: "Star", label: "Starred", Icon: Star, on: "bg-yellow-400 text-black", chip: "border-yellow-400 hover:bg-yellow-400/20" },
    { key: "pin", json: "Pin", label: "Pinned", Icon: Pin, on: "bg-green-500 text-white", chip: "border-green-500 hover:bg-green-500/20" },
    { key: "bookmark", json: "Bookmark", label: "Bookmarked", Icon: Bookmark, on: "bg-blue-500 text-white", chip: "border-blue-500 hover:bg-blue-500/20" },
    { key: "flag", json: "Flag", label: "Flagged", Icon: Flag, on: "bg-red-500 text-white", chip: "border-red-500 hover:bg-red-500/20" },
];

const isOn = (v: unknown): boolean => {
    if (v === undefined || v === null || v === false || v === "") return false;
    if (typeof v === "string") return v.toLowerCase() !== "false";
    if (typeof v === "object") {
        const o = v as { ActionValue?: unknown; Value?: unknown; value?: unknown };
        const val = o.ActionValue ?? o.Value ?? o.value;
        return val === undefined ? true : isOn(val);
    }
    return !!v;
};

export default function QuestionActionNavigator() {
    const { examSession } = useLiveStrataExamContext();
    const [open, setOpen] = useState(false);
    const [tab, setTab] = useState<Kind>("bookmark");
    const [overrides, setOverrides] = useState<Record<number, Partial<Record<Kind, boolean>>>>({});

    // Live updates from QuestionToolbar
    useEffect(() => {
        const h = (e: Event) => {
            const { questionId, kind, value } = (e as CustomEvent).detail as { questionId: number; kind: Kind; value: boolean };
            setOverrides((prev) => ({ ...prev, [questionId]: { ...prev[questionId], [kind]: value } }));
        };
        window.addEventListener("exam:question:action", h);
        return () => window.removeEventListener("exam:question:action", h);
    }, []);

    useEffect(() => {
        if (!open) return;
        const h = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
        document.addEventListener("keydown", h);
        return () => document.removeEventListener("keydown", h);
    }, [open]);

    const items = useMemo(() => {
        const all = (examSession?.sections ?? []).flatMap((s) => s.questions ?? []);
        return all.map((q, i) => {
            const state: Record<Kind, boolean> = { star: false, pin: false, bookmark: false, flag: false };
            const seen: Record<Kind, boolean> = { star: false, pin: false, bookmark: false, flag: false };
            for (const a of q.questionActions ?? []) {
                let p: Record<string, unknown> = {};
                try { p = JSON.parse(a.actionContent ?? "{}"); } catch { /* noop */ }
                for (const k of KINDS) {
                    if (p[k.json] !== undefined && !seen[k.key]) {
                        seen[k.key] = true;
                        state[k.key] = isOn(p[k.json]);
                    }
                }
            }
            return { q, number: i + 1, state: { ...state, ...overrides[q.id] } as Record<Kind, boolean> };
        });
    }, [examSession, overrides]);

    const counts = useMemo(() => {
        const c: Record<Kind, number> = { star: 0, pin: 0, bookmark: 0, flag: 0 };
        items.forEach((it) => KINDS.forEach((k) => { if (it.state[k.key]) c[k.key]++; }));
        return c;
    }, [items]);

    const total = counts.star + counts.pin + counts.bookmark + counts.flag;
    const visible = items.filter((it) => it.state[tab]);
    const activeKind = KINDS.find((k) => k.key === tab)!;

    const jump = (q: { id: number; guidId?: string }, number: number) => {
        window.dispatchEvent(
            new CustomEvent("exam:goto:question", { detail: { questionId: q.id, questionGuidId: q.guidId, number } })
        );
        setTimeout(() => {
            document.getElementById(`question-${q.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 60);
        setOpen(false);
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                title="Starred / Pinned / Bookmarked / Flagged"
                style={{ fontSize: "var(--exam-upper-nav-font-sm)" }}
                className="relative flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 hover:from-violet-700 hover:via-blue-700 hover:to-cyan-600 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all duration-300 hover:scale-105 active:scale-95"
            >
                <Bell size={14} />
                <span className="hidden md:inline">Marked</span>
                {total > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center shadow-md">
                        {total}
                    </span>
                )}
            </button>

            {open && typeof document !== "undefined" && createPortal(
                <div
                    className="fixed inset-0 z-[10100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                    onMouseDown={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
                >
                    <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800">
                            <span className="text-sm font-black text-slate-800 dark:text-white">Navigate to Marked Questions</span>
                            <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all">
                                <X size={15} />
                            </button>
                        </div>

                        <div className="grid grid-cols-4 gap-2 p-4">
                            {KINDS.map(({ key, label, Icon, on }) => (
                                <button
                                    key={key}
                                    onClick={() => setTab(key)}
                                    className={`flex flex-col items-center gap-1 py-2 rounded-xl border text-[10px] font-bold transition-all active:scale-95 ${tab === key
                                        ? `${on} border-transparent shadow-md`
                                        : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300 hover:border-slate-400"}`}
                                >
                                    <Icon size={14} />
                                    <span>{label}</span>
                                    <span className="text-sm font-black leading-none">{counts[key]}</span>
                                </button>
                            ))}
                        </div>

                        <div className="px-4 pb-4">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                                {activeKind.label} — click to jump
                            </p>
                            <div className="max-h-64 overflow-y-auto">
                                {visible.length === 0 ? (
                                    <p className="py-8 text-center text-xs text-slate-400">Nothing {activeKind.label.toLowerCase()} yet ⚓</p>
                                ) : (
                                    <div className="grid grid-cols-5 gap-2">
                                        {visible.map(({ q, number }) => (
                                            <button
                                                key={q.id}
                                                onClick={() => jump(q, number)}
                                                className={`py-1.5 rounded-lg border text-xs font-bold text-slate-700 dark:text-slate-200 transition-all hover:scale-105 active:scale-95 ${activeKind.chip}`}
                                            >
                                                Q{number}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}