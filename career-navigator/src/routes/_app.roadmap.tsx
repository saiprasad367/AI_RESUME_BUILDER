import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card, Tint, Bar, Button } from "@/components/AppUI";

export const Route = createFileRoute("/_app/roadmap")({
  head: () => ({ meta: [{ title: "Learning Roadmap · CareerPilot AI" }] }),
  component: Roadmap,
});

const weeks = [
  { w: "Week 1", t: "Docker fundamentals", tasks: ["Install + run containers","Build a Dockerfile","Compose multi-service app"], r: ["Docker docs","Bret Fisher course"], p: "Containerize your portfolio", done: 100 },
  { w: "Week 2", t: "Kubernetes basics", tasks: ["Pods, deployments, services","kubectl essentials","Helm charts"], r: ["KodeKloud Lite","K8s the hard way"], p: "Deploy app to local k3s", done: 100 },
  { w: "Week 3", t: "CI/CD pipelines", tasks: ["GitHub Actions","Caching & matrix","Preview deploys"], r: ["GH Actions docs"], p: "Add CI to portfolio repo", done: 60 },
  { w: "Week 4", t: "Observability", tasks: ["Logging","Metrics","Traces"], r: ["OpenTelemetry","Honeycomb sandbox"], p: "Instrument your app", done: 10 },
  { w: "Week 5", t: "Production hardening", tasks: ["Healthchecks","Autoscale","Secrets"], r: ["AWS docs"], p: "Deploy to ECS", done: 0 },
  { w: "Week 6", t: "Milestone review", tasks: ["Demo to mentor","Update resume","Rerun ATS"], r: [], p: "Publish writeup", done: 0 },
];

function Roadmap() {
  const overall = Math.round(weeks.reduce((a,w)=>a+w.done,0)/weeks.length);
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Learning Roadmap"
        title="Close your Docker → Observability gap in 6 weeks"
        description="A guided plan with weekly tasks, resources, projects and milestones."
        actions={<Button>Mark week complete</Button>}
      />

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-lg font-semibold">Overall progress</h3>
            <p className="text-sm text-muted-foreground">You're on pace. Stay consistent — 3 hours per week is enough.</p>
          </div>
          <div className="font-metric text-3xl font-semibold">{overall}%</div>
        </div>
        <div className="mt-4"><Bar value={overall} color="lavender" /></div>
      </Card>

      <ol className="relative space-y-5 border-l border-border pl-6">
        {weeks.map((w, i) => (
          <li key={w.w} className="relative">
            <span className="absolute -left-[31px] top-3 grid h-6 w-6 place-items-center rounded-full border border-border bg-card text-[11px] font-semibold">
              {i+1}
            </span>
            <Card className="card-hover">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{w.w}</p>
                  <h4 className="font-display text-lg font-semibold">{w.t}</h4>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-metric text-sm">{w.done}%</span>
                  <Tint color={w.done === 100 ? "green" : w.done > 0 ? "blue" : "lavender"}>
                    {w.done === 100 ? "Complete" : w.done > 0 ? "In progress" : "Upcoming"}
                  </Tint>
                </div>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Tasks</p>
                  <ul className="mt-2 space-y-1.5 text-sm">
                    {w.tasks.map(t => <li key={t} className="flex gap-2">○ {t}</li>)}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Resources</p>
                  <ul className="mt-2 space-y-1.5 text-sm">
                    {w.r.length ? w.r.map(t => <li key={t}>— {t}</li>) : <li className="text-muted-foreground">No resources</li>}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Project</p>
                  <p className="mt-2 text-sm">{w.p}</p>
                </div>
              </div>
            </Card>
          </li>
        ))}
      </ol>
    </div>
  );
}
