import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/_app")({
  component: AppShell,
});

const nav = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/resume-studio", label: "Resume Studio" },
  { to: "/ats-analyzer", label: "ATS" },
  { to: "/jd-analyzer", label: "JD Analyzer" },
  { to: "/jobs", label: "Jobs" },
  { to: "/career-coach", label: "Coach" },
  { to: "/skill-gap", label: "Skill Gap" },
  { to: "/roadmap", label: "Roadmap" },
  { to: "/interview-prep", label: "Interview" },
] as const;

function AppShell() {
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="container-page flex h-14 items-center justify-between gap-6">
          <div className="flex items-center gap-8">
            <Logo />
            <nav className="hidden items-center gap-1 md:flex">
              {nav.map(n => {
                const active = pathname.startsWith(n.to);
                return (
                  <Link
                    key={n.to}
                    to={n.to}
                    className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${active ? "bg-surface text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    {n.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/notifications" className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground" aria-label="Notifications">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>
            </Link>
            <Link to="/profile" className="flex items-center gap-2 rounded-lg border border-border bg-card px-2 py-1.5">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-tint-lavender text-tint-lavender-foreground text-xs font-semibold">AM</span>
              <span className="hidden text-sm sm:inline">Alex</span>
            </Link>
          </div>
        </div>
        {/* mobile nav */}
        <div className="md:hidden border-t border-border">
          <div className="container-page flex gap-1 overflow-x-auto py-2 scrollbar-none">
            {nav.map(n => {
              const active = pathname.startsWith(n.to);
              return (
                <Link key={n.to} to={n.to}
                  className={`shrink-0 rounded-lg px-3 py-1.5 text-xs ${active ? "bg-surface text-foreground" : "text-muted-foreground"}`}>
                  {n.label}
                </Link>
              );
            })}
          </div>
        </div>
      </header>
      <main className="container-page py-8">
        <Outlet />
      </main>
    </div>
  );
}
