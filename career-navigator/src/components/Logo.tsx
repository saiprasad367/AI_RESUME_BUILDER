import { Link } from "@tanstack/react-router";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`inline-flex items-center gap-2 ${className}`}>
      <span className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-foreground text-background">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 18 L12 4 L20 18" />
          <path d="M8 14 L16 14" />
        </svg>
      </span>
      <span className="font-display text-[15px] font-semibold tracking-tight">
        CareerPilot <span className="text-muted-foreground font-normal">AI</span>
      </span>
    </Link>
  );
}
