import type { ActivityType, Outcome, Stage } from "@prisma/client";
import { OUTBOUND_TYPES } from "./labels";

const ORDER: Stage[] = [
  "PROSPECT",
  "CONTACTED",
  "REPLIED",
  "QUALIFIED",
  "MEETING_BOOKED",
  "PRESENTED",
  "ENROLLMENT_LINK_SENT",
  "ENROLLED",
];

/** Moves forward only — logging an activity never drags a prospect backward in the pipeline. */
function atLeast(current: Stage, target: Stage): Stage {
  const c = ORDER.indexOf(current);
  const t = ORDER.indexOf(target);
  if (c === -1) return target; // LOST / FOLLOW_UP_LATER: a real new event re-opens them
  return c >= t ? current : target;
}

/**
 * What stage should a prospect be in after this activity?
 * Plain rules: we reached out → Contacted. They answered → Replied. They want a meeting → Meeting booked.
 */
export function stageAfterActivity(current: Stage, type: ActivityType, outcome?: Outcome | null): Stage {
  if (outcome === "REMOVE_OPT_OUT" || outcome === "NOT_INTERESTED") return "LOST";
  if (outcome === "NOT_NOW") return "FOLLOW_UP_LATER";
  if (outcome === "BOOK_MEETING") return atLeast(current, "MEETING_BOOKED");
  if (outcome === "INTERESTED" || outcome === "NEEDS_INFORMATION" || outcome === "REFERRAL")
    return atLeast(current, "REPLIED");
  if (type === "EMAIL_RECEIVED") return atLeast(current, "REPLIED");
  if (type === "MEETING") return atLeast(current, "PRESENTED");
  if (OUTBOUND_TYPES.includes(type)) {
    if (current === "LOST") return current; // never auto-reopen someone we lost
    return atLeast(current, "CONTACTED");
  }
  return current;
}

/** Normalizes an email/phone/domain for the suppression list. */
export function suppressionKey(value: string): { value: string; kind: "email" | "phone" | "domain" } | null {
  const v = value.trim().toLowerCase();
  if (!v) return null;
  if (v.startsWith("@")) return { value: v, kind: "domain" };
  if (v.includes("@")) return { value: v, kind: "email" };
  const digits = v.replace(/\D/g, "");
  if (digits.length >= 10) return { value: digits.slice(-10), kind: "phone" };
  return null;
}
