import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card, Tint, Bar, Button } from "@/components/AppUI";
import { useState } from "react";
import { getRoadmap } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/roadmap")({
  head: () => ({ meta: [{ title: "Learning Roadmap · CareerPilot AI" }] }),
  component: Roadmap,
});

type WeekData = {
  week: string;
  topic: string;
  tasks: string[];
  resources: string[];
  project: string;
  done: number;
};

function Roadmap() {
  const [skillInput, setSkillInput] = useState("Docker, Kubernetes, Observability");
  const [weeks, setWeeks] = useState<WeekData[]>([]);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    const list = skillInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (list.length === 0) {
      toast.error("Please enter at least one skill.");
      return;
    }
    setLoading(true);
    try {
      const data = await getRoadmap(list);
      setWeeks(data.weeks);
      toast.success("Learning roadmap generated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to generate roadmap.");
    } finally {
      setLoading(false);
    }
  };

  const overall = weeks.length
    ? Math.round(weeks.reduce((a, w) => a + w.done, 0) / weeks.length)
    : 0;

  const handleMarkComplete = (index: number) => {
    const updated = [...weeks];
    updated[index].done = updated[index].done === 100 ? 0 : 100;
    setWeeks(updated);
    toast.success(
      updated[index].done === 100
        ? `${updated[index].week} marked as complete!`
        : `${updated[index].week} marked in progress.`
    );
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Learning Roadmap"
        title="Custom Career Learning Roadmap"
        description="Specify skills you want to learn — we will generate a week-by-week curriculum, tasks, and project goals."
      />

      <Card>
        <p className="mb-2 text-sm font-medium">What skills do you want to learn?</p>
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            placeholder="e.g. Docker, Kubernetes, Next.js Observability…"
            className="flex-1 rounded-lg border border-border bg-card px-3.5 py-2 text-sm outline-none focus:border-foreground/30 focus:ring-4 focus:ring-foreground/5"
          />
          <Button onClick={handleGenerate} disabled={loading}>
            {loading ? "Generating plan…" : "✦ Generate Roadmap"}
          </Button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Separate multiple skills with commas.</p>
      </Card>

      {loading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-foreground" />
        </div>
      ) : weeks.length > 0 ? (
        <div className="space-y-8 animate-fade-in">
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-display text-lg font-semibold">Overall progress</h3>
                <p className="text-sm text-muted-foreground">
                  You're on track. Complete projects and check off weeks as you progress.
                </p>
              </div>
              <div className="font-metric text-3xl font-semibold">{overall}%</div>
            </div>
            <div className="mt-4">
              <Bar value={overall} color="lavender" />
            </div>
          </Card>

          <ol className="relative space-y-5 border-l border-border pl-6">
            {weeks.map((w, i) => (
              <li key={w.week} className="relative">
                <span className="absolute -left-[31px] top-3 grid h-6 w-6 place-items-center rounded-full border border-border bg-card text-[11px] font-semibold">
                  {i + 1}
                </span>
                <Card className="card-hover">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        {w.week}
                      </p>
                      <h4 className="font-display text-lg font-semibold">{w.topic}</h4>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-metric text-sm">{w.done}%</span>
                      <button onClick={() => handleMarkComplete(i)}>
                        <Tint color={w.done === 100 ? "green" : w.done > 0 ? "blue" : "lavender"}>
                          {w.done === 100 ? "Complete" : w.done > 0 ? "In progress" : "Start week"}
                        </Tint>
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-4 md:grid-cols-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        Tasks
                      </p>
                      <ul className="mt-2 space-y-1.5 text-sm">
                        {w.tasks.map((t) => (
                          <li key={t} className="flex gap-2">
                            ○ {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        Resources
                      </p>
                      <ul className="mt-2 space-y-1.5 text-sm">
                        {w.resources.length ? (
                          w.resources.map((t) => <li key={t}>— {t}</li>)
                        ) : (
                          <li className="text-muted-foreground">No resources</li>
                        )}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        Project
                      </p>
                      <p className="mt-2 text-sm">{w.project}</p>
                    </div>
                  </div>
                </Card>
              </li>
            ))}
          </ol>
        </div>
      ) : (
        <Card className="text-center py-8">
          <p className="text-muted-foreground">Specify skills above to generate a curriculum.</p>
        </Card>
      )}
    </div>
  );
}
