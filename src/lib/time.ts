/** "Today" means today in Josias's time zone, not the server's (Vercel servers run on UTC). */
export const APP_TZ = process.env.APP_TIMEZONE || "America/New_York";

/** Start of the current day in APP_TZ, as a UTC Date. */
export function startOfTodayInTz(now = new Date(), tz = APP_TZ): Date {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(now)
      .map((p) => [p.type, p.value]),
  );
  // How far past local midnight are we? Subtract that from now.
  const msSinceMidnight =
    (Number(parts.hour) * 3600 + Number(parts.minute) * 60 + Number(parts.second)) * 1000 + now.getMilliseconds();
  return new Date(now.getTime() - msSinceMidnight);
}

/** A Date whose getDay() matches the weekday in APP_TZ (for picking the phone greeting). */
export function nowInTz(tz = APP_TZ): Date {
  return new Date(new Date().toLocaleString("en-US", { timeZone: tz }));
}

export function fmtDate(d: Date | null | undefined): string {
  if (!d) return "—";
  return d.toLocaleDateString("en-US", { timeZone: APP_TZ, month: "short", day: "numeric", year: "numeric" });
}

export function fmtDateTime(d: Date | null | undefined): string {
  if (!d) return "—";
  return d.toLocaleString("en-US", {
    timeZone: APP_TZ,
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Turns an <input type="date"> value (YYYY-MM-DD) into a Date at 9 AM local-ish (noon UTC avoids day slips). */
export function parseDateInput(v: FormDataEntryValue | null): Date | null {
  if (typeof v !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return null;
  return new Date(`${v}T12:00:00Z`);
}

export function toDateInput(d: Date | null | undefined): string {
  return d ? d.toISOString().slice(0, 10) : "";
}
