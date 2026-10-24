"use client";

import { useState, useEffect, useRef } from "react";

interface FlatQuestion {
  question: { guidId?: string; type?: string; id?: number; savedUserAnswer?: unknown };
  sectionName: string;
  sectionId: number;
  sectionGuidId: string;
  globalIndex: number;
  total: number;
}

export function LeftSideBar({
  flat,
  currentIndex,
  onJump,
}: {
  flat: FlatQuestion[];
  currentIndex: number;
  onJump: (n: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const total = flat.length;
  const activeRef = useRef<HTMLButtonElement | null>(null);

  // Track answered from exam:state broadcasts (mirrors MenuNavigator pattern)
  const [answeredIds, setAnsweredIds] = useState<Set<number>>(new Set());
  const [liveCurrentIndex, setLiveCurrentIndex] = useState(currentIndex);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (typeof detail.currentIndex === "number") setLiveCurrentIndex(detail.currentIndex);
    };
    window.addEventListener("exam:state", handler);
    setTimeout(() => window.dispatchEvent(new CustomEvent("exam:state:request")), 0);
    return () => window.removeEventListener("exam:state", handler);
  }, []);

  // Derive answered from savedUserAnswer on flat questions
  useEffect(() => {
    const ids = new Set<number>();
    flat.forEach((item) => {
      if (item.question.savedUserAnswer != null && item.question.id != null) {
        ids.add(item.question.id);
      }
    });
    setAnsweredIds(ids);
  }, [flat]);

  useEffect(() => {
    setLiveCurrentIndex(currentIndex);
  }, [currentIndex]);

  useEffect(() => {
    if (open && activeRef.current) {
      activeRef.current.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [open, liveCurrentIndex]);

  const answeredCount = flat.filter(item =>
    item.question.id != null && answeredIds.has(item.question.id)
  ).length;
  const unansweredCount = total - answeredCount;

  return (
    <>

      {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

      {/* TRIGGER BUTTON */}
      {!open && !hidden && (
        <button
          onClick={() => setOpen(true)}
          title="Open Question List"
          className="hidden md:flex fixed left-1 top-1/2 -translate-y-1/2 z-[500] flex-col items-center justify-center gap-1 rounded-full border-2 shadow-lg transition-all duration-300 ease-out hover:-translate-y-[60%] hover:scale-105 group"
          style={{
            width: "36px",
            minHeight: "110px",
            paddingTop: "14px",
            paddingBottom: "14px",
            backgroundColor: "var(--exam-upper-nav-bg, #4f46e5)",
          }}
        >
          {[0, 1, 2].map((k) => (
            <span
              key={k}
              className="block rounded-full transition-transform duration-300 group-hover:translate-y-[1px]"
              style={{
                width: "12px",
                height: "2.5px",
                backgroundColor: "var(--exam-upper-nav-text, #fff)",
                opacity: 0.9,
              }}
            />
          ))}

          <span
            className="mt-2 flex items-center justify-center rounded-md border font-black"
            style={{
              width: "32px",
              height: "22px",
              fontSize: "9px",
              color: "var(--exam-upper-nav-text, #fff)",
            }}
          >
            {currentIndex + 1}
          </span>

          {/* Large blinking status dot */}
          <span
            className="mt-2 rounded-full animate-pulse"
            style={{
              width: "14px",
              height: "14px",
              backgroundColor: "var(--exam-upper-nav-text, #fff)",
              boxShadow: "0 0 10px rgba(255,255,255,0.8)",
            }}
          />
        </button>
      )}

      {hidden && !open && (
        <button
          onClick={() => setHidden(false)}
          title="Show Question Navigator"
          className="hidden md:flex fixed left-3 bottom-24 z-[200] items-center justify-center rounded-full border-2 shadow-lg transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-110"
          style={{
            width: "38px",
            height: "38px",
            backgroundColor: "var(--exam-upper-nav-bg, #4f46e5)",
            color: "var(--exam-upper-nav-text, #fff)",
            fontSize: "18px",
          }}
        >
          ☰
        </button>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

      {/* DRAWER */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-[300] bg-black/30 backdrop-blur-[1px]"
            onClick={() => setOpen(false)}
          />

          <div
            className="fixed left-0 z-[1000] flex flex-col shadow-2xl border-2 rounded-2xl"
            style={{
              top: "calc(var(--glacial-nav-offset, 0px) + var(--glacial-question-header-h, 0px))",
              bottom: "var(--glacial-footer-h, 56px)",
              width: "230px",
              backgroundColor: "var(--exam-upper-nav-bg, #4338ca)",
              color: "var(--exam-upper-nav-text, #fff)",
            }}
          >
            {/* HEADER */}
            <div
              className="flex items-center justify-between px-3 pt-2 border-b flex-shrink-0"
              style={{ borderColor: "rgba(255,255,255,0.15)" }}
            >
              <span className="text-xs font-black uppercase tracking-widest opacity-80">Questions</span>
              <div className="flex items-center gap-2 border-2 rounded-2xl px-2 hover:bg-red-300">
                <button
                  onClick={() => { setOpen(false); setHidden(true); }}
                  className="transition text-[11px] font-bold px-1.5 py-0.5"
                >
                  Hide
                </button>
                <button onClick={() => setOpen(false)} className="transition text-lg leading-none">
                  ✕
                </button>
              </div>
            </div>

            {/* Devider */}
            <div className="border-b my-1" />

            {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

            {/* STATS BAR */}
            <div className="px-3 pb-2 border-b flex-shrink-0">
              {/* Progress bar */}
              <div className="h-1 w-full rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${((liveCurrentIndex + 1) / total) * 100}%` }}
                />
              </div>

              {/* Stats row */}
              <div className="flex items-center justify-between text-[9px] font-bold">
                <span className="opacity-60">At Qn {liveCurrentIndex + 1} of {total}</span>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full inline-block" />
                    Answered {answeredCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full inline-block" />
                    Remaining {unansweredCount}
                  </span>
                </div>
              </div>

              {/* Indicators legend */}
              <div className="flex items-center gap-3 text-[12px]">
                <span className="flex items-center gap-1"><span className="w-3.5 h-3.5 border rounded-full bg-green-700 inline-block" /> Answered</span>
                <span className="flex items-center gap-1"><span className="w-3.5 h-3.5 border rounded-full bg-red-700 inline-block" /> Open</span>
                <span className="flex items-center gap-1"><span className="w-3.5 h-3.5 border rounded-full bg-yellow-200 inline-block" /> Current</span>
              </div>
            </div>

            {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

            {/* QUESTION LIST */}
            <div className="flex-1 overflow-y-auto overscroll-contain py-1 
            [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:
            bg-white [&::-webkit-scrollbar-thumb]:bg-red-300 
            [&::-webkit-scrollbar-thumb]:rounded-full
             hover:[&::-webkit-scrollbar-thumb]:bg-yellow-600">
              {flat.map((item, i) => {
                const active = i === liveCurrentIndex;
                const isAnswered = item.question.id != null && answeredIds.has(item.question.id);
                const qType = item.question.type ?? "Question";

                return (
                  <button
                    key={item.question.guidId ?? i}
                    ref={active ? activeRef : undefined}
                    onClick={() => { onJump(i + 1); setOpen(false); }}
                    title={qType}
                    className={`
                      w-full flex items-center gap-2 px-2.5 py-1.5 text-left transition-all
                      ${active
                        ? "bg-yellow-300 font-bold border rounded-2xl hover:bg-yellow-500 hover:text-black"
                        : isAnswered
                          ? "hover:bg-purple-900 rounded-2xl hover:text-white font-normal"
                          : "hover:bg-green-300 rounded-2xl hover:text-black font-normal"
                      }
                    `}
                  >
                    {/* Number bubble */}
                    <span
                      className={`
                        flex-shrink-0 flex items-center justify-center border rounded-full font-black text-[12px]
                        ${active
                          ? "bg-black text-white w-12 h-5"
                          : isAnswered
                            ? "bg-green-200 text-black w-12 h-5"
                            : "bg-white text-red-800 w-12 h-5"
                        }
                      `}
                    >
                      {i + 1}
                    </span>

                    {/* Label */}
                    <span className="flex-1 min-w-0">
                      <span className="block truncate text-[9px] opacity-50 leading-none mb-0.5">{qType}</span>
                      <span className="flex items-center gap-1">
                        <span
                          className={`
                            text-[10px] font-semibold px-1.5 py-0.5 rounded-full leading-none
                            ${active
                              ? "bg-black text-white"
                              : isAnswered
                                ? "bg-green-700 text-white"
                                : "bg-yellow-200 border text-red"
                            }
                          `}
                        >
                          {active ? "Current" : isAnswered ? "Answered" : "Open"}
                        </span>
                      </span>
                    </span>
                    {/* Right-side Open badge */}
                    <span
                      className="
                      flex-shrink-0
                      text-[9px]
                      font-bold
                      px-1.5 py-0.5
                      rounded-full
                      bg-green-800
                      text-white
                    "
                    >
                      Click to Open
                    </span>
                  </button>
                );
              })}
            </div>

            {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

            {/* FOOTER SUMMARY */}
            <div
              className="px-3 py-2 border-t flex-shrink-0 text-[9px] text-center opacity-60"
              style={{ borderColor: "rgba(255,255,255,0.1)" }}
            >
              {answeredCount} Answered · {unansweredCount} Remaining · {total} Total ⚓
            </div>

          </div>

          {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

        </>
      )}
    </>
  );
}