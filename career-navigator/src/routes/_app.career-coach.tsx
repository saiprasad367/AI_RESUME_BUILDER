import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card, Tint, Button } from "@/components/AppUI";
import { useEffect, useState } from "react";
import { getCoachRecommendations } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/career-coach")({
  head: () => ({ meta: [{ title: "Career Coach · CareerPilot AI" }] }),
  component: Coach,
});

type Path = {
  title: string;
  timeline: string;
  skills: string[];
};

type Course = {
  title: string;
  provider: string;
  duration: string;
};

type CoachResult = {
  paths: Path[];
  opportunities: string[];
  skills: string[];
  projects: string[];
  courses: Course[];
};

function Coach() {
  const [recommendations, setRecommendations] = useState<CoachResult | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const data = await getCoachRecommendations();
      setRecommendations(data);
    } catch (err: any) {
      toast.error(err.message || "Failed to load career coach advice.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Career Coach"
        title="Your next move, recommended"
        description="Personalized career paths, skills and projects — based on your trajectory and target roles."
        actions={<Button onClick={fetchRecommendations}>Refresh Insights</Button>}
      />

      {recommendations ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <h3 className="font-display text-lg font-semibold">Career paths</h3>
            <ul className="mt-4 space-y-3">
              {recommendations.paths.map((p) => (
                <li key={p.title} className="rounded-lg border border-border p-4 card-hover">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{p.title}</p>
                    <span className="text-xs text-muted-foreground">{p.timeline}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {p.skills.map((t) => (
                      <Tint key={t} color="blue">
                        {t}
                      </Tint>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <h3 className="font-display text-lg font-semibold">Growth opportunities</h3>
            <ul className="mt-4 space-y-3 text-sm">
              {recommendations.opportunities.map((t) => (
                <li key={t} className="flex gap-2 leading-relaxed">
                  <Tint color="green" className="shrink-0 h-fit">Try</Tint>
                  {t}
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <h3 className="font-display text-lg font-semibold">Skill recommendations</h3>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {recommendations.skills.map((s) => (
                <span key={s} className="rounded-md border border-border bg-surface px-2.5 py-1 text-xs">
                  + {s}
                </span>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="font-display text-lg font-semibold">Project suggestions</h3>
            <ul className="mt-4 space-y-3 text-sm">
              {recommendations.projects.map((t) => (
                <li key={t} className="flex gap-2 leading-relaxed">
                  <Tint color="lavender" className="shrink-0 h-fit">Build</Tint>
                  {t}
                </li>
              ))}
            </ul>
          </Card>

          <Card className="lg:col-span-2">
            <h3 className="font-display text-lg font-semibold">Learning recommendations</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {recommendations.courses.map((c) => (
                <div key={c.title} className="rounded-lg border border-border p-4 card-hover flex flex-col justify-between">
                  <div>
                    <p className="font-medium text-sm leading-snug">{c.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {c.provider} · {c.duration}
                    </p>
                  </div>
                  <Button variant="secondary" className="mt-3 w-full justify-center text-xs py-1 h-fit">
                    Add to roadmap
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      ) : (
        <Card className="text-center py-8">
          <p className="text-muted-foreground">Unable to fetch career coach insights.</p>
        </Card>
      )}
    </div>
  );
}
