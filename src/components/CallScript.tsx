"use client";

import type { Outcome } from "@prisma/client";
import { useState, useTransition } from "react";
import { saveCall, type CallResult } from "@/lib/actions";
import type { ScriptStep } from "@/lib/callScript";

type P = {
  id: string;
  company: string;
  phone: string | null;
  gatekeeperName: string | null;
  benefitsContactName: string | null;
  benefitsContactTitle: string | null;
  bestTimeToCall: string | null;
  rapportNotes: string | null;
  email: string | null;
};

const OUTCOMES: { value: Outcome; label: string }[] = [
  { value: "GATEKEEPER_ONLY", label: "Front desk only — got info / callback time" },
  { value: "LEFT_VOICEMAIL", label: "Put through — left intro voicemail" },
  { value: "BOOK_MEETING", label: "Booked the 10-minute visit 🎉" },
  { value: "NEEDS_INFORMATION", label: "Said no to visit — email overview instead" },
  { value: "INTERESTED", label: "Interested — follow up" },
  { value: "NOT_NOW", label: "Not now" },
  { value: "NOT_INTERESTED", label: "Not interested" },
  { value: "WRONG_PERSON", label: "Wrong person" },
  { value: "REFERRAL", label: "Referred me to someone else" },
  { value: "NO_ANSWER", label: "No answer" },
  { value: "REMOVE_OPT_OUT", label: "Asked not to be contacted" },
];

export function CallScript({ prospect: p, gatekeeper, decisionMaker }: { prospect: P; gatekeeper: ScriptStep[]; decisionMaker: ScriptStep[] }) {
  const [who, setWho] = useState<CallResult["who"]>(p.benefitsContactName ? "decision-maker" : "gatekeeper");
  const [pending, start] = useTransition();
  const steps = who === "gatekeeper" ? gatekeeper : decisionMaker;

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    start(() => saveCall(p.id, { ...f, who, outcome: f.outcome as Outcome }));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="space-y-4 lg:col-span-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="h1">Call: {p.company}</h1>
          {p.phone && <a href={`tel:${p.phone}`} className="btn">Dial {p.phone}</a>}
        </div>
        <div className="flex gap-1 rounded-lg bg-slate-100 p-1 text-sm">
          {(["gatekeeper", "decision-maker"] as const).map((w) => (
            <button key={w} type="button" onClick={() => setWho(w)}
              className={`flex-1 rounded-md px-3 py-1.5 ${who === w ? "bg-white font-medium shadow-sm" : "text-slate-600"}`}>
              {w === "gatekeeper" ? "Talking to front desk" : "Talking to benefits person"}
            </button>
          ))}
        </div>
        {(p.gatekeeperName || p.benefitsContactName || p.bestTimeToCall) && (
          <div className="card grid gap-2 text-sm sm:grid-cols-3">
            {p.gatekeeperName && <div><span className="label">Front desk</span>{p.gatekeeperName}</div>}
            {p.benefitsContactName && <div><span className="label">Benefits person</span>{p.benefitsContactName}{p.benefitsContactTitle && ` — ${p.benefitsContactTitle}`}</div>}
            {p.bestTimeToCall && <div><span className="label">Best time</span>{p.bestTimeToCall}</div>}
          </div>
        )}
        <ol className="space-y-3">
          {steps.map((s) => (
            <li key={s.id} className="card">
              <div className="font-semibold">{s.title}</div>
              <ul className="mt-2 space-y-1">
                {s.say.map((line) => <li key={line} className="text-lg leading-snug">“{line}”</li>)}
              </ul>
              <p className="mt-2 text-xs text-slate-500">{s.coach}</p>
            </li>
          ))}
        </ol>
      </div>

      <form onSubmit={onSubmit} className="card h-fit space-y-3 lg:sticky lg:top-4 lg:col-span-2">
        <h2 className="h2">Write it down</h2>
        <label className="block"><span className="label">Front desk name</span><input className="input" name="gatekeeperName" defaultValue={p.gatekeeperName ?? ""} /></label>
        <div className="grid grid-cols-2 gap-2">
          <label className="block"><span className="label">Benefits person</span><input className="input" name="benefitsContactName" defaultValue={p.benefitsContactName ?? ""} /></label>
          <label className="block"><span className="label">Their title</span><input className="input" name="benefitsContactTitle" defaultValue={p.benefitsContactTitle ?? ""} placeholder="HR, Owner…" /></label>
        </div>
        <label className="block"><span className="label">Best time to catch them</span><input className="input" name="bestTimeToCall" defaultValue={p.bestTimeToCall ?? ""} /></label>
        <label className="block"><span className="label">Email (for the overview)</span><input className="input" type="email" name="email" defaultValue={p.email ?? ""} /></label>
        <label className="block"><span className="label">New personal notes (added to old ones)</span><textarea className="input min-h-16" name="rapportNotes" placeholder="Going to Disney this weekend with the kids" /></label>
        <label className="block"><span className="label">Visit / meeting time (if booked)</span><input className="input" name="meetingAt" placeholder="Thu 10/1 at 2pm" /></label>
        <label className="block"><span className="label">How did it go?</span>
          <select className="input" name="outcome" required defaultValue="">
            <option value="" disabled>Pick one…</option>
            {OUTCOMES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </label>
        <label className="block"><span className="label">Next follow-up</span><input className="input" type="date" name="nextFollowUpAt" /></label>
        <label className="block"><span className="label">Other notes</span><textarea className="input min-h-16" name="notes" /></label>
        <button className="btn w-full" disabled={pending}>{pending ? "Saving…" : "Save call"}</button>
      </form>
    </div>
  );
}
