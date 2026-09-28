import { addSuppression } from "@/lib/actions";
import { db } from "@/lib/db";
import { fmtDate } from "@/lib/time";

export const dynamic = "force-dynamic";

export default async function SuppressionPage() {
  const rows = await db.suppression.findMany({ orderBy: { createdAt: "desc" }, take: 500 });
  return (
    <div className="max-w-3xl space-y-4">
      <h1 className="h1">Do not contact</h1>
      <p className="text-sm text-slate-500">
        Anyone here is never contacted again by the system. Opt-outs logged on a prospect land here automatically.
        Add <code>@domain.com</code> to block a whole company.
      </p>
      <form action={addSuppression} className="card flex flex-wrap gap-2">
        <input className="input flex-1" name="value" required placeholder="email, phone, or @domain.com" />
        <input className="input flex-1" name="reason" placeholder="Reason (optional)" />
        <button className="btn">Add</button>
      </form>
      <div className="card p-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
            <tr><th className="px-4 py-2">Value</th><th className="px-4 py-2">Kind</th><th className="px-4 py-2">Reason</th><th className="px-4 py-2">Added</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((r) => (
              <tr key={r.id}><td className="px-4 py-2 font-mono">{r.value}</td><td className="px-4 py-2">{r.kind}</td><td className="px-4 py-2">{r.reason ?? "—"}</td><td className="px-4 py-2">{fmtDate(r.createdAt)}</td></tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-500">Empty.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
