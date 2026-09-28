import Link from "next/link";
import { db } from "@/lib/db";
import { STAGES, STAGE_LABEL, TYPE_LABEL } from "@/lib/labels";
import { fmtDate } from "@/lib/time";

export const dynamic = "force-dynamic";

export default async function PipelinePage() {
  const prospects = await db.prospect.findMany({
    orderBy: [{ nextFollowUpAt: { sort: "asc", nulls: "last" } }, { updatedAt: "desc" }],
    take: 1000,
  });
  return (
    <div className="space-y-4">
      <h1 className="h1">Pipeline</h1>
      <div className="flex gap-3 overflow-x-auto pb-4">
        {STAGES.map((stage) => {
          const col = prospects.filter((p) => p.stage === stage);
          return (
            <div key={stage} className="w-64 shrink-0 rounded-xl bg-slate-100 p-2">
              <div className="flex items-center justify-between px-1 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
                <span>{STAGE_LABEL[stage]}</span>
                <span className="tabular-nums">{col.length}</span>
              </div>
              <div className="space-y-2">
                {col.map((p) => (
                  <Link key={p.id} href={`/prospects/${p.id}`} className="block rounded-lg border border-slate-200 bg-white p-2 text-sm shadow-sm hover:border-slate-400">
                    <div className="font-medium">{p.company}</div>
                    <div className="text-xs text-slate-500">
                      {[p.industry, TYPE_LABEL[p.type], p.city].filter(Boolean).join(" · ")}
                    </div>
                    {p.nextFollowUpAt && <div className="mt-1 text-xs text-amber-700">Follow up {fmtDate(p.nextFollowUpAt)}</div>}
                    {p.optedOut && <div className="mt-1 text-xs font-medium text-rose-700">Do not contact</div>}
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
