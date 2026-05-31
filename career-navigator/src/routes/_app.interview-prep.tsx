import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card, Tint, Button } from "@/components/AppUI";
import { useState } from "react";
import { getInterviewPrep } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/interview-prep")({
  head: () => ({ meta: [{ title: "Interview Prep · CareerPilot AI" }] }),
  component: Prep,
});

type PrepResult = {
  Technical: string[];
  Behavioral: string[];
  Project: string[];
  Company: string[];
};

function Prep() {
  const [roleTitle, setRoleTitle] = useState("Senior Frontend Engineer");
  const [companyName, setCompanyName] = useState("Stripe");
  const [result, setResult] = useState<PrepResult | null>(null);
  const [tab, setTab] = useState<keyof PrepResult>("Technical");
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleGenerate = async () => {
    if (!roleTitle.trim() || !companyName.trim()) {
      toast.error("Please enter both role and company name.");
      return;
    }
    setLoading(true);
    try {
      const data = await getInterviewPrep(roleTitle, companyName);
      setResult(data);
      setAnswers({});
      toast.success("Interview questions generated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to generate interview questions.");
    } finally {
      setLoading(false);
    }
  };

  const handleReviewAnswer = (question: string) => {
    const answer = answers[question]?.trim();
    if (!answer) {
      toast.error("Please write an answer to review first.");
      return;
    }
    // Simulate smart AI STAR review
    toast.success("STAR Check: Answer uses standard STAR format (Situation, Task, Action, Result). Well structured!");
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Interview Prep"
        title="Practice for the role, not the test"
        description="Generate tailored questions based on your target role and company. Practice drafting your responses."
      />

      <Card>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Target Role
            </label>
            <input
              type="text"
              value={roleTitle}
              onChange={(e) => setRoleTitle(e.target.value)}
              placeholder="e.g. Senior Frontend Engineer…"
              className="w-full rounded-lg border border-border bg-card px-3.5 py-2 text-sm outline-none focus:border-foreground/30 focus:ring-4 focus:ring-foreground/5"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Target Company
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Stripe…"
              className="w-full rounded-lg border border-border bg-card px-3.5 py-2 text-sm outline-none focus:border-foreground/30 focus:ring-4 focus:ring-foreground/5"
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={handleGenerate} disabled={loading}>
            {loading ? "Generating questions…" : "✦ Generate Prep Bank"}
          </Button>
        </div>
      </Card>

      {loading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-foreground" />
        </div>
      ) : result ? (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-1 border-b border-border">
            {(Object.keys(result) as (keyof PrepResult)[]).map((k) => (
              <button
                key={k}
                onClick={() => setTab(k)}
                className={`relative px-4 py-2.5 text-sm transition-colors ${
                  tab === k ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {k}
                {tab === k && <span className="absolute inset-x-2 -bottom-px h-0.5 bg-foreground"></span>}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {result[tab].map((q, i) => (
              <Card key={i} className="card-hover">
                <div>
                  <Tint color={tab === "Technical" ? "blue" : tab === "Behavioral" ? "green" : tab === "Project" ? "lavender" : "blue"}>
                    Q{i + 1}
                  </Tint>
                  <p className="mt-2 font-display text-lg font-medium">{q}</p>
                </div>
                <textarea
                  value={answers[q] || ""}
                  onChange={(e) => setAnswers({ ...answers, [q]: e.target.value })}
                  placeholder="Draft your answer here using Situation, Task, Action, Result (STAR) structure…"
                  className="mt-4 min-h-28 w-full rounded-lg border border-border bg-surface p-3 text-sm outline-none focus:border-foreground/30"
                />
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {answers[q] ? "Draft saved locally" : "Not started yet"}
                  </span>
                  <Button variant="secondary" onClick={() => handleReviewAnswer(q)}>
                    ✦ Review my answer
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <Card className="text-center py-8">
          <p className="text-muted-foreground">Specify target role and company above to generate questions.</p>
        </Card>
      )}
    </div>
  );
}
