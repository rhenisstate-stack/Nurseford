"use client";

import React from "react";
import HeedMessageBellDropdown from "@/components/common/notifications/HeedMessageBellDropdown";

const HeedMessageBell: React.FC = () => {
  return (
    <HeedMessageBellDropdown
      currentDashboard="hesi-a2"
      align="right"
      triggerClassName="relative flex items-center justify-center w-9 h-9 lg:w-10 lg:h-10 border border-gray-300 dark:border-gray-800 rounded-lg hover:bg-[var(--text-color)]/10 transition cursor-pointer"
    />
  );
};

export default HeedMessageBell;
