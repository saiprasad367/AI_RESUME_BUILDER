import { type ReactNode } from "react";

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow && <div className="text-xs font-semibold uppercase tracking-widest text-tint-blue-foreground">{eyebrow}</div>}
        <h1 className="mt-1.5 font-display text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ className = "", children }: { className?: string; children: ReactNode }) {
  return <div className={`card-soft p-6 ${className}`}>{children}</div>;
}

export function Tint({ color = "blue", children }: { color?: "blue" | "green" | "lavender"; children: ReactNode }) {
  return <span className={`rounded-md bg-tint-${color} px-1.5 py-0.5 text-[11px] font-medium text-tint-${color}-foreground`}>{children}</span>;
}

export function Bar({ value, color = "blue" }: { value: number; color?: "blue" | "green" | "lavender" | "fg" }) {
  const bg = color === "fg" ? "bg-foreground" : `bg-tint-${color}-foreground`;
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
      <div className={`h-full rounded-full ${bg}`} style={{ width: `${value}%` }} />
    </div>
  );
}

export function Ring({ value, size = 120, stroke = 10, color = "blue", sublabel }: { value: number; size?: number; stroke?: number; color?: "blue" | "green" | "lavender"; sublabel?: string }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  const strokeColor =
    color === "green" ? "oklch(0.65 0.13 155)" :
    color === "lavender" ? "oklch(0.65 0.13 295)" :
    "oklch(0.6 0.13 250)";
  return (
    <div className="relative inline-flex" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="-rotate-90" width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} stroke="oklch(0.93 0.005 247)" strokeWidth={stroke} fill="none" />
        <circle cx={size/2} cy={size/2} r={r} stroke={strokeColor} strokeWidth={stroke} fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset} />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="font-metric text-3xl font-semibold">{value}</div>
          {sublabel && <div className="text-[11px] text-muted-foreground">{sublabel}</div>}
        </div>
      </div>
    </div>
  );
}

export function Button({ variant = "primary", className = "", ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" }) {
  const cls =
    variant === "primary" ? "bg-foreground text-background hover:scale-[1.01]" :
    variant === "secondary" ? "border border-border bg-card hover:border-border-strong" :
    "text-muted-foreground hover:text-foreground";
  return <button {...rest} className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-all ${cls} ${className}`} />;
}
