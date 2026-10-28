// ==================================================
// System Session Header Helpers (Reusable)
// ==================================================

const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;

  const match = document.cookie
    .split(";")
    .map((c) => c.trim())
    .find((row) => row.startsWith(name + "="));

  if (!match) return null;
  const rawValue = match.slice(name.length + 1);
  try {
    return decodeURIComponent(rawValue);
  } catch {
    return rawValue;
  }
};

const getCurrentSessionBadge = (): string | null => {
  if (typeof window === "undefined") return null;
  return getCookie("skew_blanc_session_badge");
};

const getCurrentSessionToken = (): string | null => {
  if (typeof window === "undefined") return null;

  const badge = getCurrentSessionBadge();
  const sessionsRaw = getCookie("skew_blanc_session_line");
  if (!sessionsRaw) return null;

  try {
    let sessions: Record<string, string>;
    try {
      sessions = JSON.parse(sessionsRaw);
    } catch {
      sessions = JSON.parse(decodeURIComponent(sessionsRaw));
    }
    if (badge && sessions[badge]) return sessions[badge];
    const vals = Object.values(sessions);
    return (vals[0] as string) || null;
  } catch {
    return sessionsRaw;
  }
};

// --------------------------------------------------
// PUBLIC API (NOT A REACT HOOK)
// --------------------------------------------------
export const renderSystemSessionHeaders = (): Record<string, string> => {
  const castoLine = getCurrentSessionToken();
  const castoBadge = getCurrentSessionBadge();

  return {
    ...(castoLine ? { "x-casto-line": castoLine } : {}),
    ...(castoBadge ? { "x-casto-badge": castoBadge } : {}),
  };
};

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────






// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End by B.L.S.M.A.C -  The Winds Chase US !
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────