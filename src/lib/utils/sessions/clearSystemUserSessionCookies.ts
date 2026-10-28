"use client";

// Since we know which cookies to destroy we target them Explicitly !
const AUTH_COOKIES = [
  "skew_blanc_session_line",
  "skew_blanc_session_badge",
];

export function clearSystemUserSessionCookies() {
  if (typeof document === "undefined") return;

  for (const name of AUTH_COOKIES) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Strict`;
  }
}


// We can additinally clear localstorage but Cons: wipes all stored data, including unrelated things (like theme, last page, etc.)
// Session Keys and values are Destroyed with the request send to backend from the logout Action not here ! 

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────






// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End by B.L.S.M.A.C -  The Winds Chase US !
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

