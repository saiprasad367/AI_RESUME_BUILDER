import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card, Tint, Button } from "@/components/AppUI";
import { useState, useRef } from "react";
import { analyseJD, tailorResume } from "@/lib/api";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { downloadAsPdf, downloadAsWord, downloadAsText } from "@/lib/resume-utils";

export const Route = createFileRoute("/_app/resume-studio")({
  head: () => ({ meta: [{ title: "Resume Studio · CareerPilot AI" }] }),
  component: ResumeStudio,
});

type TailoredResume = {
  tailored_resume: {
    header: { name?: string; email?: string; phone?: string; location?: string };
    sections: {
      type: string;
      content?: string;
      items?: any[];
      categories?: Record<string, string[]>;
    }[];
  };
  sections: string[];
  section_reasons: Record<string, string>;
  template: string;
  filename: string;
  ats_score: { score: number; matched: string[]; missing: string[]; total_keywords: number };
};

const steps = ["Paste JD", "Tailor Resume", "Export"] as const;

function ResumeStudio() {
  const [step, setStep] = useState<(typeof steps)[number]>("Paste JD");
  const [jdText, setJdText] = useState("");
  const [jdParsed, setJdParsed] = useState<Record<string, unknown> | null>(null);
  const [result, setResult] = useState<TailoredResume | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [tailoring, setTailoring] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const handleAnalyzeJD = async () => {
    if (!jdText.trim()) { toast.error("Please paste a job description first."); return; }
    setAnalyzing(true);
    try {
      const parsed = await analyseJD(jdText);
      setJdParsed(parsed as unknown as Record<string, unknown>);
      toast.success(`JD parsed: ${parsed.role_title}${parsed.company_name ? ` at ${parsed.company_name}` : ""}`);
      setStep("Tailor Resume");
    } catch (err: any) {
      toast.error(err.message || "Failed to analyze JD. Make sure the backend is running at http://localhost:8000");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleTailor = async () => {
    if (!jdParsed) return;
    setTailoring(true);
    try {
      const data = await tailorResume(jdParsed);
      setResult(data);
      toast.success(`Resume tailored! ATS Score: ${data.ats_score.score}%`);
      setStep("Export");
    } catch (err: any) {
      toast.error(err.message || "Failed to tailor resume. Please fill in your profile first.");
    } finally {
      setTailoring(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!result) return;
    await downloadAsPdf(result);

    // Also log export to Supabase
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("resume_exports").insert({
          user_id: user.id,
          resume_data: result.tailored_resume,
          filename: result.filename,
          ats_score: result.ats_score.score,
          created_at: new Date().toISOString(),
        });
      }
    } catch (e) { /* non-fatal */ }
  };

  const handleDownloadWord = () => {
    if (!result) return;
    downloadAsWord(result);
  };

  const handleDownloadText = () => {
    if (!result) return;
    downloadAsText(result);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Resume Studio"
        title={jdParsed ? `Tailoring for ${jdParsed.role_title as string}` : "Build your tailored resume"}
        description="Paste a job description — our AI extracts requirements and tailors your profile into a targeted, ATS-optimized resume."
      />

      {/* Step tabs */}
      <div className="flex flex-wrap gap-1 border-b border-border">
        {steps.map((s) => (
          <button
            key={s}
            id={`tab-${s.replace(/\s+/g, "-").toLowerCase()}`}
            onClick={() => {
              if (s === "Tailor Resume" && !jdParsed) return;
              if (s === "Export" && !result) return;
              setStep(s);
            }}
            className={`relative px-4 py-2.5 text-sm transition-colors ${
              step === s ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            } disabled:opacity-40`}
          >
            {s}
            {step === s && <span className="absolute inset-x-2 -bottom-px h-0.5 bg-foreground" />}
          </button>
        ))}
      </div>

      {/* Step 1: Paste JD */}
      {step === "Paste JD" && (
        <div className="space-y-4">
          <Card>
            <p className="mb-3 text-sm font-medium">Paste the job description</p>
            <p className="mb-3 text-xs text-muted-foreground">Include the full text — requirements, responsibilities, and company info for best results.</p>
            <textarea
              id="jd-input"
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              placeholder="We are hiring a Senior React Developer…"
              className="min-h-56 w-full rounded-lg border border-border bg-card p-4 text-sm outline-none focus:border-foreground/30 focus:ring-4 focus:ring-foreground/5"
            />
            <div className="mt-4 flex justify-end">
              <Button id="btn-analyze-jd" onClick={handleAnalyzeJD} disabled={analyzing}>
                {analyzing ? (
                  <span className="flex items-center gap-2">
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    Analyzing JD…
                  </span>
                ) : (
                  "✦ Analyze JD →"
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Step 2: Tailor */}
      {step === "Tailor Resume" && jdParsed && (
        <div className="space-y-4">
          <Card>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Tint color="blue">{jdParsed.role_title as string}</Tint>
                <Tint color="green">{jdParsed.seniority as string}</Tint>
                <Tint color="lavender">{jdParsed.tone as string}</Tint>
                {jdParsed.company_name && <Tint color="blue">{jdParsed.company_name as string}</Tint>}
              </div>

              {(jdParsed.required_skills as string[]).length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Required skills ({(jdParsed.required_skills as string[]).length} detected)</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(jdParsed.required_skills as string[]).map((s) => (
                      <span key={s} className="rounded-md border border-border bg-surface px-2 py-0.5 text-xs">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {(jdParsed.responsibilities as string[])?.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Key responsibilities</p>
                  <ul className="space-y-1">
                    {(jdParsed.responsibilities as string[]).slice(0, 4).map((r, i) => (
                      <li key={i} className="text-xs text-muted-foreground">• {r}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Make sure your <a href="/profile" className="underline">Profile</a> is complete before tailoring.
              </p>
              <Button id="btn-tailor" onClick={handleTailor} disabled={tailoring}>
                {tailoring ? (
                  <span className="flex items-center gap-2">
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    Tailoring…
                  </span>
                ) : (
                  "✦ Tailor Resume →"
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Step 3: Export + Preview */}
      {step === "Export" && result && (
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          {/* Left: Resume Preview */}
          <div className="space-y-4">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg font-semibold">Resume Preview</h3>
                <Tint color={result.ats_score.score >= 80 ? "green" : result.ats_score.score >= 60 ? "blue" : "lavender"}>
                  ATS {result.ats_score.score}%
                </Tint>
              </div>

              <div ref={previewRef} className="rounded-lg border border-border bg-white p-5 text-[#1a1a1a]">
                {/* Header */}
                <div className="border-b-2 border-[#1a1a1a] pb-3 mb-4 text-center">
                  <h2 className="text-xl font-bold font-display">{result.tailored_resume.header?.name || "Your Name"}</h2>
                  <p className="text-xs text-gray-500 mt-1">
                    {[result.tailored_resume.header?.email, result.tailored_resume.header?.phone, result.tailored_resume.header?.location]
                      .filter(Boolean).join("  ·  ")}
                  </p>
                </div>

                {result.tailored_resume.sections.map((section, idx) => (
                  <div key={idx} className="mb-4">
                    <p className="text-[9px] font-bold uppercase tracking-[2px] text-gray-500 border-b border-gray-200 pb-1 mb-2">
                      {section.type}
                    </p>
                    {section.type === "summary" && (
                      <p className="text-xs leading-relaxed">{section.content}</p>
                    )}
                    {section.type === "skills" && section.categories && (
                      <div className="space-y-1">
                        {Object.entries(section.categories).map(([cat, skills]) => (
                          <p key={cat} className="text-xs">
                            <strong>{cat}:</strong> {(skills as string[]).join(", ")}
                          </p>
                        ))}
                      </div>
                    )}
                    {section.type === "experience" && section.items && (
                      <div className="space-y-3">
                        {section.items.map((exp: any, i: number) => (
                          <div key={i}>
                            <p className="text-xs font-semibold">{exp.title} — {exp.company}</p>
                            {exp.duration && <p className="text-[10px] text-gray-500">{exp.duration}</p>}
                            {exp.bullets?.map((b: string, bi: number) => (
                              <p key={bi} className="text-xs text-gray-700 ml-2">• {b}</p>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                    {section.type === "education" && section.items && (
                      <div className="space-y-2">
                        {section.items.map((edu: any, i: number) => (
                          <div key={i}>
                            <p className="text-xs font-semibold">{edu.degree} — {edu.institution}</p>
                            {edu.field && <p className="text-[10px] text-gray-500">{edu.field}</p>}
                          </div>
                        ))}
                      </div>
                    )}
                    {section.type === "projects" && section.items && (
                      <div className="space-y-2">
                        {section.items.map((proj: any, i: number) => (
                          <div key={i}>
                            <p className="text-xs font-semibold">{proj.name}</p>
                            {proj.description && <p className="text-xs text-gray-600">{proj.description}</p>}
                            {proj.technologies?.length > 0 && (
                              <p className="text-[10px] text-gray-500 italic">Tech: {proj.technologies.join(", ")}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    {section.type === "certifications" && section.items && (
                      <ul className="space-y-1">
                        {section.items.map((cert: any, i: number) => (
                          <li key={i} className="text-xs">• {cert.name}{cert.issuer ? ` — ${cert.issuer}` : ""}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right: ATS + Export */}
          <div className="space-y-4">
            <Card>
              <h3 className="font-display text-lg font-semibold">ATS Score Breakdown</h3>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Overall match</span>
                  <span className="font-metric text-2xl font-semibold">{result.ats_score.score}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-surface overflow-hidden">
                  <div className="h-full rounded-full bg-foreground transition-all" style={{ width: `${result.ats_score.score}%` }} />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>✓ {result.ats_score.matched.length} matched</span>
                  <span>+ {result.ats_score.missing.length} missing</span>
                  <span>{result.ats_score.total_keywords} total</span>
                </div>
              </div>
              {result.ats_score.missing.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Missing keywords</p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.ats_score.missing.slice(0, 12).map((kw) => (
                      <span key={kw} className="rounded-md border border-border bg-surface px-2 py-0.5 text-xs text-muted-foreground">+ {kw}</span>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            <Card>
              <h3 className="font-display text-lg font-semibold">Export Resume</h3>
              <div className="mt-1 space-y-1">
                <p className="text-sm text-muted-foreground">
                  Filename: <code className="rounded bg-surface px-1 py-0.5 text-xs">{result.filename}</code>
                </p>
                <p className="text-xs text-muted-foreground">
                  Template: <strong>{result.template}</strong>
                </p>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                <Button id="btn-download-pdf" onClick={handleDownloadPdf}>
                  Download PDF
                </Button>
                <Button variant="secondary" id="btn-download-word" onClick={handleDownloadWord}>
                  Download Word
                </Button>
                <Button variant="secondary" id="btn-download-txt" onClick={handleDownloadText}>
                  Download Text
                </Button>
              </div>
              <p className="mt-3 text-xs text-muted-foreground bg-surface rounded p-2">
                💡 <strong>PDF tip:</strong> If the automated PDF download is blocked by your browser, you can print the page to PDF manually.
              </p>
            </Card>

            <Card>
              <h3 className="font-display text-sm font-semibold">Sections included</h3>
              <div className="mt-3 space-y-1.5">
                {result.sections.map((s) => (
                  <div key={s} className="flex items-center gap-2 text-sm">
                    <span className="text-green-600">✓</span>
                    <span className="capitalize">{s}</span>
                    {result.section_reasons[s] && (
                      <span className="text-xs text-muted-foreground">— {result.section_reasons[s]}</span>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => { setStep("Paste JD"); setResult(null); setJdParsed(null); setJdText(""); }}>
                Start new resume
              </Button>
              <Button variant="secondary" onClick={() => setStep("Tailor Resume")}>
                ← Back to JD
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
