import type { OpportunityType, Prisma, Stage } from "@prisma/client";
import Link from "next/link";
import { StageBadge } from "@/components/ui";
import { db } from "@/lib/db";
import { STAGES, STAGE_LABEL, TYPE_LABEL } from "@/lib/labels";
import { fmtDate } from "@/lib/time";

export const dynamic = "force-dynamic";

export default async function ProspectsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const stage = STAGES.includes(sp.stage as Stage) ? (sp.stage as Stage) : undefined;
  const type = ["BUSINESS", "GROUP", "UNKNOWN"].includes(sp.type ?? "") ? (sp.type as OpportunityType) : undefined;
  const q = sp.q?.trim();
  const where: Prisma.ProspectWhereInput = {
    stage,
    type,
    ...(q && {
      OR: ["company", "contactName", "industry", "city", "email"].map((f) => ({ [f]: { contains: q, mode: "insensitive" } })),
    }),
  };
  const prospects = await db.prospect.findMany({ where, orderBy: { updatedAt: "desc" }, take: 500 });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="h1">Prospects <span className="text-base font-normal text-slate-500">({prospects.length})</span></h1>
        <form className="flex flex-wrap gap-2">
          <input className="input w-48" name="q" placeholder="Search…" defaultValue={q} />
          <select className="input w-44" name="stage" defaultValue={stage ?? ""}>
            <option value="">All stages</option>
            {STAGES.map((s) => <option key={s} value={s}>{STAGE_LABEL[s]}</option>)}
          </select>
          <select className="input w-36" name="type" defaultValue={type ?? ""}>
            <option value="">Business + group</option>
            {Object.entries(TYPE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <button className="btn-ghost">Filter</button>
        </form>
      </div>
      <div className="card overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              {["Company", "Contact", "Industry", "Type", "Score", "Stage", "Last contact", "Next follow-up"].map((h) => (
                <th key={h} className="px-4 py-2 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {prospects.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="px-4 py-2">
                  <Link href={`/prospects/${p.id}`} className="font-medium hover:underline">{p.company}</Link>
                  {p.optedOut && <span className="ml-2 text-xs font-medium text-rose-700">DNC</span>}
                  <div className="text-xs text-slate-500">{[p.city, p.state].filter(Boolean).join(", ")}</div>
                </td>
                <td className="px-4 py-2">{p.contactName ?? "—"}<div className="text-xs text-slate-500">{p.title}</div></td>
                <td className="px-4 py-2">{p.industry ?? "—"}</td>
                <td className="px-4 py-2">{TYPE_LABEL[p.type]}</td>
                <td className="px-4 py-2 tabular-nums">{p.qualificationScore ?? "—"}</td>
                <td className="px-4 py-2"><StageBadge stage={p.stage} /></td>
                <td className="px-4 py-2">{fmtDate(p.lastContactAt)}</td>
                <td className="px-4 py-2">{fmtDate(p.nextFollowUpAt)}</td>
              </tr>
            ))}
            {prospects.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-500">No prospects yet. <Link className="underline" href="/prospects/new">Add the first one.</Link></td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
