"use client";

import React from "react";
import HeedMessageBellDropdown from "@/components/common/notifications/HeedMessageBellDropdown";

interface HeedMessageBellProps {
  currentDashboard?: string;
  align?: "right" | "left" | "center";
}

const HeedMessageBell: React.FC<HeedMessageBellProps> = ({
  currentDashboard = "rn-nursing",
  align = "right",
}) => {
  return (
    <HeedMessageBellDropdown
      currentDashboard={currentDashboard}
      align={align}
      triggerClassName="relative flex items-center justify-center w-9 h-9 rounded-lg border border-[var(--text-color)]/25 text-[var(--text-color)] hover:bg-[var(--text-color)]/10 transition-colors cursor-pointer"
    />
  );
};

export default HeedMessageBell;
