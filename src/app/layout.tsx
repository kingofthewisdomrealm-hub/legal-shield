import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Outreach CRM · Josias, Independent LegalShield Associate",
  description: "Prospecting, follow-up, and conversion CRM for an independent LegalShield associate.",
  robots: { index: false, follow: false },
};

const NAV = [
  { href: "/", label: "Today" },
  { href: "/pipeline", label: "Pipeline" },
  { href: "/prospects", label: "Prospects" },
  { href: "/suppression", label: "Do not contact" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const associateUrl = process.env.NEXT_PUBLIC_ASSOCIATE_URL || "https://josias.legalshieldassociate.com/";
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
            <Link href="/" className="font-semibold tracking-tight">
              Outreach CRM
            </Link>
            <nav className="flex flex-wrap gap-1 text-sm">
              {NAV.map((n) => (
                <Link key={n.href} href={n.href} className="rounded-md px-3 py-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900">
                  {n.label}
                </Link>
              ))}
            </nav>
            <Link
              href="/prospects/new"
              className="ml-auto rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700"
            >
              + Add prospect
            </Link>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
        <footer className="mx-auto max-w-7xl px-4 pb-8 pt-4 text-xs text-slate-500">
          Private CRM operated by Josias, an <strong>independent</strong> LegalShield associate. Not affiliated with or
          operated by LegalShield corporate. Official plans and enrollment:{" "}
          <a className="underline" href={associateUrl} target="_blank" rel="noopener noreferrer">
            {associateUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")}
          </a>
          .
        </footer>
      </body>
    </html>
  );
}
