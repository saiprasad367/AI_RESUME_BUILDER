import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card, Tint, Button } from "@/components/AppUI";
import { useState, useRef } from "react";
import { analyseJD } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/jd-analyzer")({
  head: () => ({ meta: [{ title: "JD Analyzer · CareerPilot AI" }] }),
  component: JD,
});

type JDResult = {
  role_title: string;
  company_name: string | null;
  required_skills: string[];
  preferred_skills: string[];
  keywords: string[];
  sections_needed: string[];
  tone: string;
  seniority: string;
  page_count: number;
  industry: string;
  responsibilities: string[];
};

function JD() {
  const [result, setResult] = useState<JDResult | null>(null);
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleAnalyze = async () => {
    const jdText = textareaRef.current?.value?.trim();
    if (!jdText) {
      toast.error("Please paste a job description first.");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const data = await analyseJD(jdText);
      setResult(data);
      toast.success("Job description analyzed successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to analyze JD. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="JD Analyzer"
        title="Decode any job description"
        description="Paste a JD — we'll extract role, skills, keywords, responsibilities and what to emphasize on your resume."
      />

      <Card>
        <textarea
          ref={textareaRef}
          placeholder="Paste the full job description here…"
          className="min-h-48 w-full rounded-lg border border-border bg-card p-4 text-sm outline-none focus:border-foreground/30 focus:ring-4 focus:ring-foreground/5"
        />
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">Works with any role · any company · any language.</p>
          <Button onClick={handleAnalyze} disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-background border-t-transparent" />
                Analyzing…
              </span>
            ) : (
              "✦ Analyze"
            )}
          </Button>
        </div>
      </Card>

      {result && (
        <div className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <ResultCard
              title="Role"
              items={[
                result.role_title,
                result.company_name ? `Company: ${result.company_name}` : "Company: Not specified",
                `Seniority: ${result.seniority}`,
                `Industry: ${result.industry}`,
                `Tone: ${result.tone}`,
              ].filter(Boolean)}
              tint="blue"
            />
            <ResultCard
              title="Required Skills"
              items={result.required_skills}
              tint="green"
              pill
              emptyMsg="No required skills extracted"
            />
            <ResultCard
              title="Preferred Skills"
              items={result.preferred_skills}
              tint="lavender"
              pill
              emptyMsg="No preferred skills extracted"
            />
            <ResultCard
              title="Keywords"
              items={result.keywords}
              tint="blue"
              pill
              emptyMsg="No keywords extracted"
            />
            <ResultCard
              title="Sections Needed"
              items={result.sections_needed}
              tint="green"
              pill
              emptyMsg="Standard sections"
            />
            <Card className="card-hover">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-base font-semibold">Resume Settings</h3>
              </div>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pages</span>
                  <span className="font-medium">{result.page_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tone</span>
                  <span className="capitalize font-medium">{result.tone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Seniority</span>
                  <span className="capitalize font-medium">{result.seniority}</span>
                </div>
              </div>
            </Card>
          </div>

          {result.responsibilities.length > 0 && (
            <Card>
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-semibold">Responsibilities</h3>
                <Tint color="blue">{result.responsibilities.length} extracted</Tint>
              </div>
              <ul className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                {result.responsibilities.map((r) => (
                  <li key={r} className="flex items-start gap-2">
                    <span className="mt-0.5 text-muted-foreground shrink-0">→</span>
                    {r}
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

function ResultCard({
  title,
  items,
  tint,
  pill,
  emptyMsg,
}: {
  title: string;
  items: string[];
  tint: "blue" | "green" | "lavender";
  pill?: boolean;
  emptyMsg?: string;
}) {
  return (
    <Card className="card-hover">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-base font-semibold">{title}</h3>
        <Tint color={tint}>{items.length}</Tint>
      </div>
      <div className={`mt-3 ${pill ? "flex flex-wrap gap-1.5" : "space-y-1.5"}`}>
        {items.length === 0 ? (
          <p className="text-xs text-muted-foreground">{emptyMsg}</p>
        ) : (
          items.map((i) =>
            pill ? (
              <span key={i} className="rounded-md border border-border bg-surface px-2 py-0.5 text-xs">
                {i}
              </span>
            ) : (
              <p key={i} className="text-sm">{i}</p>
            )
          )
        )}
      </div>
    </Card>
  );
}
