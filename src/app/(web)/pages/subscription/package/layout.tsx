import type { Metadata } from "next";
import { APP_NAME } from "@/lib/config/config";

export const metadata: Metadata = {
  title: `Subscription Plans & Pricing | ${APP_NAME}`,
  description:
    "Choose a flexible Nurseford subscription plan for unlimited access to RN and LPN nursing question banks, custom exam builders, and detailed performance analytics.",
  alternates: {
    canonical: "/pages/subscription/package",
  },
};

export default function SubscriptionPackageLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
