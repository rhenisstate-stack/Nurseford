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
      <div className="flex min-h-screen bg-white text-black dark:bg-gray-900 dark:text-white transition-colors duration-300">
        {/* LEFT SIDEBAR */}
        <aside className="shrink-0">
          <LeftSidebar />
        </aside>

        {/* CENTER COLUMN (Navbar + Content + Footer) */}
        <div className="flex flex-col flex-1 min-w-0">
          <Navbar />

          <main className="flex-1 overflow-y-auto bg-white text-black dark:bg-blue-100 dark:text-white transition-colors duration-300">
            <div className="flex flex-col min-h-full">
              {children}
              <Footer />
            </div>
          </main>

          <ScrollToTopButton />
        </div>

        {/* RIGHT SIDEBAR */}
        <aside className="shrink-0">
          <RightSidebar />
        </aside>
      </div>
    </DashboardPreloader>
  );
}
