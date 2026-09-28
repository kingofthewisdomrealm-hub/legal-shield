import { ProspectForm } from "@/components/ProspectForm";
import { createProspect } from "@/lib/actions";

export default function NewProspectPage() {
  return (
    <div className="max-w-3xl space-y-4">
      <h1 className="h1">Add prospect</h1>
      <p className="text-sm text-slate-500">Only publicly observable facts. Mark employee counts as estimates unless confirmed.</p>
      <ProspectForm action={createProspect} submitLabel="Save prospect" />
    </div>
  );
}
