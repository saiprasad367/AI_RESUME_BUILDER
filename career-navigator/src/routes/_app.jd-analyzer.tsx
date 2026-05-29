import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card, Tint, Button } from "@/components/AppUI";
import { useState } from "react";

export const Route = createFileRoute("/_app/jd-analyzer")({
  head: () => ({ meta: [{ title: "JD Analyzer · CareerPilot AI" }] }),
  component: JD,
});

function JD() {
  const [analyzed, setAnalyzed] = useState(false);
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="JD Analyzer"
        title="Decode any job description"
        description="Paste a JD — we'll extract role, skills, keywords, responsibilities and what to emphasize on your resume."
      />

      <Card>
        <textarea
          placeholder="Paste the full job description here…"
          defaultValue={analyzed ? "" : ""}
          className="min-h-48 w-full rounded-lg border border-border bg-card p-4 text-sm outline-none focus:border-foreground/30 focus:ring-4 focus:ring-foreground/5"
        />
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">Works with any role · any company · any language.</p>
          <Button onClick={() => setAnalyzed(true)}>✦ Analyze</Button>
        </div>
      </Card>

      {analyzed && (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <ResultCard title="Role" items={["Senior Frontend Engineer", "IC level: L5–L6", "Remote · US"]} tint="blue" />
          <ResultCard title="Required experience" items={["5+ years frontend", "Team leadership", "Design system ownership"]} tint="lavender" />
          <ResultCard title="Core skills" items={["React","TypeScript","Next.js","GraphQL","Testing"]} tint="green" pill />
          <ResultCard title="Preferred skills" items={["Rust","WASM","Edge runtimes","Web performance"]} tint="lavender" pill />
          <ResultCard title="Technologies" items={["React","Node.js","PostgreSQL","Redis","AWS","Vercel"]} tint="blue" pill />
          <ResultCard title="Keywords" items={["accessibility","perf","mentorship","DX","observability"]} tint="green" pill />
          <Card className="md:col-span-2 lg:col-span-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold">Responsibilities</h3>
              <Tint color="blue">8 extracted</Tint>
            </div>
            <ul className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
              {["Lead frontend architecture","Mentor 3–5 engineers","Own design-system migration","Drive performance budgets","Partner with PM/Design","Set testing standards","Improve DX tooling","Champion accessibility"].map(r => (
                <li key={r} className="flex items-center gap-2"><span className="text-muted-foreground">→</span>{r}</li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </div>
  );
}

function ResultCard({ title, items, tint, pill }: { title: string; items: string[]; tint: "blue"|"green"|"lavender"; pill?: boolean }) {
  return (
    <Card className="card-hover">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-base font-semibold">{title}</h3>
        <Tint color={tint}>{items.length}</Tint>
      </div>
      <div className={`mt-3 ${pill ? "flex flex-wrap gap-1.5" : "space-y-1.5"}`}>
        {items.map(i => pill
          ? <span key={i} className="rounded-md border border-border bg-surface px-2 py-0.5 text-xs">{i}</span>
          : <p key={i} className="text-sm">{i}</p>
        )}
      </div>
    </Card>
  );
}
