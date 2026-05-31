import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card, Ring, Bar, Tint, Button } from "@/components/AppUI";
import { useState } from "react";
import { analyseJD } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/ats-analyzer")({
  head: () => ({ meta: [{ title: "ATS Analyzer · CareerPilot AI" }] }),
  component: ATS,
});

type ATSResult = {
  score: number;
  matched: string[];
  missing: string[];
  total_keywords: number;
  role_title: string;
};

// Local ATS scorer — keyword match between resume text and JD keywords
function scoreLocally(resumeText: string, jdParsed: any): ATSResult {
  const lower = resumeText.toLowerCase();
  const allKeywords = [
    ...(jdParsed.required_skills || []),
    ...(jdParsed.preferred_skills || []),
    ...(jdParsed.keywords || []),
  ];
  const seen = new Set<string>();
  const unique = allKeywords.filter((kw: string) => {
    const k = kw.toLowerCase().trim();
    if (!k || seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  const matched: string[] = [];
  const missing: string[] = [];
  for (const kw of unique) {
    if (lower.includes(kw.toLowerCase().trim())) {
      matched.push(kw);
    } else {
      // multi-word partial match
      const words = kw.toLowerCase().split(/\s+/);
      if (words.every((w) => lower.includes(w))) {
        matched.push(kw);
      } else {
        missing.push(kw);
      }
    }
  }

  const score = unique.length > 0 ? Math.round((matched.length / unique.length) * 100) : 0;
  return { score, matched, missing, total_keywords: unique.length, role_title: jdParsed.role_title };
}

function ATS() {
  const [jdText, setJdText] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ATSResult | null>(null);

  const handleRun = async () => {
    if (!jdText.trim()) {
      toast.error("Please paste a job description to analyze against.");
      return;
    }
    if (!resumeText.trim()) {
      toast.error("Please paste your resume text to score against the JD.");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const parsed = await analyseJD(jdText);
      const scored = scoreLocally(resumeText, parsed);
      setResult(scored);
      toast.success(`ATS Score: ${scored.score}% for ${parsed.role_title}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to run ATS analysis. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = result
    ? result.score >= 80 ? "green" : result.score >= 60 ? "blue" : "lavender"
    : "green";
  const scoreLabel = result
    ? result.score >= 80 ? "Excellent" : result.score >= 60 ? "Good" : "Needs Work"
    : "";

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="ATS Analyzer"
        title="How recruiters' systems see your resume"
        description="Paste your resume and a job description — we'll score your match using real keyword analysis."
        actions={
          <Button onClick={handleRun} disabled={loading} id="btn-run-ats">
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-background border-t-transparent" />
                Analyzing…
              </span>
            ) : (
              "▶ Run ATS Analysis"
            )}
          </Button>
        }
      />

      {/* Two-column inputs */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <p className="mb-2 text-sm font-medium">Your Resume Text</p>
          <p className="mb-3 text-xs text-muted-foreground">Paste plain text from your resume (copy from Word/PDF)</p>
          <textarea
            id="ats-resume-input"
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste your resume content here — skills, experience, education…"
            className="min-h-52 w-full rounded-lg border border-border bg-card p-4 text-sm outline-none focus:border-foreground/30 focus:ring-4 focus:ring-foreground/5"
          />
        </Card>
        <Card>
          <p className="mb-2 text-sm font-medium">Job Description</p>
          <p className="mb-3 text-xs text-muted-foreground">Paste the full job posting you're applying to</p>
          <textarea
            id="ats-jd-input"
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            placeholder="Paste the full job description here…"
            className="min-h-52 w-full rounded-lg border border-border bg-card p-4 text-sm outline-none focus:border-foreground/30 focus:ring-4 focus:ring-foreground/5"
          />
        </Card>
      </div>

      {!result && !loading && (
        <div className="py-6 text-center text-sm text-muted-foreground">
          Fill in both fields above and click "Run ATS Analysis" to see your score.
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center gap-3 py-10">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
          <span className="text-sm text-muted-foreground">Analyzing keywords…</span>
        </div>
      )}

      {result && (
        <>
          <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
            <Card className="flex flex-col items-center justify-center text-center">
              <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                ATS Score — {result.role_title}
              </div>
              <div className="mt-4">
                <Ring value={result.score} size={180} stroke={12} color={scoreColor as any} sublabel={scoreLabel} />
              </div>
              <p className="mt-4 max-w-xs text-sm text-muted-foreground">
                Your resume matches <strong>{result.matched.length}</strong> of{" "}
                <strong>{result.total_keywords}</strong> keywords from the job description.
              </p>
              <div className="mt-4 flex gap-2 flex-wrap justify-center">
                <Tint color={scoreColor as any}>{result.score}% match</Tint>
                <Tint color="green">{result.matched.length} matched</Tint>
                <Tint color="lavender">{result.missing.length} missing</Tint>
              </div>
            </Card>

            <Card>
              <h3 className="font-display text-lg font-semibold">Keyword Breakdown</h3>
              <ul className="mt-5 space-y-4">
                <li>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-sm">Matched keywords</span>
                    <span className="font-metric text-sm text-muted-foreground">{result.matched.length}</span>
                  </div>
                  <Bar value={Math.round((result.matched.length / Math.max(result.total_keywords, 1)) * 100)} color="green" />
                </li>
                <li>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-sm">Missing keywords</span>
                    <span className="font-metric text-sm text-muted-foreground">{result.missing.length}</span>
                  </div>
                  <Bar value={Math.round((result.missing.length / Math.max(result.total_keywords, 1)) * 100)} color="lavender" />
                </li>
                <li>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-sm">Total JD keywords detected</span>
                    <span className="font-metric text-sm text-muted-foreground">{result.total_keywords}</span>
                  </div>
                  <Bar value={100} color="blue" />
                </li>
              </ul>

              {result.score < 80 && (
                <div className="mt-4 rounded-lg bg-surface p-3 text-xs text-muted-foreground">
                  💡 <strong>Tip:</strong> Add missing keywords naturally into your skills, experience bullets, and summary to increase your ATS match.
                </div>
              )}
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <h3 className="font-display text-lg font-semibold">✓ Matched Keywords</h3>
              <p className="mt-1 text-sm text-muted-foreground">These are already in your resume — great!</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {result.matched.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No matching keywords found. Update your resume skills section.</p>
                ) : (
                  result.matched.map((k) => (
                    <span key={k} className="rounded-md border border-border bg-tint-green/20 px-2.5 py-1 text-xs">
                      ✓ {k}
                    </span>
                  ))
                )}
              </div>
            </Card>

            <Card>
              <h3 className="font-display text-lg font-semibold">+ Missing Keywords</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Add these to your resume to boost your ATS score.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {result.missing.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No missing keywords — perfect match!</p>
                ) : (
                  result.missing.map((k) => (
                    <span key={k} className="rounded-md border border-border bg-surface px-2.5 py-1 text-xs">
                      + {k}
                    </span>
                  ))
                )}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
