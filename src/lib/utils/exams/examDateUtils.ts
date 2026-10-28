/**
 * Utility to format the previous day's date (yesterday) for "Exams last updated" displays.
 *
 * @param baseDate Optional base date (defaults to current date/time).
 * @returns Date string formatted as MM/DD/YY (e.g. "10/05/26").
 */
export function getPreviousDayFormatted(baseDate?: Date | string | number | null): string {
  const d =
    baseDate instanceof Date
      ? new Date(baseDate.getTime())
      : baseDate
      ? new Date(baseDate)
      : new Date();
  const target = isNaN(d.getTime()) ? new Date() : d;
  target.setDate(target.getDate() - 1);
  return target.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "2-digit",
  });
}
