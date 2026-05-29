import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card, Button, Tint } from "@/components/AppUI";
import { useState } from "react";

export const Route = createFileRoute("/_app/resume-studio")({
  head: () => ({ meta: [{ title: "Resume Studio · CareerPilot AI" }] }),
  component: ResumeStudio,
});

const tabs = ["Content", "Templates", "ATS Analysis", "Versions", "Export"] as const;

function ResumeStudio() {
  const [tab, setTab] = useState<typeof tabs[number]>("Content");
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Resume Studio"
        title="Senior Frontend Engineer"
        description="Live preview, ATS scoring, and AI assistance — together in one calm workspace."
        actions={<>
          <Button variant="secondary">Save draft</Button>
          <Button>Export PDF</Button>
        </>}
      />

      <div className="flex flex-wrap gap-1 border-b border-border">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`relative px-4 py-2.5 text-sm transition-colors ${tab === t ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            {t}
            {tab === t && <span className="absolute inset-x-2 -bottom-px h-0.5 bg-foreground"></span>}
          </button>
        ))}
      </div>

      {tab === "Content" && <ContentEditor />}
      {tab === "Templates" && <Templates />}
      {tab === "ATS Analysis" && <p className="text-sm text-muted-foreground">Visit the ATS Analyzer page for the full breakdown.</p>}
      {tab === "Versions" && <Versions />}
      {tab === "Export" && <Export />}
    </div>
  );
}

function ContentEditor() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
      <div className="space-y-5">
        <Card>
          <SectionTitle title="Summary" badge="AI" />
          <textarea
            defaultValue="Senior Frontend Engineer with 7+ years building accessible, performant React applications at scale. Led design-system rollouts and shipped features used by 4M+ users."
            className="mt-3 min-h-32 w-full rounded-lg border border-border bg-card p-3 text-sm outline-none focus:border-foreground/30 focus:ring-4 focus:ring-foreground/5"
          />
          <AIActions />
        </Card>
        <Card>
          <SectionTitle title="Experience" />
          <div className="mt-4 space-y-4">
            {["Stripe — Senior Frontend Engineer", "Linear — Frontend Engineer"].map((r) => (
              <div key={r} className="rounded-lg border border-border p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{r}</p>
                  <span className="text-xs text-muted-foreground">2022 — Present</span>
                </div>
                <textarea
                  defaultValue="• Led the migration to a federated design system, reducing component duplication by 62%.&#10;• Shipped a perf initiative that cut LCP from 3.2s to 1.4s."
                  className="mt-3 min-h-24 w-full rounded-lg border border-border bg-surface p-3 text-sm outline-none focus:border-foreground/30"
                />
                <AIActions />
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <SectionTitle title="Skills" />
          <div className="mt-3 flex flex-wrap gap-2">
            {["React","TypeScript","Next.js","Node.js","GraphQL","Tailwind","AWS"].map(s => (
              <span key={s} className="rounded-md border border-border bg-surface px-2.5 py-1 text-xs">{s} ×</span>
            ))}
            <button className="rounded-md border border-dashed border-border px-2.5 py-1 text-xs text-muted-foreground">+ Add</button>
          </div>
        </Card>
      </div>

      <div className="lg:sticky lg:top-24 lg:self-start">
        <Card className="overflow-hidden">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Live preview</span>
            <Tint color="green">ATS 92</Tint>
          </div>
          <div className="aspect-[1/1.3] rounded-lg border border-border bg-card p-6 text-[11px] leading-relaxed shadow-soft">
            <h3 className="font-display text-base font-semibold">Alex Morgan</h3>
            <p className="text-muted-foreground">Senior Frontend Engineer · San Francisco</p>
            <hr className="my-3 border-border" />
            <p className="font-semibold">Summary</p>
            <p className="text-muted-foreground">Senior Frontend Engineer with 7+ years building accessible, performant React applications…</p>
            <p className="mt-3 font-semibold">Experience</p>
            <p>Stripe — Senior Frontend Engineer · 2022—Present</p>
            <p className="text-muted-foreground">• Led design-system migration, reducing duplication by 62%.</p>
            <p className="mt-3 font-semibold">Skills</p>
            <p className="text-muted-foreground">React · TypeScript · Next.js · Node.js · GraphQL · AWS</p>
          </div>
        </Card>
      </div>
    </div>
  );
}

function SectionTitle({ title, badge }: { title: string; badge?: string }) {
  return (
    <div className="flex items-center justify-between">
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      {badge && <Tint color="blue">{badge} assistant</Tint>}
    </div>
  );
}

function AIActions() {
  const actions = ["Generate", "Improve", "Rewrite", "Expand", "Shorten", "ATS Optimize"];
  return (
    <div className="mt-3 flex flex-wrap gap-1.5">
      {actions.map(a => (
        <button key={a} className="rounded-md border border-border bg-surface px-2.5 py-1 text-xs hover:border-border-strong">
          ✦ {a}
        </button>
      ))}
    </div>
  );
}

function Templates() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {["Minimal","Classic","Editorial","Compact","Modern","Executive"].map((n,i) => (
        <Card key={n} className="card-hover">
          <div className="aspect-[1/1.3] rounded-lg border border-border bg-surface"></div>
          <div className="mt-3 flex items-center justify-between">
            <div>
              <p className="font-medium">{n}</p>
              <p className="text-xs text-muted-foreground">ATS-tested</p>
            </div>
            {i === 0 && <Tint color="green">Active</Tint>}
          </div>
        </Card>
      ))}
    </div>
  );
}

function Versions() {
  const v = [
    { n: "v8 · Stripe role", a: "92", d: "2h ago" },
    { n: "v7 · Linear role", a: "88", d: "Yesterday" },
    { n: "v6 · Generic", a: "81", d: "3 days ago" },
  ];
  return (
    <Card>
      <ul className="divide-y divide-border">
        {v.map(x => (
          <li key={x.n} className="flex items-center justify-between py-4">
            <div>
              <p className="font-medium">{x.n}</p>
              <p className="text-xs text-muted-foreground">{x.d}</p>
            </div>
            <div className="flex items-center gap-3">
              <Tint color="green">ATS {x.a}</Tint>
              <Button variant="secondary">Restore</Button>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function Export() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {["PDF","DOCX","Plain text"].map(f => (
        <Card key={f} className="text-center">
          <p className="font-display text-2xl">{f}</p>
          <p className="mt-1 text-sm text-muted-foreground">Best for {f === "PDF" ? "applications" : f === "DOCX" ? "recruiters" : "ATS systems"}</p>
          <Button className="mt-4 w-full justify-center">Download</Button>
        </Card>
      ))}
    </div>
  );
}
