import { db } from "./db";
import { OUTBOUND_TYPES, POSITIVE_OUTCOMES, STAGES } from "./labels";
import { startOfTodayInTz } from "./time";

export async function getTodayStats() {
  const since = startOfTodayInTz();
  const endOfToday = new Date(since.getTime() + 24 * 3600 * 1000);
  const [newProspects, outreachSent, replies, positiveReplies, followUpsDue, meetingsBooked] = await Promise.all([
    db.prospect.count({ where: { createdAt: { gte: since } } }),
    db.activity.count({ where: { occurredAt: { gte: since }, type: { in: OUTBOUND_TYPES } } }),
    db.activity.count({ where: { occurredAt: { gte: since }, type: "EMAIL_RECEIVED" } }),
    db.activity.count({ where: { occurredAt: { gte: since }, outcome: { in: POSITIVE_OUTCOMES } } }),
    db.prospect.count({
      where: { nextFollowUpAt: { lt: endOfToday }, optedOut: false, stage: { notIn: ["ENROLLED", "LOST"] } },
    }),
    db.activity.count({
      where: { occurredAt: { gte: since }, type: "STAGE_CHANGE", summary: { contains: "→ Meeting booked" } },
    }),
  ]);
  return { newProspects, outreachSent, replies, positiveReplies, followUpsDue, meetingsBooked };
}

export async function getFollowUpsDue(limit = 15) {
  const endOfToday = new Date(startOfTodayInTz().getTime() + 24 * 3600 * 1000);
  return db.prospect.findMany({
    where: { nextFollowUpAt: { lt: endOfToday }, optedOut: false, stage: { notIn: ["ENROLLED", "LOST"] } },
    orderBy: { nextFollowUpAt: "asc" },
    take: limit,
  });
}

export async function getStageCounts() {
  const rows = await db.prospect.groupBy({ by: ["stage"], _count: { _all: true } });
  const map = Object.fromEntries(rows.map((r) => [r.stage, r._count._all]));
  return STAGES.map((s) => ({ stage: s, count: map[s] ?? 0 }));
}
