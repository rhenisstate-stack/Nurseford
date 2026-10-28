"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
    src: string;
    alt: string;
}

export default function ImageViewer({ src, alt }: Props) {
    const [open, setOpen] = useState(false);
    const [scale, setScale] = useState(1);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setOpen(false);
                setScale(1);
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    const close = () => {
        setScale(1);
        setOpen(false);
    };

    return (
        <>
            {/* Thumbnail */}
            <motion.div
                layoutId="image-zoom"
                onClick={() => { setOpen(true); setScale(1); }}
                className="relative max-w-xs w-full aspect-video cursor-zoom-in rounded-md overflow-hidden border hover:opacity-90 transition"
                style={{ borderRadius: 8 }}
            >
                <Image
                    src={src}
                    alt={alt}
                    fill
                    className="object-contain select-none"
                    draggable={false}
                />
            </motion.div>

            {/* MODAL */}
            <AnimatePresence>
                {open && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            key="backdrop"
                            className="fixed inset-0 z-40 bg-black/90"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={close}
                        />

                        {/* Expanded image */}
                        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
                            <motion.div
                                layoutId="image-zoom"
                                className="relative pointer-events-auto"
                                style={{
                                    width: "80vw",
                                    maxWidth: 1000,
                                    aspectRatio: "16/9",
                                    borderRadius: 12,
                                    overflow: "hidden",
                                }}
                            >
                                <motion.div
                                    className="w-full h-full"
                                    animate={{ scale }}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                >
                                    <Image
                                        src={src}
                                        alt={alt}
                                        fill
                                        className="object-contain select-none"
                                        draggable={false}
                                    />
                                </motion.div>
                            </motion.div>
                        </div>

                        {/* BOTTOM TOOLBAR */}
                        <motion.div
                            key="toolbar"
                            className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex gap-2 bg-black/60 backdrop-blur px-4 py-2 rounded-xl"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                        >
                            <button onClick={() => setScale((s) => Math.min(s + 0.2, 3))} className="text-white px-2">➕</button>
                            <button onClick={() => setScale((s) => Math.max(s - 0.2, 0.5))} className="text-white px-2">➖</button>
                            <button onClick={() => setScale(1)} className="text-white px-2">Reset</button>
                            <div className="w-px bg-white/20 mx-1" />
                            <button onClick={close} className="text-white px-2">✕ Close</button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}