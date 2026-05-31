import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card, Button } from "@/components/AppUI";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/profile")({
  head: () => ({ meta: [{ title: "Profile · CareerPilot AI" }] }),
  component: Profile,
});

const tabs = ["Personal", "Experience", "Education", "Skills", "Projects", "Certifications", "Security"] as const;

type ProfileData = {
  full_name: string;
  email: string;
  headline: string;
  location: string;
  bio: string;
  experiences: { title: string; company: string; description: string; skills_used?: string[]; bullets?: string[] }[];
  education: { degree: string; institution: string; field: string; year: string }[];
  skills: string[];
  projects: { name: string; description: string; technologies: string[] }[];
  certifications: { name: string; issuer: string; year: string }[];
};

const EMPTY_PROFILE: ProfileData = {
  full_name: "",
  email: "",
  headline: "",
  location: "",
  bio: "",
  experiences: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
};

function Profile() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Personal");
  const [profile, setProfile] = useState<ProfileData>(EMPTY_PROFILE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [newSkill, setNewSkill] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const fetchProfile = useCallback(async (uid: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", uid)
        .maybeSingle();

      if (error) throw error;

      const { data: { user } } = await supabase.auth.getUser();
      const baseProfile: ProfileData = {
        full_name: user?.user_metadata?.full_name || "",
        email: user?.email || "",
        headline: "",
        location: "",
        bio: "",
        experiences: [],
        education: [],
        skills: [],
        projects: [],
        certifications: [],
      };

      if (data) {
        setProfile({
          ...baseProfile,
          headline: data.headline || "",
          location: data.location || "",
          bio: data.bio || "",
          experiences: data.experiences || [],
          education: data.education || [],
          skills: data.skills || [],
          projects: data.projects || [],
          certifications: data.certifications || [],
        });
      } else {
        setProfile(baseProfile);
      }
    } catch (err: any) {
      toast.error("Failed to load profile: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id);
        fetchProfile(user.id);
      }
    });
  }, [fetchProfile]);

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      // Update auth metadata (name)
      await supabase.auth.updateUser({ data: { full_name: profile.full_name } });

      // Upsert profile data
      const { error } = await supabase.from("user_profiles").upsert({
        user_id: userId,
        headline: profile.headline,
        location: profile.location,
        bio: profile.bio,
        experiences: profile.experiences,
        education: profile.education,
        skills: profile.skills,
        projects: profile.projects,
        certifications: profile.certifications,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });

      if (error) throw error;
      toast.success("Profile saved successfully!");
    } catch (err: any) {
      toast.error("Failed to save profile: " + (err.message || "Unknown error"));
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!newPassword) {
      toast.error("Please enter a new password.");
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
    }
  };

  const addSkill = () => {
    const trimmed = newSkill.trim();
    if (trimmed && !profile.skills.includes(trimmed)) {
      setProfile((p) => ({ ...p, skills: [...p.skills, trimmed] }));
      setNewSkill("");
    }
  };

  const removeSkill = (skill: string) => {
    setProfile((p) => ({ ...p, skills: p.skills.filter((s) => s !== skill) }));
  };

  const initials = profile.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

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
        eyebrow="Account"
        title="Profile"
        description="Manage your information used to tailor resumes and match jobs."
        actions={
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <Card className="h-fit">
          <nav className="flex flex-col">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`rounded-lg px-3 py-2 text-left text-sm transition-colors ${tab === t ? "bg-surface font-medium" : "text-muted-foreground hover:text-foreground"}`}
              >
                {t}
              </button>
            ))}
          </nav>
        </Card>

        <Card>
          {tab === "Personal" && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="grid h-16 w-16 place-items-center rounded-full bg-tint-lavender text-tint-lavender-foreground font-display text-xl font-semibold">
                  {initials}
                </div>
                <div>
                  <p className="font-display text-lg font-semibold">{profile.full_name || "Your Name"}</p>
                  <p className="text-sm text-muted-foreground">{profile.headline || "Add a headline"}</p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Full name"
                  value={profile.full_name}
                  onChange={(e) => setProfile((p) => ({ ...p, full_name: e.target.value }))}
                />
                <Field
                  label="Email"
                  value={profile.email}
                  disabled
                  type="email"
                />
                <Field
                  label="Headline"
                  value={profile.headline}
                  onChange={(e) => setProfile((p) => ({ ...p, headline: e.target.value }))}
                  placeholder="e.g. Senior Frontend Engineer"
                />
                <Field
                  label="Location"
                  value={profile.location}
                  onChange={(e) => setProfile((p) => ({ ...p, location: e.target.value }))}
                  placeholder="e.g. San Francisco, CA"
                />
              </div>
              <Field
                label="Bio"
                value={profile.bio}
                onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
                textarea
                placeholder="Brief professional summary…"
              />
            </div>
          )}

          {tab === "Experience" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-base font-semibold">Work Experience</h3>
                <Button
                  variant="secondary"
                  onClick={() =>
                    setProfile((p) => ({
                      ...p,
                      experiences: [...p.experiences, { title: "", company: "", description: "", skills_used: [], bullets: [] }],
                    }))
                  }
                >
                  + Add Experience
                </Button>
              </div>
              {profile.experiences.length === 0 && (
                <p className="text-sm text-muted-foreground">No experience entries added yet.</p>
              )}
              {profile.experiences.map((exp, i) => (
                <div key={i} className="rounded-lg border border-border p-4 space-y-3 bg-surface/50">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Job Title" value={exp.title} onChange={(e) => {
                      const exps = [...profile.experiences]; exps[i].title = e.target.value; setProfile((p) => ({ ...p, experiences: exps }));
                    }} placeholder="e.g. Senior Software Engineer" />
                    <Field label="Company" value={exp.company} onChange={(e) => {
                      const exps = [...profile.experiences]; exps[i].company = e.target.value; setProfile((p) => ({ ...p, experiences: exps }));
                    }} placeholder="e.g. Stripe" />
                  </div>
                  <Field label="Description" value={exp.description} onChange={(e) => {
                    const exps = [...profile.experiences]; exps[i].description = e.target.value; setProfile((p) => ({ ...p, experiences: exps }));
                  }} textarea placeholder="Brief description of the role…" />
                  <Field label="Skills Used (comma-separated)" value={(exp.skills_used || []).join(", ")} onChange={(e) => {
                    const exps = [...profile.experiences]; exps[i].skills_used = e.target.value.split(",").map((t) => t.trim()).filter(Boolean); setProfile((p) => ({ ...p, experiences: exps }));
                  }} placeholder="e.g. React, TypeScript, Node.js" />
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium">Achievement Bullets (One per line)</span>
                    <textarea
                      value={(exp.bullets || []).join("\n")}
                      onChange={(e) => {
                        const exps = [...profile.experiences];
                        exps[i].bullets = e.target.value.split("\n").map((line) => line.trim()).filter(Boolean);
                        setProfile((p) => ({ ...p, experiences: exps }));
                      }}
                      placeholder="e.g. Shipped a performance initiative that cut LCP from 3.2s to 1.4s.&#10;Mentored 4 junior frontend developers."
                      className="min-h-24 w-full rounded-lg border border-border bg-card p-3 text-sm outline-none focus:border-foreground/30 focus:ring-4 focus:ring-foreground/5"
                    />
                  </label>
                  <button
                    className="text-xs text-destructive hover:underline"
                    onClick={() => setProfile((p) => ({ ...p, experiences: p.experiences.filter((_, j) => j !== i) }))}
                  >
                    Remove Experience
                  </button>
                </div>
              ))}
            </div>
          )}

          {tab === "Education" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-base font-semibold">Education</h3>
                <Button
                  variant="secondary"
                  onClick={() =>
                    setProfile((p) => ({
                      ...p,
                      education: [...p.education, { degree: "", institution: "", field: "", year: "" }],
                    }))
                  }
                >
                  + Add
                </Button>
              </div>
              {profile.education.length === 0 && (
                <p className="text-sm text-muted-foreground">No education added yet.</p>
              )}
              {profile.education.map((edu, i) => (
                <div key={i} className="rounded-lg border border-border p-4 space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Degree" value={edu.degree} onChange={(e) => {
                      const ed = [...profile.education]; ed[i].degree = e.target.value; setProfile((p) => ({ ...p, education: ed }));
                    }} placeholder="e.g. B.S. Computer Science" />
                    <Field label="Institution" value={edu.institution} onChange={(e) => {
                      const ed = [...profile.education]; ed[i].institution = e.target.value; setProfile((p) => ({ ...p, education: ed }));
                    }} placeholder="e.g. UC Berkeley" />
                    <Field label="Field of Study" value={edu.field} onChange={(e) => {
                      const ed = [...profile.education]; ed[i].field = e.target.value; setProfile((p) => ({ ...p, education: ed }));
                    }} placeholder="e.g. Computer Science" />
                    <Field label="Graduation Year" value={edu.year} onChange={(e) => {
                      const ed = [...profile.education]; ed[i].year = e.target.value; setProfile((p) => ({ ...p, education: ed }));
                    }} placeholder="e.g. 2022" />
                  </div>
                  <button
                    className="text-xs text-destructive hover:underline"
                    onClick={() => setProfile((p) => ({ ...p, education: p.education.filter((_, j) => j !== i) }))}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          {tab === "Skills" && (
            <div className="space-y-4">
              <h3 className="font-display text-base font-semibold">Skills</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addSkill()}
                  placeholder="Type a skill and press Enter…"
                  className="flex-1 rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-foreground/30 focus:ring-4 focus:ring-foreground/5"
                />
                <Button onClick={addSkill}>Add</Button>
              </div>
              {profile.skills.length === 0 && (
                <p className="text-sm text-muted-foreground">No skills added yet.</p>
              )}
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((s) => (
                  <span
                    key={s}
                    className="flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 text-sm"
                  >
                    {s}
                    <button onClick={() => removeSkill(s)} className="text-muted-foreground hover:text-destructive">×</button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {tab === "Projects" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-base font-semibold">Projects</h3>
                <Button
                  variant="secondary"
                  onClick={() =>
                    setProfile((p) => ({
                      ...p,
                      projects: [...p.projects, { name: "", description: "", technologies: [] }],
                    }))
                  }
                >
                  + Add
                </Button>
              </div>
              {profile.projects.length === 0 && (
                <p className="text-sm text-muted-foreground">No projects added yet.</p>
              )}
              {profile.projects.map((proj, i) => (
                <div key={i} className="rounded-lg border border-border p-4 space-y-3">
                  <Field label="Project Name" value={proj.name} onChange={(e) => {
                    const pr = [...profile.projects]; pr[i].name = e.target.value; setProfile((p) => ({ ...p, projects: pr }));
                  }} placeholder="e.g. Portfolio v3" />
                  <Field label="Description" value={proj.description} onChange={(e) => {
                    const pr = [...profile.projects]; pr[i].description = e.target.value; setProfile((p) => ({ ...p, projects: pr }));
                  }} textarea placeholder="What did you build and why?" />
                  <Field label="Technologies (comma-separated)" value={proj.technologies.join(", ")} onChange={(e) => {
                    const pr = [...profile.projects]; pr[i].technologies = e.target.value.split(",").map((t) => t.trim()).filter(Boolean); setProfile((p) => ({ ...p, projects: pr }));
                  }} placeholder="e.g. React, TypeScript, Node.js" />
                  <button
                    className="text-xs text-destructive hover:underline"
                    onClick={() => setProfile((p) => ({ ...p, projects: p.projects.filter((_, j) => j !== i) }))}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          {tab === "Certifications" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-base font-semibold">Certifications</h3>
                <Button
                  variant="secondary"
                  onClick={() =>
                    setProfile((p) => ({
                      ...p,
                      certifications: [...p.certifications, { name: "", issuer: "", year: "" }],
                    }))
                  }
                >
                  + Add
                </Button>
              </div>
              {profile.certifications.length === 0 && (
                <p className="text-sm text-muted-foreground">No certifications added yet.</p>
              )}
              {profile.certifications.map((cert, i) => (
                <div key={i} className="rounded-lg border border-border p-4 space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Certificate Name" value={cert.name} onChange={(e) => {
                      const cr = [...profile.certifications]; cr[i].name = e.target.value; setProfile((p) => ({ ...p, certifications: cr }));
                    }} placeholder="e.g. AWS Certified Developer" />
                    <Field label="Issuing Organization" value={cert.issuer} onChange={(e) => {
                      const cr = [...profile.certifications]; cr[i].issuer = e.target.value; setProfile((p) => ({ ...p, certifications: cr }));
                    }} placeholder="e.g. Amazon Web Services" />
                    <Field label="Year" value={cert.year} onChange={(e) => {
                      const cr = [...profile.certifications]; cr[i].year = e.target.value; setProfile((p) => ({ ...p, certifications: cr }));
                    }} placeholder="e.g. 2023" />
                  </div>
                  <button
                    className="text-xs text-destructive hover:underline"
                    onClick={() => setProfile((p) => ({ ...p, certifications: p.certifications.filter((_, j) => j !== i) }))}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          {tab === "Security" && (
            <div className="space-y-4">
              <h3 className="font-display text-base font-semibold">Change Password</h3>
              <Field
                label="Current password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
              />
              <Field
                label="New password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
              />
              <Button onClick={handlePasswordChange}>Update Password</Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function Field({
  label,
  textarea,
  ...rest
}: { label: string; textarea?: boolean } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {textarea ? (
        <textarea
          value={rest.value as string}
          onChange={rest.onChange as any}
          placeholder={rest.placeholder}
          className="min-h-24 w-full rounded-lg border border-border bg-card p-3 text-sm outline-none focus:border-foreground/30 focus:ring-4 focus:ring-foreground/5"
        />
      ) : (
        <input
          {...rest}
          className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-foreground/30 focus:ring-4 focus:ring-foreground/5 disabled:opacity-50"
        />
      )}
    </label>
  );
}
