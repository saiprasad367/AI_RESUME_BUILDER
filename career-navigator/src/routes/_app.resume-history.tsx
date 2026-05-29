import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card, Tint, Button } from "@/components/AppUI";

export const Route = createFileRoute("/_app/resume-history")({
  head: () => ({ meta: [{ title: "Resume History · CareerPilot AI" }] }),
  component: History,
});

const events = [
  { d: "Today · 14:02", t: "ATS rerun on v8", desc: "Score 88 → 92 after adding 3 quantified bullets.", tag: "ATS", color: "green" as const },
  { d: "Today · 11:20", t: "Version v8 created", desc: "Tailored for Stripe Senior Frontend Engineer.", tag: "Version", color: "blue" as const },
  { d: "Yesterday", t: "Template changed", desc: "Minimal → Editorial.", tag: "Template", color: "lavender" as const },
  { d: "2 days ago", t: "Exported PDF", desc: "alex-morgan-stripe-v7.pdf · 132 KB", tag: "Export", color: "blue" as const },
  { d: "3 days ago", t: "Version v7 created", desc: "Tailored for Linear Staff Engineer.", tag: "Version", color: "blue" as const },
  { d: "Last week", t: "ATS rerun on v6", desc: "Score 78 → 81 after adding Docker keyword.", tag: "ATS", color: "green" as const },
];

function History() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Resume History"
        title="Every iteration. Every improvement."
        description="Track resume versions, ATS movements, template changes and downloads."
        actions={<Button variant="secondary">Export history</Button>}
      />
      <ol className="relative space-y-4 border-l border-border pl-6">
        {events.map((e, i) => (
          <li key={i} className="relative">
            <span className="absolute -left-[26px] top-4 h-2.5 w-2.5 rounded-full bg-foreground ring-4 ring-background"></span>
            <Card className="card-hover">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <Tint color={e.color}>{e.tag}</Tint>
                  <p className="font-display text-base font-semibold">{e.t}</p>
                </div>
                <span className="text-xs text-muted-foreground">{e.d}</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{e.desc}</p>
            </Card>
          </li>
        ))}
      </ol>
    </div>
  );
}
