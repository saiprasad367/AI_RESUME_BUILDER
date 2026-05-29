import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, Card, Ring, Bar, Tint, Button } from "@/components/AppUI";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard · CareerPilot AI" }] }),
  component: Dashboard,
});

function Dashboard() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Career OS"
        title="Welcome back, Alex"
        description="Your career is up 4 points this week. Here's where to focus next."
        actions={<>
          <Button variant="secondary">View weekly digest</Button>
          <Button>Continue resume</Button>
        </>}
      />

      {/* Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Career Health" value={86} delta="+4" tint="blue" />
        <MetricCard label="ATS Readiness" value={92} delta="+2" tint="green" />
        <MetricCard label="Job Match Strength" value={84} delta="+7" tint="lavender" />
        <MetricCard label="Skill Growth" value={71} delta="+5" tint="blue" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Insights */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">AI Insights</h2>
            <span className="text-xs text-muted-foreground">Updated 2h ago</span>
          </div>
          <ul className="mt-5 divide-y divide-border">
            {[
              { tag: "Skills", color: "blue" as const, txt: "Add Docker and CI/CD to your resume — would unlock 38 more matching roles." },
              { tag: "ATS", color: "green" as const, txt: "Quantify 3 achievements with metrics to raise your ATS score from 92 → 96." },
              { tag: "Matching", color: "lavender" as const, txt: "Your profile matches 84% of senior React roles. 5 new postings this week." },
              { tag: "Coach", color: "blue" as const, txt: "Consider a TypeScript advanced course — it appears in 71% of your target JDs." },
            ].map((i, idx) => (
              <li key={idx} className="flex items-start gap-3 py-3.5">
                <Tint color={i.color}>{i.tag}</Tint>
                <p className="text-sm">{i.txt}</p>
              </li>
            ))}
          </ul>
        </Card>

        {/* Quick actions */}
        <Card>
          <h2 className="font-display text-xl font-semibold">Quick actions</h2>
          <div className="mt-5 grid gap-2">
            {[
              { to: "/resume-studio", l: "Create resume", i: "📄" },
              { to: "/jd-analyzer", l: "Analyze job description", i: "🔎" },
              { to: "/roadmap", l: "Generate learning roadmap", i: "🗺️" },
              { to: "/interview-prep", l: "Prepare interview questions", i: "🎤" },
              { to: "/jobs", l: "Explore jobs", i: "💼" },
            ].map(a => (
              <Link key={a.to} to={a.to} className="flex items-center justify-between rounded-lg border border-border bg-card px-3.5 py-3 text-sm card-hover">
                <span className="flex items-center gap-2.5"><span>{a.i}</span>{a.l}</span>
                <span className="text-muted-foreground">→</span>
              </Link>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <h3 className="text-sm font-semibold">ATS Score (last 30 days)</h3>
          <MiniChart />
        </Card>
        <Card>
          <h3 className="text-sm font-semibold">Skill coverage</h3>
          <ul className="mt-5 space-y-3 text-sm">
            {[["React",94],["TypeScript",88],["Node.js",80],["Docker",42],["AWS",65]].map(([n,v]) => (
              <li key={n as string}>
                <div className="mb-1 flex items-center justify-between">
                  <span>{n}</span><span className="font-metric text-muted-foreground">{v}%</span>
                </div>
                <Bar value={v as number} color="fg" />
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <h3 className="text-sm font-semibold">Roadmap progress</h3>
          <div className="mt-4 flex items-center gap-4">
            <Ring value={62} sublabel="Week 3 of 6" size={110} stroke={9} color="lavender" />
            <div className="text-sm">
              <p className="text-muted-foreground">On pace to close Docker gap by</p>
              <p className="font-display text-lg">Sept 28</p>
              <Link to="/roadmap" className="mt-2 inline-flex text-sm font-medium underline underline-offset-4">View roadmap</Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({ label, value, delta, tint }: { label: string; value: number; delta: string; tint: "blue" | "green" | "lavender" }) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">{label}</span>
        <Tint color={tint}>{delta}</Tint>
      </div>
      <div className="mt-3 flex items-end justify-between">
        <span className="font-metric text-5xl font-semibold">{value}</span>
        <span className="pb-1 text-xs text-muted-foreground">/ 100</span>
      </div>
      <Bar value={value} color={tint} />
    </Card>
  );
}

function MiniChart() {
  const pts = [62, 65, 68, 66, 72, 75, 78, 81, 79, 84, 86, 88, 92];
  const max = 100;
  const w = 280, h = 100;
  const step = w / (pts.length - 1);
  const path = pts.map((v, i) => `${i === 0 ? "M" : "L"} ${i * step} ${h - (v / max) * h}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-4 w-full">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.6 0.13 250)" stopOpacity="0.25"/>
          <stop offset="100%" stopColor="oklch(0.6 0.13 250)" stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={`${path} L ${w} ${h} L 0 ${h} Z`} fill="url(#g)" />
      <path d={path} fill="none" stroke="oklch(0.18 0.012 260)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
