import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card, Bar, Tint } from "@/components/AppUI";

export const Route = createFileRoute("/_app/skill-gap")({
  head: () => ({ meta: [{ title: "Skill Gap · CareerPilot AI" }] }),
  component: SkillGap,
});

function SkillGap() {
  const current = [["React",94],["TypeScript",88],["CSS",90],["Node.js",78],["GraphQL",70]] as const;
  const target  = [["React",95],["TypeScript",90],["Docker",80],["Kubernetes",70],["AWS",80],["Observability",65]] as const;
  const missing = ["Docker","Kubernetes","CI/CD","Terraform","Observability"];
  const future  = ["LLM evals","Edge runtimes","WASM","Rust","Web GPU"];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Skill Gap"
        title="What's between you and your target role"
        description="Compared against Senior Frontend Engineer roles you saved."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="font-display text-lg font-semibold">Your current skills</h3>
          <ul className="mt-4 space-y-3 text-sm">
            {current.map(([n,v]) => (
              <li key={n}>
                <div className="mb-1 flex justify-between"><span>{n}</span><span className="font-metric text-muted-foreground">{v}%</span></div>
                <Bar value={v} color="fg" />
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <h3 className="font-display text-lg font-semibold">Target role expects</h3>
          <ul className="mt-4 space-y-3 text-sm">
            {target.map(([n,v]) => (
              <li key={n}>
                <div className="mb-1 flex justify-between"><span>{n}</span><span className="font-metric text-muted-foreground">{v}%</span></div>
                <Bar value={v} color="blue" />
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="font-display text-lg font-semibold">Missing skills</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {missing.map(s => <span key={s} className="rounded-md bg-tint-lavender px-2.5 py-1 text-xs text-tint-lavender-foreground">! {s}</span>)}
          </div>
          <p className="mt-4 text-sm text-muted-foreground">Closing these moves your match from 84% → 96%.</p>
        </Card>
        <Card>
          <h3 className="font-display text-lg font-semibold">Future-proof skills</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {future.map(s => <span key={s} className="rounded-md bg-tint-green px-2.5 py-1 text-xs text-tint-green-foreground">✦ {s}</span>)}
          </div>
          <p className="mt-4 text-sm text-muted-foreground">Trending in 2026 frontend hiring. Worth getting ahead of.</p>
        </Card>
      </div>
    </div>
  );
}
