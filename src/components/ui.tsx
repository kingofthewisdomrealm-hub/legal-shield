import type { Stage } from "@prisma/client";
import { STAGE_LABEL } from "@/lib/labels";

const STAGE_COLOR: Record<Stage, string> = {
  PROSPECT: "bg-slate-100 text-slate-700",
  CONTACTED: "bg-sky-100 text-sky-800",
  REPLIED: "bg-indigo-100 text-indigo-800",
  QUALIFIED: "bg-violet-100 text-violet-800",
  MEETING_BOOKED: "bg-amber-100 text-amber-800",
  PRESENTED: "bg-orange-100 text-orange-800",
  ENROLLMENT_LINK_SENT: "bg-teal-100 text-teal-800",
  ENROLLED: "bg-emerald-100 text-emerald-800",
  LOST: "bg-rose-100 text-rose-700",
  FOLLOW_UP_LATER: "bg-yellow-100 text-yellow-800",
};

export function StageBadge({ stage }: { stage: Stage }) {
  return (
    <span className={`inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${STAGE_COLOR[stage]}`}>
      {STAGE_LABEL[stage]}
    </span>
  );
}

export function Stat({ label, value, hint }: { label: string; value: number | string; hint?: string }) {
  return (
    <div className="card">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-3xl font-semibold tabular-nums">{value}</div>
      {hint && <div className="mt-1 text-xs text-slate-500">{hint}</div>}
    </div>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="label">{label}</div>
      <div className="text-sm">{children || <span className="text-slate-400">—</span>}</div>
    </div>
  );
}
