import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, Card, Ring, Bar, Tint, Button } from "@/components/AppUI";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard · CareerPilot AI" }] }),
  component: Dashboard,
});

type ProfileData = {
  headline: string;
  skills: string[];
  experiences: { title: string; company: string }[];
};

function Dashboard() {
  const [userName, setUserName] = useState("there");
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [resumeCount, setResumeCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const name = user.user_metadata?.full_name || user.email?.split("@")[0] || "there";
      setUserName(name.split(" ")[0]);

      const { data: profileData } = await supabase
        .from("user_profiles")
        .select("headline, skills, experiences")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profileData) setProfile(profileData);

      const { count } = await supabase
        .from("resume_exports")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);

      setResumeCount(count || 0);
      setLoading(false);
    }
    loadData();
  }, []);

  const skills: string[] = profile?.skills || [];
  const topSkills = skills.slice(0, 5);
  const experienceCount = profile?.experiences?.length || 0;

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
        eyebrow="Career OS"
        title={`Welcome back, ${userName}`}
        description={
          profile
            ? `${profile.headline || "Update your profile headline to personalize your dashboard."}`
            : "Complete your profile to unlock AI insights and resume tailoring."
        }
        actions={
          <>
            <Link to="/profile">
              <Button variant="secondary">Edit profile</Button>
            </Link>
            <Link to="/resume-studio">
              <Button>Build resume</Button>
            </Link>
          </>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Skills on Profile" value={skills.length} suffix="added" tint="blue" />
        <StatCard label="Experience Entries" value={experienceCount} suffix="roles" tint="green" />
        <StatCard label="Resumes Exported" value={resumeCount} suffix="total" tint="lavender" />
        <StatCard label="Profile Complete" value={profile ? Math.min(100, Math.round(
          (!!profile.headline ? 20 : 0) +
          (skills.length > 0 ? 25 : 0) +
          (experienceCount > 0 ? 30 : 0) +
          25
        )) : 25} suffix="%" tint="blue" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Getting started / next steps */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">Next steps</h2>
          </div>
          <ul className="mt-5 divide-y divide-border">
            {[
              {
                tag: "Profile",
                color: profile?.headline ? ("green" as const) : ("blue" as const),
                txt: profile?.headline
                  ? `Your headline is set: "${profile.headline}"`
                  : "Add a headline to your profile to personalize your resume.",
                done: !!profile?.headline,
              },
              {
                tag: "Skills",
                color: skills.length > 0 ? ("green" as const) : ("blue" as const),
                txt: skills.length > 0
                  ? `${skills.length} skills added — keep them updated for better ATS matches.`
                  : "Add your technical skills to the profile for ATS scoring.",
                done: skills.length > 0,
              },
              {
                tag: "Experience",
                color: experienceCount > 0 ? ("green" as const) : ("lavender" as const),
                txt: experienceCount > 0
                  ? `${experienceCount} experience entries added — great for resume tailoring.`
                  : "Add your work experience so the AI can tailor bullets for each job.",
                done: experienceCount > 0,
              },
              {
                tag: "Resume",
                color: resumeCount > 0 ? ("green" as const) : ("lavender" as const),
                txt: resumeCount > 0
                  ? `You've exported ${resumeCount} resume(s). Keep tailoring for each role!`
                  : "Paste a job description in the JD Analyzer to tailor your first resume.",
                done: resumeCount > 0,
              },
            ].map((item, idx) => (
              <li key={idx} className="flex items-start gap-3 py-3.5">
                <Tint color={item.color}>{item.done ? "✓" : item.tag}</Tint>
                <p className="text-sm">{item.txt}</p>
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
              { to: "/profile", l: "Update my profile", i: "👤" },
              { to: "/jobs", l: "Explore jobs", i: "💼" },
              { to: "/interview-prep", l: "Prepare interview questions", i: "🎤" },
            ].map((a) => (
              <Link
                key={a.to}
                to={a.to}
                className="flex items-center justify-between rounded-lg border border-border bg-card px-3.5 py-3 text-sm card-hover"
              >
                <span className="flex items-center gap-2.5">
                  <span>{a.i}</span>
                  {a.l}
                </span>
                <span className="text-muted-foreground">→</span>
              </Link>
            ))}
          </div>
        </Card>
      </div>

      {topSkills.length > 0 && (
        <Card>
          <h3 className="text-sm font-semibold">Your top skills</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {topSkills.map((skill) => (
              <span
                key={skill}
                className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm"
              >
                {skill}
              </span>
            ))}
            {skills.length > 5 && (
              <Link to="/profile">
                <span className="rounded-md border border-dashed border-border px-3 py-1.5 text-sm text-muted-foreground">
                  +{skills.length - 5} more →
                </span>
              </Link>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  suffix,
  tint,
}: {
  label: string;
  value: number;
  suffix: string;
  tint: "blue" | "green" | "lavender";
}) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
        <Tint color={tint}>{suffix}</Tint>
      </div>
      <div className="mt-3">
        <span className="font-metric text-5xl font-semibold">{value}</span>
      </div>
      <Bar value={Math.min(value * 10, 100)} color={tint} />
    </Card>
  );
}
