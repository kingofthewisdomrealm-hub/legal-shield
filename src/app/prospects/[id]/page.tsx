import Link from "next/link";
import { notFound } from "next/navigation";
import { Field, StageBadge } from "@/components/ui";
import { changeStage, logActivity } from "@/lib/actions";
import { db } from "@/lib/db";
import { ACTIVITY_LABEL, OUTCOME_LABEL, STAGES, STAGE_LABEL, TYPE_LABEL } from "@/lib/labels";
import { fmtDate, fmtDateTime } from "@/lib/time";

export const dynamic = "force-dynamic";

const LOGGABLE = ["NOTE", "EMAIL_SENT", "EMAIL_RECEIVED", "CALL", "LINKEDIN", "CONTACT_FORM", "MEETING"] as const;

export default async function ProspectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await db.prospect.findUnique({
    where: { id },
    include: { activities: { orderBy: { occurredAt: "desc" } } },
  });
  if (!p) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start gap-3">
        <div>
          <h1 className="h1">{p.company}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <StageBadge stage={p.stage} />
            <span>{TYPE_LABEL[p.type]}</span>
            {p.industry && <span>· {p.industry}</span>}
            {p.city && <span>· {[p.city, p.state].filter(Boolean).join(", ")}</span>}
          </div>
        </div>
        <div className="ml-auto flex flex-wrap gap-2">
          {p.optedOut ? (
            <span className="rounded-md bg-rose-100 px-3 py-2 text-sm font-medium text-rose-800">Do not contact</span>
          ) : (
            <Link href={`/prospects/${p.id}/call`} className="btn">📞 Start call script</Link>
          )}
          <Link href={`/prospects/${p.id}/edit`} className="btn-ghost">Edit</Link>
        </div>
      </div>

      {p.rapportNotes && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm">
          <span className="font-semibold">Bring up next call:</span> {p.rapportNotes}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="card">
            <h2 className="h2 mb-3">Log an activity</h2>
            <form action={logActivity.bind(null, p.id)} className="grid gap-3 sm:grid-cols-3">
              <select name="type" className="input" defaultValue="NOTE">
                {LOGGABLE.map((t) => <option key={t} value={t}>{ACTIVITY_LABEL[t]}</option>)}
              </select>
              <select name="outcome" className="input" defaultValue="">
                <option value="">Outcome (optional)</option>
                {Object.entries(OUTCOME_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <input type="date" name="nextFollowUpAt" className="input" title="Next follow-up" />
              <input name="summary" required className="input sm:col-span-3" placeholder="What happened? (one line)" />
              <textarea name="body" className="input min-h-20 sm:col-span-3" placeholder="Details, their exact words, email text…" />
              <div className="sm:col-span-3"><button className="btn">Save activity</button></div>
            </form>
            <p className="mt-2 text-xs text-slate-500">The stage updates on its own: outreach → Contacted, reply → Replied, &quot;Book meeting&quot; → Meeting booked, opt-out → Lost + do-not-contact.</p>
          </section>

          <section className="card">
            <h2 className="h2 mb-3">Conversation history</h2>
            {p.activities.length === 0 ? (
              <p className="text-sm text-slate-500">No activity yet.</p>
            ) : (
              <ol className="space-y-4">
                {p.activities.map((a) => (
                  <li key={a.id} className="border-l-2 border-slate-200 pl-3">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="font-medium text-slate-700">{ACTIVITY_LABEL[a.type]}</span>
                      {a.outcome && <span className="rounded bg-slate-100 px-1.5 py-0.5">{OUTCOME_LABEL[a.outcome]}</span>}
                      <span>{fmtDateTime(a.occurredAt)}</span>
                    </div>
                    <div className="text-sm">{a.summary}</div>
                    {a.body && <pre className="mt-1 whitespace-pre-wrap font-sans text-sm text-slate-600">{a.body}</pre>}
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <section className="card space-y-3">
            <h2 className="h2">Stage</h2>
            <form action={changeStage.bind(null, p.id)} className="flex gap-2">
              <select name="stage" className="input" defaultValue={p.stage}>
                {STAGES.map((s) => <option key={s} value={s}>{STAGE_LABEL[s]}</option>)}
              </select>
              <button className="btn-ghost">Move</button>
            </form>
            <div className="grid grid-cols-2 gap-3">
              <Field label="First contact">{fmtDate(p.firstContactAt)}</Field>
              <Field label="Last contact">{fmtDate(p.lastContactAt)}</Field>
              <Field label="Next follow-up">{fmtDate(p.nextFollowUpAt)}</Field>
              <Field label="Score">{p.qualificationScore ?? null}</Field>
            </div>
          </section>

          <section className="card space-y-3">
            <h2 className="h2">Contact</h2>
            <Field label="Decision-maker">{[p.contactName, p.title].filter(Boolean).join(" — ")}</Field>
            <Field label="Email">{p.email && <a className="underline" href={`mailto:${p.email}`}>{p.email}</a>}</Field>
            <Field label="Phone">{p.phone && <a className="underline" href={`tel:${p.phone}`}>{p.phone}</a>}</Field>
            <Field label="Website">{p.website && <a className="underline" href={p.website} target="_blank" rel="noopener noreferrer">{p.website}</a>}</Field>
            <Field label="LinkedIn">{p.linkedin && <a className="underline" href={p.linkedin} target="_blank" rel="noopener noreferrer">Profile</a>}</Field>
            <Field label="Employees">{p.employeeEstimate != null ? `${p.employeeEstimate}${p.employeeIsEstimate ? " (estimate)" : ""}` : null}</Field>
          </section>

          <section className="card space-y-3">
            <h2 className="h2">Phone play</h2>
            <Field label="Gatekeeper">{p.gatekeeperName}</Field>
            <Field label="Benefits contact">{[p.benefitsContactName, p.benefitsContactTitle].filter(Boolean).join(" — ")}</Field>
            <Field label="Best time to call">{p.bestTimeToCall}</Field>
          </section>

          <section className="card space-y-3">
            <h2 className="h2">Why them</h2>
            <Field label="Reason">{p.whyContacted}</Field>
            <Field label="Source">{p.source}</Field>
            <Field label="Notes">{p.notes && <span className="whitespace-pre-wrap">{p.notes}</span>}</Field>
          </section>
        </div>
      </div>
    </div>
  );
}
