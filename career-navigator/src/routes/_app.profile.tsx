import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card, Button } from "@/components/AppUI";
import { useState } from "react";

export const Route = createFileRoute("/_app/profile")({
  head: () => ({ meta: [{ title: "Profile · CareerPilot AI" }] }),
  component: Profile,
});

const tabs = ["Personal", "Education", "Skills", "Projects", "Certifications", "Preferences", "Connected", "Security"] as const;

function Profile() {
  const [tab, setTab] = useState<typeof tabs[number]>("Personal");
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Account"
        title="Profile"
        description="Manage your information, preferences and connected services."
        actions={<Button>Save changes</Button>}
      />
      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <Card className="h-fit">
          <nav className="flex flex-col">
            {tabs.map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`rounded-lg px-3 py-2 text-left text-sm transition-colors ${tab===t ? "bg-surface font-medium" : "text-muted-foreground hover:text-foreground"}`}>
                {t}
              </button>
            ))}
          </nav>
        </Card>
        <Card>
          {tab === "Personal" && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="grid h-16 w-16 place-items-center rounded-full bg-tint-lavender text-tint-lavender-foreground font-display text-xl font-semibold">AM</div>
                <div>
                  <p className="font-display text-lg font-semibold">Alex Morgan</p>
                  <p className="text-sm text-muted-foreground">Senior Frontend Engineer · San Francisco</p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full name" defaultValue="Alex Morgan" />
                <Field label="Email" defaultValue="alex@morgan.dev" />
                <Field label="Headline" defaultValue="Senior Frontend Engineer" />
                <Field label="Location" defaultValue="San Francisco, CA" />
              </div>
              <Field label="Bio" defaultValue="7+ years building accessible, performant React apps at scale." textarea />
            </div>
          )}
          {tab === "Education" && <Simple items={[{t:"BS Computer Science",s:"UC Berkeley · 2014–2018"}]} />}
          {tab === "Skills" && <PillList items={["React","TypeScript","Next.js","Node.js","GraphQL","Tailwind","AWS","Figma"]} />}
          {tab === "Projects" && <Simple items={[{t:"Portfolio v3",s:"Tailwind + Next.js · 2024"},{t:"A11y Audit CLI",s:"Open source · 2k stars"}]} />}
          {tab === "Certifications" && <Simple items={[{t:"AWS Certified Developer",s:"2023"}]} />}
          {tab === "Preferences" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Target role" defaultValue="Senior Frontend Engineer" />
              <Field label="Work model" defaultValue="Remote" />
              <Field label="Min compensation" defaultValue="$180k" />
              <Field label="Locations" defaultValue="Remote US, SF" />
            </div>
          )}
          {tab === "Connected" && (
            <ul className="divide-y divide-border">
              {[{n:"Google",s:"alex@morgan.dev"},{n:"GitHub",s:"@alexmorgan"},{n:"LinkedIn",s:"Not connected"}].map(x => (
                <li key={x.n} className="flex items-center justify-between py-3">
                  <div><p className="font-medium">{x.n}</p><p className="text-xs text-muted-foreground">{x.s}</p></div>
                  <Button variant="secondary">{x.s.startsWith("Not")?"Connect":"Disconnect"}</Button>
                </li>
              ))}
            </ul>
          )}
          {tab === "Security" && (
            <div className="space-y-4">
              <Field label="Current password" type="password" placeholder="••••••••" />
              <Field label="New password" type="password" placeholder="••••••••" />
              <div className="rounded-lg border border-border bg-surface p-4 text-sm">
                <p className="font-medium">Two-factor authentication</p>
                <p className="text-muted-foreground">Add an extra layer of security to your account.</p>
                <Button className="mt-3">Enable 2FA</Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function Field({ label, textarea, ...rest }: { label: string; textarea?: boolean } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {textarea
        ? <textarea defaultValue={rest.defaultValue as string} className="min-h-24 w-full rounded-lg border border-border bg-card p-3 text-sm outline-none focus:border-foreground/30 focus:ring-4 focus:ring-foreground/5" />
        : <input {...rest} className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-foreground/30 focus:ring-4 focus:ring-foreground/5" />
      }
    </label>
  );
}

function Simple({ items }: { items: { t: string; s: string }[] }) {
  return (
    <ul className="divide-y divide-border">
      {items.map(i => (
        <li key={i.t} className="flex items-center justify-between py-3">
          <div><p className="font-medium">{i.t}</p><p className="text-xs text-muted-foreground">{i.s}</p></div>
          <Button variant="secondary">Edit</Button>
        </li>
      ))}
    </ul>
  );
}

function PillList({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map(s => <span key={s} className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm">{s} ×</span>)}
      <button className="rounded-md border border-dashed border-border px-3 py-1.5 text-sm text-muted-foreground">+ Add skill</button>
    </div>
  );
}
