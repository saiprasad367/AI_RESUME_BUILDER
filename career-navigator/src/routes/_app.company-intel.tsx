import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card, Tint } from "@/components/AppUI";

export const Route = createFileRoute("/_app/company-intel")({
  head: () => ({ meta: [{ title: "Company Intelligence · CareerPilot AI" }] }),
  component: CI,
});

function CI() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Company Intelligence"
        title="Stripe"
        description="Know the company. Mirror their values. Tailor your resume accordingly."
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h3 className="font-display text-lg font-semibold">Overview</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Stripe builds economic infrastructure for the internet. Known for engineering excellence, beautiful API design, and a writing-first culture.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Info label="Industry" value="Payments · Fintech" />
            <Info label="Size" value="7,000+ employees" />
            <Info label="HQ" value="South San Francisco" />
            <Info label="Hiring focus" value="Infra, AI, growth markets" />
          </div>
        </Card>
        <Card>
          <h3 className="font-display text-lg font-semibold">Tech stack</h3>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {["Ruby","React","TypeScript","Go","GraphQL","AWS","Kubernetes","Sorbet"].map(t =>
              <span key={t} className="rounded-md border border-border bg-surface px-2 py-0.5 text-xs">{t}</span>
            )}
          </div>
        </Card>
        <Card>
          <h3 className="font-display text-lg font-semibold">Values</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {["Move with urgency and focus","Trust and amplify","Optimism","Rigor","Global optimization"].map(v =>
              <li key={v} className="flex gap-2"><Tint color="green">✓</Tint>{v}</li>
            )}
          </ul>
        </Card>
        <Card>
          <h3 className="font-display text-lg font-semibold">Culture keywords</h3>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {["writing","rigor","ownership","calm","craft","speed"].map(t =>
              <span key={t} className="rounded-md bg-tint-lavender px-2 py-0.5 text-xs text-tint-lavender-foreground">{t}</span>
            )}
          </div>
        </Card>
        <Card className="lg:col-span-3">
          <h3 className="font-display text-lg font-semibold">How to tailor your resume</h3>
          <ul className="mt-3 grid gap-2 text-sm md:grid-cols-2">
            {[
              "Lead bullets with measurable impact — Stripe values quantified outcomes.",
              "Emphasize writing samples and design docs you've authored.",
              "Highlight long-running ownership over short-term tickets.",
              "Mention reliability, infra and developer experience work explicitly.",
            ].map(t => <li key={t} className="flex gap-2"><Tint color="blue">Tip</Tint>{t}</li>)}
          </ul>
        </Card>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}
