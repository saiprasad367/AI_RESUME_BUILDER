import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card, Tint, Button } from "@/components/AppUI";

export const Route = createFileRoute("/_app/career-coach")({
  head: () => ({ meta: [{ title: "Career Coach · CareerPilot AI" }] }),
  component: Coach,
});

function Coach() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Career Coach"
        title="Your next move, recommended"
        description="Personalized career paths, skills and projects — based on your trajectory and target roles."
        actions={<Button>Generate new plan</Button>}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="font-display text-lg font-semibold">Career paths</h3>
          <ul className="mt-4 space-y-3">
            {[
              { t: "Frontend Tech Lead", w: "12–18 months", tags: ["Leadership","DX"] },
              { t: "Full-stack Engineer", w: "6–9 months", tags: ["Node.js","Postgres"] },
              { t: "AI Product Engineer", w: "9–12 months", tags: ["LLMs","Eval"] },
            ].map(p => (
              <li key={p.t} className="rounded-lg border border-border p-4 card-hover">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{p.t}</p>
                  <span className="text-xs text-muted-foreground">{p.w}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {p.tags.map(t => <Tint key={t} color="blue">{t}</Tint>)}
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <h3 className="font-display text-lg font-semibold">Growth opportunities</h3>
          <ul className="mt-4 space-y-3 text-sm">
            {[
              "Pitch to lead the next design-system release at work.",
              "Speak at a local React meetup — 3 happening this quarter.",
              "Open-source your accessibility helpers.",
            ].map(t => <li key={t} className="flex gap-2"><Tint color="green">Try</Tint>{t}</li>)}
          </ul>
        </Card>

        <Card>
          <h3 className="font-display text-lg font-semibold">Skill recommendations</h3>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {["Docker","Kubernetes","System design","LLM evals","Rust basics","WASM"].map(s =>
              <span key={s} className="rounded-md border border-border bg-surface px-2.5 py-1 text-xs">+ {s}</span>
            )}
          </div>
        </Card>

        <Card>
          <h3 className="font-display text-lg font-semibold">Project suggestions</h3>
          <ul className="mt-4 space-y-3 text-sm">
            {[
              "Build a perf-focused starter kit using React 19 + edge runtimes.",
              "Ship an a11y audit CLI for design tokens.",
              "Recreate a Stripe checkout flow end-to-end as a portfolio piece.",
            ].map(t => <li key={t} className="flex gap-2"><Tint color="lavender">Build</Tint>{t}</li>)}
          </ul>
        </Card>

        <Card className="lg:col-span-2">
          <h3 className="font-display text-lg font-semibold">Learning recommendations</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              { t: "Advanced TypeScript", p: "Matt Pocock", h: "8h" },
              { t: "System Design for Frontend", p: "Frontend Masters", h: "12h" },
              { t: "Production LLM Engineering", p: "DeepLearning.AI", h: "10h" },
            ].map(c => (
              <div key={c.t} className="rounded-lg border border-border p-4 card-hover">
                <p className="font-medium">{c.t}</p>
                <p className="text-xs text-muted-foreground">{c.p} · {c.h}</p>
                <Button variant="secondary" className="mt-3 w-full justify-center">Add to roadmap</Button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
