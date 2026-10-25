export const toDate = (v?: string | null) => {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
};

// 14:05
export const formatTime = (v?: string | null) => {
  const d = toDate(v);
  return d ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";
};

// Today / Yesterday / 12 Mar 2026
export const formatDay = (v?: string | null) => {
  const d = toDate(v);
  if (!d) return "";
  const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diffDays = Math.round((startOf(new Date()) - startOf(d)) / 86_400_000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return d.toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" });
};

// 5m ago / 3h ago / Yesterday / 12 Mar
export const timeAgo = (v?: string | null) => {
  const d = toDate(v);
  if (!d) return "";
  const mins = Math.floor((Date.now() - d.getTime()) / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString([], { day: "numeric", month: "short" });
};

export const categoryTone = (category?: string | null) => {
  const c = (category ?? "").toLowerCase();
  if (c.includes("payment")) return "bg-emerald-500";
  if (c.includes("exam")) return "bg-purple-500";
  if (c.includes("recovery")) return "bg-orange-500";
  if (c.includes("access")) return "bg-rose-500";
  return "bg-sky-500";
};