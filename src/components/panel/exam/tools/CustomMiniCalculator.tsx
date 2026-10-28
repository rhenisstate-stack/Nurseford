"use client";

import React, { useState } from "react";

export function CustomMiniCalculator() {
    const [display, setDisplay] = useState("0");
    const [prev, setPrev] = useState<string | null>(null);
    const [op, setOp] = useState<string | null>(null);
    const [fresh, setFresh] = useState(false);
    const [history, setHistory] = useState<string[]>([]);

    const press = (val: string) => {
        if (["+", "-", "×", "÷", "%"].includes(val)) {
            setPrev(display);
            setOp(val);
            setFresh(true);
            return;
        }

        if (val === "=") {
            if (!prev || !op) return;

            const a = parseFloat(prev);
            const b = parseFloat(display);

            const res =
                op === "+" ? a + b :
                op === "-" ? a - b :
                op === "×" ? a * b :
                op === "÷" ? (b !== 0 ? a / b : 0) :
                op === "%" ? a % b : 0;

            const resultStr = String(parseFloat(res.toFixed(10)));

            setHistory(h => [`${prev} ${op} ${display} = ${resultStr}`, ...h.slice(0, 4)]);
            setDisplay(resultStr);
            setPrev(null);
            setOp(null);
            setFresh(false);
            return;
        }

        if (val === "C") {
            setDisplay("0");
            setPrev(null);
            setOp(null);
            setFresh(false);
            return;
        }

        if (val === "±") {
            setDisplay(d => (d.startsWith("-") ? d.slice(1) : "-" + d));
            return;
        }

        if (val === ".") {
            if (!display.includes(".")) {
                setDisplay((fresh ? "0" : display) + ".");
            }
            setFresh(false);
            return;
        }

        setDisplay(fresh ? val : display === "0" ? val : display + val);
        setFresh(false);
    };

    const keys = [
        ["C", "±", "%", "÷"],
        ["7", "8", "9", "×"],
        ["4", "5", "6", "-"],
        ["1", "2", "3", "+"],
        ["⌫", "0", ".", "="],
    ];

    return (
        <div className="space-y-3">
            <div className="bg-slate-950 rounded-xl p-3 text-right">
                {op && (
                    <div className="text-slate-500 text-xs font-mono mb-0.5">
                        {prev} {op}
                    </div>
                )}
                <div className="text-white font-mono text-2xl font-bold truncate">
                    {display}
                </div>
            </div>

            {history.length > 0 && (
                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-2 max-h-20 overflow-y-auto">
                    {history.map((h, i) => (
                        <div key={i} className="text-[10px] font-mono text-slate-400">
                            {h}
                        </div>
                    ))}
                </div>
            )}

            <div className="grid grid-cols-4 gap-1.5">
                {keys.flat().map(k => (
                    <button
                        key={k}
                        onClick={() =>
                            k === "⌫"
                                ? setDisplay(d => (d.length > 1 ? d.slice(0, -1) : "0"))
                                : press(k)
                        }
                        className={`
                            text-sm font-bold py-3 rounded-xl transition-all active:scale-95
                            ${k === "=" ? "bg-blue-600 text-white"
                              : k === "C" ? "bg-red-500 text-white"
                              : ["÷","×","-","+"].includes(k) ? "bg-amber-500 text-white"
                              : "bg-slate-200 dark:bg-slate-700"}
                        `}
                    >
                        {k}
                    </button>
                ))}
            </div>
        </div>
    );
}


