// src/lib/hooks/users/session/useSessionHeartbeat.ts
"use client";

import { useEffect, useRef } from "react";
import { userService } from "@/lib/services/users/user/userService";
import { clearAuthSessionCookies } from "@/lib/utils/sessions/generateSystemUserSessionCookies";

// Pulse every 5 minutes while active (well before any short 15-minute token expires)
const HEARTBEAT_PULSE_INTERVAL_MS = 5 * 60 * 1000;
// Inactivity pause threshold: after 15 minutes of zero input, pause background pulse to allow backend idle timer to run naturally
const INACTIVITY_PAUSE_MS = 15 * 60 * 1000;

export function useSessionHeartbeat(isAuthenticated: boolean) {
  const lastActivityRef = useRef<number>(Date.now());
  const isPulsingRef = useRef<boolean>(false);

  useEffect(() => {
    if (!isAuthenticated || typeof window === "undefined") return;

    // Record user activity
    const recordActivity = () => {
      const wasIdle = Date.now() - lastActivityRef.current > INACTIVITY_PAUSE_MS;
      lastActivityRef.current = Date.now();

      // If user was idle and just returned, pulse immediately to check if session is still alive
      if (wasIdle && !isPulsingRef.current) {
        checkSessionPulse();
      }
    };

    const checkSessionPulse = async () => {
      if (isPulsingRef.current) return;
      isPulsingRef.current = true;
      try {
        const res = await userService("CurrentFetch");
        if (res?.error) {
          const errLower = res.error.toLowerCase();
          if (
            errLower.includes("expired") ||
            errLower.includes("401") ||
            errLower.includes("unauthorized") ||
            errLower.includes("casto session")
          ) {
            console.warn("🔒 [useSessionHeartbeat] Session expired on backend. Clearing local session.");
            clearAuthSessionCookies();
            window.dispatchEvent(new Event("user-session-expired"));
            window.dispatchEvent(new Event("user-logout"));
          }
        }
      } catch (err: unknown) {
        const errStr = String(err).toLowerCase();
        if (
          errStr.includes("expired") ||
          errStr.includes("401") ||
          errStr.includes("unauthorized") ||
          errStr.includes("casto session")
        ) {
          clearAuthSessionCookies();
          window.dispatchEvent(new Event("user-session-expired"));
          window.dispatchEvent(new Event("user-logout"));
        }
      } finally {
        isPulsingRef.current = false;
      }
    };

    const events = ["pointerdown", "keydown", "scroll", "touchstart"];
    events.forEach((ev) => window.addEventListener(ev, recordActivity, { passive: true }));

    // Periodic pulse every 5 minutes while active
    const interval = setInterval(() => {
      const timeSinceActive = Date.now() - lastActivityRef.current;
      if (timeSinceActive < INACTIVITY_PAUSE_MS) {
        checkSessionPulse();
      }
    }, HEARTBEAT_PULSE_INTERVAL_MS);

    return () => {
      clearInterval(interval);
      events.forEach((ev) => window.removeEventListener(ev, recordActivity));
    };
  }, [isAuthenticated]);
}
