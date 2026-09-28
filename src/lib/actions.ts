"use server";

import type { ActivityType, OpportunityType, Outcome, Prisma, Stage } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "./db";
import { OUTBOUND_TYPES, STAGES, STAGE_LABEL } from "./labels";
import { stageAfterActivity, suppressionKey } from "./pipeline";
import { parseDateInput } from "./time";

const str = (f: FormData, k: string) => {
  const v = f.get(k);
  return typeof v === "string" && v.trim() ? v.trim() : null;
};
const int = (f: FormData, k: string) => {
  const v = str(f, k);
  const n = v ? Number.parseInt(v, 10) : NaN;
  return Number.isFinite(n) ? n : null;
};
const TYPES: OpportunityType[] = ["BUSINESS", "GROUP", "UNKNOWN"];

function prospectFields(f: FormData) {
  const type = str(f, "type") as OpportunityType | null;
  const score = int(f, "qualificationScore");
  return {
    company: str(f, "company") ?? "",
    website: str(f, "website"),
    contactName: str(f, "contactName"),
    title: str(f, "title"),
    email: str(f, "email")?.toLowerCase() ?? null,
    phone: str(f, "phone"),
    linkedin: str(f, "linkedin"),
    city: str(f, "city"),
    state: str(f, "state"),
    industry: str(f, "industry"),
    employeeEstimate: int(f, "employeeEstimate"),
    employeeIsEstimate: f.get("employeeIsEstimate") !== "exact",
    type: type && TYPES.includes(type) ? type : "UNKNOWN",
    qualificationScore: score === null ? null : Math.max(0, Math.min(100, score)),
    whyContacted: str(f, "whyContacted"),
    source: str(f, "source"),
    notes: str(f, "notes"),
    nextFollowUpAt: parseDateInput(f.get("nextFollowUpAt")),
    gatekeeperName: str(f, "gatekeeperName"),
    benefitsContactName: str(f, "benefitsContactName"),
    benefitsContactTitle: str(f, "benefitsContactTitle"),
    bestTimeToCall: str(f, "bestTimeToCall"),
    rapportNotes: str(f, "rapportNotes"),
  };
}

/** Is this email / phone / domain on the do-not-contact list? */
async function isSuppressed(email?: string | null, phone?: string | null): Promise<boolean> {
  const keys = [email, phone, email?.includes("@") ? "@" + email.split("@")[1] : null]
    .map((v) => (v ? suppressionKey(v)?.value : null))
    .filter((v): v is string => !!v);
  if (!keys.length) return false;
  return (await db.suppression.count({ where: { value: { in: keys } } })) > 0;
}

export async function createProspect(formData: FormData) {
  const data = prospectFields(formData);
  if (!data.company) throw new Error("Company is required");
  const optedOut = await isSuppressed(data.email, data.phone);
  const p = await db.prospect.create({ data: { ...data, optedOut } });
  revalidatePath("/", "layout");
  redirect(`/prospects/${p.id}`);
}

export async function updateProspect(id: string, formData: FormData) {
  const data = prospectFields(formData);
  if (!data.company) throw new Error("Company is required");
  await db.prospect.update({ where: { id }, data });
  revalidatePath("/", "layout");
  redirect(`/prospects/${id}`);
}

export async function changeStage(id: string, formData: FormData) {
  const stage = str(formData, "stage") as Stage | null;
  if (!stage || !STAGES.includes(stage)) return;
  const current = await db.prospect.findUniqueOrThrow({ where: { id }, select: { stage: true } });
  if (current.stage === stage) return;
  await db.$transaction([
    db.prospect.update({ where: { id }, data: { stage } }),
    db.activity.create({
      data: { prospectId: id, type: "STAGE_CHANGE", summary: `${STAGE_LABEL[current.stage]} → ${STAGE_LABEL[stage]}` },
    }),
  ]);
  revalidatePath("/", "layout");
}

/** Shared by "log activity" and "save call": records the touch and updates the prospect. */
async function recordActivity(
  id: string,
  a: { type: ActivityType; outcome: Outcome | null; summary: string; body: string | null; nextFollowUpAt: Date | null },
  extra: Prisma.ProspectUpdateInput = {},
) {
  const p = await db.prospect.findUniqueOrThrow({ where: { id } });
  const now = new Date();
  const outbound = OUTBOUND_TYPES.includes(a.type);
  const nextStage = stageAfterActivity(p.stage, a.type, a.outcome);
  const optOut = a.outcome === "REMOVE_OPT_OUT";

  const ops: Prisma.PrismaPromise<unknown>[] = [
    db.activity.create({
      data: { prospectId: id, type: a.type, outcome: a.outcome, summary: a.summary, body: a.body },
    }),
    db.prospect.update({
      where: { id },
      data: {
        ...extra,
        stage: nextStage,
        lastContactAt: now,
        firstContactAt: outbound && !p.firstContactAt ? now : undefined,
        nextFollowUpAt: optOut ? null : (a.nextFollowUpAt ?? undefined),
        optedOut: optOut ? true : undefined,
      },
    }),
  ];
  if (nextStage !== p.stage) {
    ops.push(db.activity.create({ data: { prospectId: id, type: "STAGE_CHANGE", summary: `${STAGE_LABEL[p.stage]} → ${STAGE_LABEL[nextStage]} (auto)` } }));
  }
  // Opt-out: suppress every channel we have for them, immediately.
  if (optOut) {
    for (const raw of [p.email, p.phone]) {
      const k = raw ? suppressionKey(raw) : null;
      if (k) ops.push(db.suppression.upsert({ where: { value: k.value }, update: {}, create: { ...k, reason: `Opt-out: ${p.company}` } }));
    }
  }
  await db.$transaction(ops);
  revalidatePath("/", "layout");
}

export async function logActivity(id: string, formData: FormData) {
  const type = (str(formData, "type") ?? "NOTE") as ActivityType;
  const outcome = str(formData, "outcome") as Outcome | null;
  const summary = str(formData, "summary");
  if (!summary) throw new Error("Summary is required");
  await recordActivity(id, {
    type,
    outcome,
    summary,
    body: str(formData, "body"),
    nextFollowUpAt: parseDateInput(formData.get("nextFollowUpAt")),
  });
}

export type CallResult = {
  who: "gatekeeper" | "decision-maker";
  outcome: Outcome;
  gatekeeperName?: string;
  benefitsContactName?: string;
  benefitsContactTitle?: string;
  bestTimeToCall?: string;
  email?: string;
  rapportNotes?: string;
  meetingAt?: string;
  notes?: string;
  nextFollowUpAt?: string;
};

export async function saveCall(id: string, r: CallResult) {
  const clean = (v?: string) => (v && v.trim() ? v.trim() : undefined);
  const lines = [
    r.who === "gatekeeper" ? "Spoke with front desk / gatekeeper" : "Spoke with benefits decision-maker",
    clean(r.gatekeeperName) && `Gatekeeper: ${clean(r.gatekeeperName)}`,
    clean(r.benefitsContactName) &&
      `Benefits contact: ${clean(r.benefitsContactName)}${clean(r.benefitsContactTitle) ? ` (${clean(r.benefitsContactTitle)})` : ""}`,
    clean(r.bestTimeToCall) && `Best time to call: ${clean(r.bestTimeToCall)}`,
    clean(r.email) && `Email: ${clean(r.email)}`,
    clean(r.meetingAt) && `Meeting: ${clean(r.meetingAt)}`,
    clean(r.rapportNotes) && `Personal notes: ${clean(r.rapportNotes)}`,
    clean(r.notes),
  ].filter(Boolean) as string[];

  const p = await db.prospect.findUniqueOrThrow({ where: { id } });
  const email = clean(r.email)?.toLowerCase();
  await recordActivity(
    id,
    {
      type: "CALL",
      outcome: r.outcome,
      summary: lines[0],
      body: lines.slice(1).join("\n") || null,
      nextFollowUpAt: r.nextFollowUpAt ? parseDateInput(r.nextFollowUpAt) : null,
    },
    {
      gatekeeperName: clean(r.gatekeeperName),
      benefitsContactName: clean(r.benefitsContactName),
      benefitsContactTitle: clean(r.benefitsContactTitle),
      bestTimeToCall: clean(r.bestTimeToCall),
      // Append new personal notes instead of overwriting old ones.
      rapportNotes: clean(r.rapportNotes)
        ? [p.rapportNotes, clean(r.rapportNotes)].filter(Boolean).join(" · ")
        : undefined,
      email: email && !p.email ? email : undefined,
      contactName: clean(r.benefitsContactName) && !p.contactName ? clean(r.benefitsContactName) : undefined,
      title: clean(r.benefitsContactTitle) && !p.title ? clean(r.benefitsContactTitle) : undefined,
    },
  );
  redirect(`/prospects/${id}`);
}

export async function addSuppression(formData: FormData) {
  const k = suppressionKey(str(formData, "value") ?? "");
  if (!k) return;
  await db.suppression.upsert({ where: { value: k.value }, update: {}, create: { ...k, reason: str(formData, "reason") } });
  // Mark matching prospects as opted out.
  if (k.kind === "email") await db.prospect.updateMany({ where: { email: k.value }, data: { optedOut: true } });
  if (k.kind === "domain") await db.prospect.updateMany({ where: { email: { endsWith: k.value } }, data: { optedOut: true } });
  revalidatePath("/", "layout");
}

export async function deleteProspect(id: string) {
  await db.prospect.delete({ where: { id } });
  revalidatePath("/", "layout");
  redirect("/prospects");
}
