import { notFound } from "next/navigation";
import { CallScript } from "@/components/CallScript";
import { db } from "@/lib/db";
import { decisionMakerSteps, gatekeeperSteps } from "@/lib/callScript";
import { nowInTz } from "@/lib/time";

export const dynamic = "force-dynamic";

export default async function CallPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await db.prospect.findUnique({ where: { id } });
  if (!p) notFound();
  if (p.optedOut) {
    return <div className="card text-sm text-rose-800">{p.company} is on the do-not-contact list. No calls.</div>;
  }
  const today = nowInTz();
  return (
    <CallScript
      prospect={{
        id: p.id,
        company: p.company,
        phone: p.phone,
        gatekeeperName: p.gatekeeperName,
        benefitsContactName: p.benefitsContactName,
        benefitsContactTitle: p.benefitsContactTitle,
        bestTimeToCall: p.bestTimeToCall,
        rapportNotes: p.rapportNotes,
        email: p.email,
      }}
      gatekeeper={gatekeeperSteps(today, p.rapportNotes)}
      decisionMaker={decisionMakerSteps(today, p.rapportNotes)}
    />
  );
}
