import Link from "next/link";
import { StageBadge, Stat } from "@/components/ui";
import { getFollowUpsDue, getStageCounts, getTodayStats } from "@/lib/dashboard";
import { STAGE_LABEL } from "@/lib/labels";
import { fmtDate } from "@/lib/time";

export const dynamic = "force-dynamic";

export default async function TodayPage() {
  const [stats, due, stages] = await Promise.all([getTodayStats(), getFollowUpsDue(), getStageCounts()]);
  return (
    <div className="space-y-8">
      <div>
        <h1 className="h1">Today</h1>
        <p className="text-sm text-slate-500">Start real conversations. Follow up. Book the 10 minutes.</p>
      </div>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <Stat label="New prospects" value={stats.newProspects} />
        <Stat label="Outreach sent" value={stats.outreachSent} hint="Emails, calls, LinkedIn, forms" />
        <Stat label="Replies" value={stats.replies} />
        <Stat label="Positive replies" value={stats.positiveReplies} />
        <Stat label="Follow-ups due" value={stats.followUpsDue} />
        <Stat label="Meetings booked" value={stats.meetingsBooked} />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <h2 className="h2 mb-3">Follow-ups due</h2>
          {due.length === 0 ? (
            <p className="text-sm text-slate-500">Nothing due. Go find some new businesses.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {due.map((p) => (
                <li key={p.id} className="flex flex-wrap items-center gap-3 py-2 text-sm">
                  <Link href={`/prospects/${p.id}`} className="font-medium hover:underline">{p.company}</Link>
                  <StageBadge stage={p.stage} />
                  <span className="text-slate-500">{p.contactName ?? p.benefitsContactName ?? ""}</span>
                  <span className="ml-auto text-slate-500">due {fmtDate(p.nextFollowUpAt)}</span>
                  <Link href={`/prospects/${p.id}/call`} className="btn-ghost py-1">Call</Link>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="card">
          <h2 className="h2 mb-3">Pipeline</h2>
          <ul className="space-y-1 text-sm">
            {stages.map((s) => (
              <li key={s.stage} className="flex justify-between">
                <Link href={`/prospects?stage=${s.stage}`} className="hover:underline">{STAGE_LABEL[s.stage]}</Link>
                <span className="tabular-nums text-slate-600">{s.count}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
