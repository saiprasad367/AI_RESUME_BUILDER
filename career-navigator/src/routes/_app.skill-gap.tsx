import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card, Bar, Tint, Button } from "@/components/AppUI";
import { useState } from "react";
import { analyseJD } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/skill-gap")({
  head: () => ({ meta: [{ title: "Skill Gap · CareerPilot AI" }] }),
  component: SkillGap,
});

type GapResult = {
  role_title: string;
  match_percentage: number;
  matched_skills: string[];
  missing_skills: string[];
  future_skills: string[];
};

// Compute gap entirely in the browser from profile skills + JD parsed data
async function computeSkillGap(jdText: string): Promise<GapResult> {
  // 1. Parse JD via backend (now fully local/offline)
  const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
  const jdResp = await fetch(`${BACKEND}/api/jd/analyse`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jd_text: jdText }),
  });
  if (!jdResp.ok) throw new Error("Failed to analyze job description");
  const jdParsed = await jdResp.json();

  const reqSkills: string[] = jdParsed.required_skills || [];
  const prefSkills: string[] = jdParsed.preferred_skills || [];
  const keywords: string[] = jdParsed.keywords || [];

  // 2. Get user profile skills from Supabase
  let profileSkills: string[] = [];
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("user_profiles")
        .select("skills")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data?.skills) {
        profileSkills = Array.isArray(data.skills) ? data.skills : [];
      }
    }
  } catch {
    // Non-fatal — will show 0% match if not logged in or no profile
  }

  const profileLower = profileSkills.map((s) => s.toLowerCase().trim());

  // 3. Compute matched / missing
  const matched = reqSkills.filter((s) => profileLower.includes(s.toLowerCase().trim()));
  const missing = reqSkills.filter((s) => !profileLower.includes(s.toLowerCase().trim()));

  const matchPct = reqSkills.length > 0
    ? Math.round((matched.length / reqSkills.length) * 100)
    : 0;

  // 4. Future skills = preferred + keywords not already matched
  const alreadyHave = new Set([...profileLower, ...matched.map((s) => s.toLowerCase())]);
  const future = [...prefSkills, ...keywords]
    .filter((s) => !alreadyHave.has(s.toLowerCase().trim()))
    .filter((s, i, arr) => arr.findIndex((x) => x.toLowerCase() === s.toLowerCase()) === i)
    .slice(0, 8);

  return {
    role_title: jdParsed.role_title || "Target Role",
    match_percentage: matchPct,
    matched_skills: matched,
    missing_skills: missing.length > 0 ? missing : ["✅ You meet all required skills!"],
    future_skills: future.length > 0 ? future : ["System Design", "Cloud Architecture", "Observability"],
  };
}

function SkillGap() {
  const [jdText, setJdText] = useState("");
  const [mySkills, setMySkills] = useState("");
  const [result, setResult] = useState<GapResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [useManual, setUseManual] = useState(false);

  const handleAnalyze = async () => {
    const text = jdText.trim();
    if (!text) { toast.error("Please paste a job description first."); return; }

    setLoading(true);
    setResult(null);
    try {
      if (useManual) {
        // Manual skills path — parse JD then compare manually entered skills
        const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
        const jdResp = await fetch(`${BACKEND}/api/jd/analyse`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jd_text: text }),
        });
        if (!jdResp.ok) throw new Error("Failed to analyze JD");
        const jdParsed = await jdResp.json();

        const enteredSkills = mySkills.split(/[,\n]+/).map((s) => s.trim()).filter(Boolean);
        const enteredLower = enteredSkills.map((s) => s.toLowerCase());
        const reqSkills: string[] = jdParsed.required_skills || [];
        const matched = reqSkills.filter((s) => enteredLower.includes(s.toLowerCase()));
        const missing = reqSkills.filter((s) => !enteredLower.includes(s.toLowerCase()));
        const matchPct = reqSkills.length > 0 ? Math.round((matched.length / reqSkills.length) * 100) : 0;
        const prefSkills: string[] = jdParsed.preferred_skills || [];
        const future = prefSkills.filter((s) => !enteredLower.includes(s.toLowerCase())).slice(0, 6);

        setResult({
          role_title: jdParsed.role_title,
          match_percentage: matchPct,
          matched_skills: matched,
          missing_skills: missing.length > 0 ? missing : ["✅ You meet all required skills!"],
          future_skills: future.length > 0 ? future : ["System Design", "Cloud Architecture"],
        });
      } else {
        const data = await computeSkillGap(text);
        setResult(data);
      }
      toast.success("Skill gap analysis complete!");
    } catch (err: any) {
      toast.error(err.message || "Failed. Try entering skills manually below.");
      setUseManual(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Skill Gap Analyzer"
        title={result ? `Gap Analysis: ${result.role_title}` : "What's between you and your target role"}
        description="We compare the job's required skills against your profile to show exactly what you need to learn."
      />

      <Card>
        <p className="mb-2 text-sm font-medium">Target Job Description</p>
        <textarea
          id="skill-gap-jd"
          value={jdText}
          onChange={(e) => setJdText(e.target.value)}
          placeholder="Paste the full job description here…"
          className="min-h-36 w-full rounded-lg border border-border bg-card p-3 text-sm outline-none focus:border-foreground/30 focus:ring-4 focus:ring-foreground/5"
        />

        <div className="mt-4 flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={useManual}
              onChange={(e) => setUseManual(e.target.checked)}
              className="rounded border-border"
            />
            Enter my skills manually (instead of pulling from profile)
          </label>
        </div>

        {useManual && (
          <div className="mt-3">
            <p className="mb-1 text-xs font-medium text-muted-foreground">My skills (comma or newline separated)</p>
            <textarea
              id="manual-skills"
              value={mySkills}
              onChange={(e) => setMySkills(e.target.value)}
              placeholder="React, TypeScript, Node.js, AWS, Docker…"
              className="min-h-20 w-full rounded-lg border border-border bg-card p-3 text-sm outline-none focus:border-foreground/30 focus:ring-4 focus:ring-foreground/5"
            />
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <Button id="btn-skill-gap" onClick={handleAnalyze} disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-background border-t-transparent" />
                Analyzing…
              </span>
            ) : "✦ Analyze Skill Gap"}
          </Button>
        </div>
      </Card>

      {loading && (
        <div className="flex min-h-[20vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-foreground" />
        </div>
      )}

      {result && (
        <div className="space-y-6">
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-display text-lg font-semibold">Skill Match Score</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {result.matched_skills.length} of {result.matched_skills.length + result.missing_skills.length} required skills matched
                </p>
              </div>
              <div className="text-right">
                <div className="font-metric text-4xl font-semibold">{result.match_percentage}%</div>
                <Tint color={result.match_percentage >= 80 ? "green" : result.match_percentage >= 50 ? "blue" : "lavender"}>
                  {result.match_percentage >= 80 ? "Strong fit" : result.match_percentage >= 50 ? "Good fit" : "Skill gap exists"}
                </Tint>
              </div>
            </div>
            <div className="mt-4">
              <Bar value={result.match_percentage} color={result.match_percentage >= 80 ? "green" : "blue"} />
            </div>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg font-semibold">✓ Skills You Have</h3>
                <Tint color="green">{result.matched_skills.length}</Tint>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.matched_skills.length > 0 ? (
                  result.matched_skills.map((s) => (
                    <span key={s} className="rounded-md border border-border bg-tint-green/20 px-3 py-1.5 text-sm font-medium">
                      ✓ {s}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No profile skills matched. <a href="/profile" className="underline">Complete your profile</a> or enable "Enter skills manually" above.
                  </p>
                )}
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg font-semibold">! Skills to Learn</h3>
                <Tint color="lavender">{result.missing_skills.filter(s => !s.startsWith("✅")).length}</Tint>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.missing_skills.map((s) => (
                  <span key={s} className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                    s.startsWith("✅")
                      ? "bg-tint-green/20 text-green-800"
                      : "bg-tint-lavender px-3 py-1.5 text-tint-lavender-foreground"
                  }`}>
                    {s.startsWith("✅") ? s : `! ${s}`}
                  </span>
                ))}
              </div>
              {result.missing_skills.some(s => !s.startsWith("✅")) && (
                <p className="mt-3 text-xs text-muted-foreground">
                  💡 Add these to your profile after learning them — it'll boost your ATS score and match % instantly.
                </p>
              )}
            </Card>
          </div>

          <Card>
            <h3 className="font-display text-lg font-semibold mb-1">✦ Future-Proof Skills</h3>
            <p className="text-sm text-muted-foreground mb-4">
              These preferred and trending skills for <strong>{result.role_title}</strong> will set you apart from other candidates.
            </p>
            <div className="flex flex-wrap gap-2">
              {result.future_skills.map((s) => (
                <span key={s} className="rounded-md bg-tint-green px-3 py-1.5 text-sm text-tint-green-foreground font-medium">
                  ✦ {s}
                </span>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <a href="/roadmap">
                <Button variant="secondary">→ Build a learning roadmap for these skills</Button>
              </a>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
