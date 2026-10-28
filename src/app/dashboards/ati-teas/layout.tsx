// castoline/src/app/dashboards/admin/layout.tsx

import Navbar from "./includes/navbar/Navbar";
import LeftSidebar from "./includes/sidebar/left/LeftSidebar";
import RightSidebar from "./includes/sidebar/right/RightSidebar";
import Footer from "./includes/footer/Footer";
import ScrollToTopButton from "@/components/common/ScrollToTopButton";
import DashboardPreloader from "@/components/common/dashboards/elements/DashboardPreloader";
import type { Metadata } from "next";
import { APP_TITLE } from "@/lib/config/config";
import "@/styles/dashboards/sidebars/left/global.css";
import "@/styles/dashboards/sidebars/right/global.css";
import "@/styles/dashboards/nexus/strata/hierarchy/global.css";

// Toggle to re-enable the right sidebar rail on this route
const SHOW_RIGHT_SIDEBAR = false;

export const metadata: Metadata = {
  title: APP_TITLE,
  description: `${APP_TITLE} Systems`,
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardPreloader>
      {/* LEFT SIDEBAR (fixed positioned) */}
      <LeftSidebar />

      <div
        className="flex min-h-screen transition-colors duration-300"
        style={{
          backgroundColor: "var(--content-bg, #000f25)",
          color: "var(--text-color)",
        }}
      >
        {/* CENTER COLUMN (Navbar + Content + Footer) */}
        <div className="flex flex-col flex-1 min-w-0">
          <Navbar />

          <main
            className="flex-1 overflow-y-auto transition-colors duration-300 flex flex-col"
            style={{
              backgroundColor: "var(--content-bg, #000f25)",
              color: "var(--text-color)",
            }}
          >
            <div className="flex flex-col flex-1 min-h-full justify-between">
              {children}
              <Footer />
            </div>
          </main>

          <ScrollToTopButton />
        </div>

        {/* RIGHT SIDEBAR (hidden on this route — set SHOW_RIGHT_SIDEBAR = true to re-enable) */}
        {SHOW_RIGHT_SIDEBAR && (
          <aside className="shrink-0">
            <RightSidebar />
          </aside>
        )}
      </div>
    </DashboardPreloader>
  );
}
