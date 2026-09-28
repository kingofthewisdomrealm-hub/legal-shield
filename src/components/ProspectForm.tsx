import type { Prospect } from "@prisma/client";
import { TYPE_LABEL } from "@/lib/labels";
import { toDateInput } from "@/lib/time";

function Input({ name, label, p, type = "text", placeholder }: { name: keyof Prospect; label: string; p?: Prospect | null; type?: string; placeholder?: string }) {
  const v = p?.[name];
  const def = v instanceof Date ? toDateInput(v) : v == null ? "" : String(v);
  return (
    <label className="block">
      <span className="label">{label}</span>
      <input className="input" name={name} type={type} defaultValue={def} placeholder={placeholder} />
    </label>
  );
}

function Area({ name, label, p, placeholder }: { name: keyof Prospect; label: string; p?: Prospect | null; placeholder?: string }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <textarea className="input min-h-20" name={name} defaultValue={(p?.[name] as string) ?? ""} placeholder={placeholder} />
    </label>
  );
}

export function ProspectForm({ action, prospect, submitLabel }: { action: (f: FormData) => Promise<void>; prospect?: Prospect | null; submitLabel: string }) {
  const p = prospect;
  return (
    <form action={action} className="space-y-6">
      <section className="card grid gap-4 sm:grid-cols-2">
        <h2 className="h2 sm:col-span-2">Company</h2>
        <label className="block">
          <span className="label">Company *</span>
          <input className="input" name="company" required defaultValue={p?.company ?? ""} />
        </label>
        <Input name="website" label="Website" p={p} placeholder="https://" />
        <Input name="industry" label="Industry" p={p} placeholder="Roofing, HVAC, Realtor…" />
        <label className="block">
          <span className="label">Business or group?</span>
          <select className="input" name="type" defaultValue={p?.type ?? "UNKNOWN"}>
            {Object.entries(TYPE_LABEL).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </label>
        <Input name="city" label="City" p={p} />
        <Input name="state" label="State" p={p} placeholder="FL" />
        <Input name="employeeEstimate" label="Employees" p={p} type="number" />
        <label className="block">
          <span className="label">Employee number is…</span>
          <select className="input" name="employeeIsEstimate" defaultValue={p && !p.employeeIsEstimate ? "exact" : "estimate"}>
            <option value="estimate">An estimate</option>
            <option value="exact">Confirmed</option>
          </select>
        </label>
      </section>

      <section className="card grid gap-4 sm:grid-cols-2">
        <h2 className="h2 sm:col-span-2">Decision-maker</h2>
        <Input name="contactName" label="Contact name" p={p} />
        <Input name="title" label="Title" p={p} placeholder="Owner, HR Director…" />
        <Input name="email" label="Email" p={p} type="email" />
        <Input name="phone" label="Phone (only if legitimately available)" p={p} type="tel" />
        <Input name="linkedin" label="LinkedIn URL" p={p} />
      </section>

      <section className="card grid gap-4 sm:grid-cols-2">
        <h2 className="h2 sm:col-span-2">Phone play</h2>
        <Input name="gatekeeperName" label="Gatekeeper / front desk name" p={p} />
        <Input name="bestTimeToCall" label="Best time to call" p={p} placeholder="Tue mornings before 10" />
        <Input name="benefitsContactName" label="Benefits contact" p={p} />
        <Input name="benefitsContactTitle" label="Benefits contact title" p={p} />
        <div className="sm:col-span-2">
          <Area name="rapportNotes" label="Personal notes to bring up next call" p={p} placeholder="Maria at front desk — daughter plays travel softball" />
        </div>
      </section>

      <section className="card grid gap-4 sm:grid-cols-2">
        <h2 className="h2 sm:col-span-2">Why them</h2>
        <div className="sm:col-span-2">
          <Area name="whyContacted" label="Why we're contacting them (observable facts only)" p={p} placeholder="Hiring 3 techs; 40+ employees; signs a lot of customer contracts" />
        </div>
        <Input name="source" label="Source" p={p} placeholder="Chamber directory, referral, Google Maps…" />
        <Input name="qualificationScore" label="Qualification score (0–100)" p={p} type="number" />
        <Input name="nextFollowUpAt" label="Next follow-up" p={p} type="date" />
        <div className="sm:col-span-2">
          <Area name="notes" label="Notes" p={p} />
        </div>
      </section>

      <button className="btn" type="submit">{submitLabel}</button>
    </form>
  );
}
