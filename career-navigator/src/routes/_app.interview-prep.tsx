import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card, Tint, Button } from "@/components/AppUI";
import { useState } from "react";

export const Route = createFileRoute("/_app/interview-prep")({
  head: () => ({ meta: [{ title: "Interview Prep · CareerPilot AI" }] }),
  component: Prep,
});

const buckets = {
  Technical: [
    "Explain how React's reconciliation works.",
    "Walk through optimizing LCP on a large SPA.",
    "Design an autosuggest component for 10M users.",
  ],
  Behavioral: [
    "Tell me about a time you disagreed with a teammate.",
    "Describe your proudest shipped project.",
    "How do you handle ambiguous requirements?",
  ],
  Project: [
    "What tradeoffs did you make in your design-system migration?",
    "How did you measure perf improvements?",
    "What would you do differently next time?",
  ],
  Company: [
    "Why Stripe?",
    "What of our products excites you most?",
    "Where do you see Stripe in 3 years?",
  ],
} as const;

function Prep() {
  const [tab, setTab] = useState<keyof typeof buckets>("Technical");
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Interview Prep"
        title="Practice for the role, not the test"
        description="Tailored questions for Senior Frontend Engineer at Stripe. Track your answers and improve."
        actions={<Button>Generate more</Button>}
      />
      <div className="flex flex-wrap gap-1 border-b border-border">
        {(Object.keys(buckets) as (keyof typeof buckets)[]).map(k => (
          <button key={k} onClick={() => setTab(k)} className={`relative px-4 py-2.5 text-sm transition-colors ${tab===k?"text-foreground":"text-muted-foreground hover:text-foreground"}`}>
            {k}
            {tab===k && <span className="absolute inset-x-2 -bottom-px h-0.5 bg-foreground"></span>}
          </button>
        ))}
      </div>
      <div className="space-y-4">
        {buckets[tab].map((q, i) => (
          <Card key={i} className="card-hover">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Tint color={tab === "Technical" ? "blue" : tab === "Behavioral" ? "green" : tab === "Project" ? "lavender" : "blue"}>
                  Q{i+1}
                </Tint>
                <p className="mt-2 font-display text-lg">{q}</p>
              </div>
              <Button variant="secondary">Show sample answer</Button>
            </div>
            <textarea
              placeholder="Draft your answer here — we'll review for clarity, structure (STAR), and signal."
              className="mt-4 min-h-28 w-full rounded-lg border border-border bg-surface p-3 text-sm outline-none focus:border-foreground/30"
            />
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Last saved · just now</span>
              <Button variant="secondary">✦ Review my answer</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
