import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card, Tint } from "@/components/AppUI";

export const Route = createFileRoute("/_app/notifications")({
  head: () => ({ meta: [{ title: "Notifications · CareerPilot AI" }] }),
  component: Notifications,
});

const groups = [
  { day: "Today", items: [
    { t: "ATS score improved", d: "Resume v8 reached ATS 92 — well above average.", tag: "ATS", color: "green" as const },
    { t: "New matching job", d: "Stripe — Senior Frontend Engineer · 92% match", tag: "Match", color: "blue" as const },
  ]},
  { day: "This week", items: [
    { t: "Roadmap milestone", d: "Week 2 complete: Kubernetes basics.", tag: "Roadmap", color: "lavender" as const },
    { t: "Coach suggestion", d: "Consider adding a system-design course.", tag: "Coach", color: "blue" as const },
    { t: "3 new matching jobs", d: "Linear, Notion, Figma — view all.", tag: "Match", color: "blue" as const },
  ]},
];

function Notifications() {
  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Notification Center" title="What's new for you" />
      <div className="space-y-6">
        {groups.map(g => (
          <section key={g.day}>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">{g.day}</h2>
            <div className="space-y-2">
              {g.items.map((n,i) => (
                <Card key={i} className="card-hover flex items-start gap-4">
                  <Tint color={n.color}>{n.tag}</Tint>
                  <div>
                    <p className="font-medium">{n.t}</p>
                    <p className="text-sm text-muted-foreground">{n.d}</p>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
