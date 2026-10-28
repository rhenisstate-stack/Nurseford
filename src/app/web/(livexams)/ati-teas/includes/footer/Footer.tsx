"use client";

import { useThemeContext } from "@/lib/contexts/panel/layout/theme/PanelThemeContext";
import { useLeftSidebar } from "@/lib/contexts/panel/layout/includes/sidebar/LeftSidebarContext";
import { useRightSidebar } from "@/lib/contexts/panel/layout/includes/sidebar/RightSidebarContext";
import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function Footer() {
  const { theme } = useThemeContext();
  const leftSidebar = useLeftSidebar();
  const rightSidebar = useRightSidebar();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => setIsClient(true), []);

  // Theme handling
  const effectiveFooterTheme = theme.footer === "system" ? theme.global : theme.footer;
  const isLightFooter = effectiveFooterTheme === "light";

  // Sidebar widths
  const getSidebarWidth = (sidebar: { isClosed: boolean; isOpened: boolean }) => {
    if (!isClient) return 0;
    if (sidebar.isClosed) return 0;
    if (sidebar.isOpened) return 256;
    return 80;
  };

  const leftWidth = getSidebarWidth(leftSidebar);
  const rightWidth = getSidebarWidth(rightSidebar);

  return (
    <footer
      className="transition-all duration-300 ease-in-out text-sm py-4 px-4 border-t"
      style={{
        marginLeft: leftWidth,
        marginRight: rightWidth,
        width: `calc(100% - ${leftWidth + rightWidth}px)`,
        backgroundColor: "var(--footer-bg)",
        color: "var(--text-color)",
      }}
    >

      <div className="mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Copyright */}
          <div className="text-center md:text-left">
            &copy; {new Date().getFullYear()} Castoline. All rights reserved.
          </div>

          {/* Links */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 w-full md:w-auto">
            {[
              { href: "/privacy", label: "Privacy Policy" },
              { href: "/terms", label: "Terms of Service" },
              { href: "/contact", label: "Contact Us" },
              { href: "/docs", label: "Documentation" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`hover:text-blue-600 transition-colors text-nowrap ${isLightFooter ? "text-[var(--text-color)] hover:text-blue-600" : "text-[var(--text-color)] hover:text-blue-400"
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* System Status / Social */}
          <div className="flex items-center gap-3">
            <span className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
              System Status
            </span>
            <div className="flex gap-2">
              {/* Twitter */}
              <a href="#" aria-label="Twitter" className="hover:opacity-75 transition-opacity">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              {/* GitHub */}
              <a href="#" aria-label="GitHub" className="hover:opacity-75 transition-opacity">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Version */}
        <div className={`mt-4 text-xs text-center ${isLightFooter ? "text-gray-500" : "text-[var(--text-color)]"}`}>
          v{process.env.SKEW_LINE_APP_VERSION || "1.0.0"} • Built with Next.js
        </div>
      </div>
    </footer>
  );
}
