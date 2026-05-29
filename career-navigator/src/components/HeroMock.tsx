export function ResumePreviewCard() {
  return (
    <div className="card-soft p-5 w-full max-w-[340px]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Resume</div>
          <div className="text-sm font-semibold">Senior Frontend Engineer</div>
        </div>
        <span className="rounded-full bg-tint-green px-2 py-0.5 text-[10px] font-medium text-tint-green-foreground">ATS Ready</span>
      </div>
      <div className="space-y-3">
        <div>
          <div className="h-2.5 w-32 rounded bg-foreground/85"></div>
          <div className="mt-1.5 h-1.5 w-44 rounded bg-foreground/15"></div>
        </div>
        <div className="space-y-1.5 pt-2">
          <div className="h-1.5 w-full rounded bg-foreground/15"></div>
          <div className="h-1.5 w-[92%] rounded bg-foreground/15"></div>
          <div className="h-1.5 w-[78%] rounded bg-foreground/15"></div>
        </div>
        <div className="pt-2">
          <div className="h-2 w-20 rounded bg-foreground/70"></div>
          <div className="mt-2 space-y-1.5">
            <div className="h-1.5 w-full rounded bg-foreground/15"></div>
            <div className="h-1.5 w-[88%] rounded bg-foreground/15"></div>
            <div className="h-1.5 w-[70%] rounded bg-foreground/15"></div>
          </div>
        </div>
        <div className="pt-2 flex flex-wrap gap-1.5">
          {["React", "TypeScript", "Node", "AWS", "Docker"].map(s => (
            <span key={s} className="rounded-md bg-surface px-2 py-0.5 text-[10px] text-muted-foreground border border-border">{s}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ScoreRing({ value, label, tint = "blue" }: { value: number; label: string; tint?: "blue" | "green" | "lavender" }) {
  const r = 28;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  const stroke =
    tint === "green" ? "oklch(0.65 0.13 155)" :
    tint === "lavender" ? "oklch(0.65 0.13 295)" :
    "oklch(0.6 0.13 250)";
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-16 w-16">
        <svg viewBox="0 0 72 72" className="h-16 w-16 -rotate-90">
          <circle cx="36" cy="36" r={r} stroke="oklch(0.93 0.005 247)" strokeWidth="6" fill="none" />
          <circle cx="36" cy="36" r={r} stroke={stroke} strokeWidth="6" fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset} />
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <span className="font-metric text-sm font-semibold">{value}</span>
        </div>
      </div>
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-sm font-semibold">/ 100</div>
      </div>
    </div>
  );
}

export function HeroProductMock() {
  return (
    <div className="relative">
      <div className="absolute -inset-6 -z-10 rounded-[28px] bg-gradient-to-br from-tint-blue via-tint-lavender to-tint-green opacity-60 blur-2xl"></div>
      <div className="card-soft overflow-hidden p-5">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-foreground/15"></span>
            <span className="h-2.5 w-2.5 rounded-full bg-foreground/15"></span>
            <span className="h-2.5 w-2.5 rounded-full bg-foreground/15"></span>
          </div>
          <span className="text-[11px] text-muted-foreground">careerpilot.ai / dashboard</span>
          <span></span>
        </div>
        <div className="pt-5">
          <div className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">Career Health</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-metric text-5xl font-semibold">86</span>
            <span className="text-sm text-tint-green-foreground">+4 this week</span>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-tint-blue/60 p-3">
            <ScoreRing value={92} label="ATS Score" tint="blue" />
          </div>
          <div className="rounded-xl bg-tint-green/60 p-3">
            <ScoreRing value={84} label="Job Match" tint="green" />
          </div>
          <div className="rounded-xl bg-tint-lavender/60 p-3">
            <ScoreRing value={71} label="Skill Growth" tint="lavender" />
          </div>
        </div>
        <div className="mt-5 grid grid-cols-5 gap-3">
          <div className="col-span-3 card-soft p-4">
            <div className="text-xs text-muted-foreground">AI Insight</div>
            <div className="mt-1 text-sm font-medium leading-snug">
              Add <span className="rounded bg-tint-blue px-1.5 py-0.5 text-tint-blue-foreground">Docker</span> &amp; <span className="rounded bg-tint-green px-1.5 py-0.5 text-tint-green-foreground">CI/CD</span> to unlock 38 more matching roles.
            </div>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
              <div className="h-full w-[72%] rounded-full bg-foreground"></div>
            </div>
            <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
              <span>Skill coverage</span><span>72%</span>
            </div>
          </div>
          <div className="col-span-2">
            <ResumePreviewCard />
          </div>
        </div>
      </div>
    </div>
  );
}
