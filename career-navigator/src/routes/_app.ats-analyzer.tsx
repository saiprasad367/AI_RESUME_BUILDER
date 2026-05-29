import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card, Ring, Bar, Tint, Button } from "@/components/AppUI";

export const Route = createFileRoute("/_app/ats-analyzer")({
  head: () => ({ meta: [{ title: "ATS Analyzer · CareerPilot AI" }] }),
  component: ATS,
});

function ATS() {
  const breakdown = [
    { l: "Keyword Match", v: 91, c: "blue" as const },
    { l: "Experience Match", v: 88, c: "green" as const },
    { l: "Skills Match", v: 84, c: "lavender" as const },
    { l: "Project Match", v: 78, c: "blue" as const },
    { l: "Education Match", v: 95, c: "green" as const },
  ];
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="ATS Analyzer"
        title="How recruiters' systems see your resume"
        description="Live scoring against the same parsing models used by modern ATS platforms."
        actions={<Button>Re-run analysis</Button>}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Card className="flex flex-col items-center justify-center text-center">
          <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Overall ATS Score</div>
          <div className="mt-4"><Ring value={92} size={180} stroke={12} color="green" sublabel="Excellent" /></div>
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">Your resume is well-formatted, keyword-aligned, and parses cleanly across major ATS systems.</p>
          <div className="mt-4 flex gap-2"><Tint color="green">+4 this week</Tint><Tint color="blue">Top 8%</Tint></div>
        </Card>

        <Card>
          <h3 className="font-display text-lg font-semibold">Score breakdown</h3>
          <ul className="mt-5 space-y-4">
            {breakdown.map(b => (
              <li key={b.l}>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-sm">{b.l}</span>
                  <span className="font-metric text-sm text-muted-foreground">{b.v}</span>
                </div>
                <Bar value={b.v} color={b.c} />
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="font-display text-lg font-semibold">Missing keywords</h3>
          <p className="mt-1 text-sm text-muted-foreground">Add these to lift your match for similar roles.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {["Docker","Kubernetes","CI/CD","Terraform","E2E testing","Observability"].map(k => (
              <span key={k} className="rounded-md border border-border bg-surface px-2.5 py-1 text-xs">+ {k}</span>
            ))}
          </div>
        </Card>
        <Card>
          <h3 className="font-display text-lg font-semibold">Improvement suggestions</h3>
          <ul className="mt-4 space-y-3 text-sm">
            {[
              "Quantify 3 achievements with metrics (e.g. \"reduced LCP by 56%\").",
              "Add a one-line headline near the top — improves parser ranking.",
              "Replace passive verbs with action verbs in the Linear role.",
            ].map((s,i) => (
              <li key={i} className="flex gap-3"><Tint color="blue">Fix</Tint>{s}</li>
            ))}
          </ul>
        </Card>
      </div>

      <Card>
        <h3 className="font-display text-lg font-semibold">ATS history</h3>
        <p className="mt-1 text-sm text-muted-foreground">Score across the last 12 resume revisions.</p>
        <ChartHistory />
      </Card>
    </div>
  );
}

function ChartHistory() {
  const pts = [62,68,72,70,74,78,80,83,85,88,90,92];
  const w = 720, h = 160, max = 100;
  const step = w / (pts.length - 1);
  const path = pts.map((v,i) => `${i===0?"M":"L"} ${i*step} ${h-(v/max)*h}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-5 w-full">
      <defs>
        <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.65 0.13 155)" stopOpacity="0.25"/>
          <stop offset="100%" stopColor="oklch(0.65 0.13 155)" stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={`${path} L ${w} ${h} L 0 ${h} Z`} fill="url(#ag)" />
      <path d={path} fill="none" stroke="oklch(0.18 0.012 260)" strokeWidth="2.5" strokeLinecap="round" />
      {pts.map((v,i) => <circle key={i} cx={i*step} cy={h-(v/max)*h} r="3" fill="oklch(0.18 0.012 260)" />)}
    </svg>
  );
}
