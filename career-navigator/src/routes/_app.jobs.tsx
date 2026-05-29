import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, Card, Tint, Button } from "@/components/AppUI";

export const Route = createFileRoute("/_app/jobs")({
  head: () => ({ meta: [{ title: "Jobs · CareerPilot AI" }] }),
  component: Jobs,
});

const jobs = [
  { c: "Stripe", r: "Senior Frontend Engineer", l: "Remote · US", m: 92, t: ["React","TS","Next.js"], miss: ["Rust"] },
  { c: "Linear", r: "Staff Engineer, Web", l: "SF / Remote", m: 88, t: ["React","Perf","DX"], miss: ["Observability"] },
  { c: "Notion", r: "Frontend Engineer, Editor", l: "NYC / Remote", m: 84, t: ["React","Prosemirror"], miss: ["Prosemirror"] },
  { c: "Vercel", r: "Edge Runtime Engineer", l: "Remote", m: 76, t: ["Edge","TS"], miss: ["Edge","WASM"] },
  { c: "Figma", r: "Senior Web Engineer", l: "SF", m: 81, t: ["Canvas","React"], miss: ["WebGL"] },
  { c: "Shopify", r: "Frontend Tech Lead", l: "Remote", m: 86, t: ["React","Hydrogen"], miss: ["Hydrogen"] },
];

function Jobs() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Job Matching"
        title="Roles that actually fit you"
        description="Ranked by overall fit — not just keyword overlap. We factor experience, skills, projects and trajectory."
        actions={<Button variant="secondary">Save search</Button>}
      />

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <Card>
          <h3 className="font-display text-base font-semibold">Filters</h3>
          {[
            { l: "Location", o: ["Remote","San Francisco","New York","London"] },
            { l: "Experience", o: ["Junior","Mid","Senior","Staff+"] },
            { l: "Work model", o: ["Remote","Hybrid","Onsite"] },
            { l: "Technology", o: ["React","TypeScript","Node","AWS","Rust"] },
          ].map(g => (
            <div key={g.l} className="mt-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">{g.l}</p>
              <div className="space-y-1.5 text-sm">
                {g.o.map(o => (
                  <label key={o} className="flex items-center gap-2">
                    <input type="checkbox" className="rounded border-border" />{o}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </Card>

        <div className="space-y-4">
          {jobs.map(j => (
            <Card key={j.c+j.r} className="card-hover">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-surface text-sm font-semibold">{j.c[0]}</span>
                  <div>
                    <p className="font-display text-lg font-semibold">{j.r}</p>
                    <p className="text-sm text-muted-foreground">{j.c} · {j.l}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {j.t.map(t => <span key={t} className="rounded-md border border-border bg-surface px-2 py-0.5 text-xs">{t}</span>)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-metric text-3xl font-semibold">{j.m}<span className="text-base text-muted-foreground">%</span></div>
                  <div className="text-xs text-muted-foreground">match</div>
                </div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
                <p className="text-sm">
                  <Tint color="blue">Why it matches</Tint> <span className="ml-2">Your React + TS depth and design-system experience line up with the role's top requirements.</span>
                </p>
                <div className="flex gap-2">
                  {j.miss.length > 0 && <Tint color="lavender">Missing: {j.miss.join(", ")}</Tint>}
                  <Button variant="secondary">Save</Button>
                  <Button>Apply</Button>
                </div>
              </div>
            </Card>
          ))}
          <p className="text-center text-xs text-muted-foreground">
            Need company depth? <Link to="/company-intel" className="underline underline-offset-4">Open Company Intelligence</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
