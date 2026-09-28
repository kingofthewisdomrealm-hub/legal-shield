import { notFound } from "next/navigation";
import { ProspectForm } from "@/components/ProspectForm";
import { updateProspect } from "@/lib/actions";
import { db } from "@/lib/db";

export default async function EditProspectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await db.prospect.findUnique({ where: { id } });
  if (!p) notFound();
  return (
    <div className="max-w-3xl space-y-4">
      <h1 className="h1">Edit {p.company}</h1>
      <ProspectForm action={updateProspect.bind(null, id)} prospect={p} submitLabel="Save changes" />
    </div>
  );
}
