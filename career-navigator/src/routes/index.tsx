import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { HeroProductMock } from "@/components/HeroMock";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CareerPilot AI — Your Career, Optimized by AI" },
      { name: "description", content: "An AI Career Operating System: ATS-optimized resumes, JD analysis, skill-gap intelligence, interview prep and job matching — all in one place." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <Hero />
        <LogoStrip />
        <Problem />
        <HowItWorks />
        <Features />
        <DemoSection />
        <Testimonials />
        <Faq />
        <FinalCta />
      </main>
      <SiteFooter />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 grid-bg mask-fade-b opacity-70"></div>
      <div className="container-page grid items-center gap-14 pb-20 pt-16 lg:grid-cols-[1.05fr_1fr] lg:pt-24">
        <div className="animate-fade-in-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground shadow-soft">
            <span className="h-1.5 w-1.5 rounded-full bg-tint-green-foreground"></span>
            New · AI Career OS for 2026
          </span>
          <h1 className="mt-5 font-display text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-[68px]">
            Your Career.<br/>
            <span className="text-muted-foreground">Optimized by AI.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            CareerPilot AI learns from your skills, resumes, job descriptions, ATS performance, and career goals to continuously improve your job readiness.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to="/signup" className="inline-flex items-center gap-2 rounded-xl bg-foreground px-5 py-3 text-sm font-medium text-background shadow-soft transition-transform hover:scale-[1.02]">
              Get Started Free
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
            </Link>
            <a href="#demo" className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-medium hover:border-border-strong">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              Watch Demo
            </a>
          </div>
          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2"><Check/> Works with any resume</div>
            <div className="flex items-center gap-2"><Check/> ATS-tested templates</div>
            <div className="flex items-center gap-2"><Check/> No credit card</div>
          </div>
        </div>
        <div className="animate-fade-in-up">
          <HeroProductMock />
        </div>
      </div>
    </section>
  );
}

function Check() {
  return <svg className="h-3.5 w-3.5 text-tint-green-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg>;
}

function LogoStrip() {
  const items = ["Stripe", "Linear", "Notion", "Vercel", "Figma", "Shopify"];
  return (
    <section className="border-y border-border bg-surface">
      <div className="container-page py-8">
        <p className="mb-5 text-center text-xs uppercase tracking-widest text-muted-foreground">Trusted by professionals hired at</p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4 opacity-70">
          {items.map(i => <span key={i} className="font-display text-lg font-semibold tracking-tight text-muted-foreground">{i}</span>)}
        </div>
      </div>
    </section>
  );
}

function Problem() {
  const trad = ["One static resume", "Generic templates", "No ATS guidance", "No career tracking", "No job matching"];
  const cp = ["Adaptive resumes", "ATS optimization", "Career memory", "Skill gap analysis", "Job matching", "Career coaching", "Learning roadmaps"];
  return (
    <section className="container-page py-24">
      <div className="max-w-2xl">
        <SectionEyebrow>The problem</SectionEyebrow>
        <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          Most resume builders stop at <span className="text-muted-foreground">PDF generation.</span>
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          A resume isn't the goal — the offer is. CareerPilot continues working long after the file is downloaded.
        </p>
      </div>
      <div className="mt-12 grid gap-5 md:grid-cols-2">
        <div className="card-soft p-7">
          <div className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Traditional builders</div>
          <h3 className="mt-2 font-display text-2xl">A document factory</h3>
          <ul className="mt-5 space-y-3">
            {trad.map(t => (
              <li key={t} className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-surface-2 text-muted-foreground">×</span>
                {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="card-soft p-7 ring-1 ring-foreground/5">
          <div className="text-xs font-medium uppercase tracking-widest text-tint-blue-foreground">CareerPilot AI</div>
          <h3 className="mt-2 font-display text-2xl">A career operating system</h3>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {cp.map(t => (
              <li key={t} className="flex items-center gap-3 text-sm">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-tint-green text-tint-green-foreground">
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg>
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return <span className="text-xs font-semibold uppercase tracking-widest text-tint-blue-foreground">{children}</span>;
}

function HowItWorks() {
  const steps = [
    { n: "01", t: "Create Profile", d: "Tell us about your background, goals and target roles." },
    { n: "02", t: "Upload or Build Resume", d: "Import a PDF or start fresh — your data flows everywhere." },
    { n: "03", t: "Paste a Job Description", d: "We extract every requirement, keyword and skill." },
    { n: "04", t: "AI Tailors Resume", d: "Adaptive rewriting matched to the role in seconds." },
    { n: "05", t: "Improve ATS Score", d: "See exactly what's missing and fix it with one click." },
    { n: "06", t: "Apply With Confidence", d: "Backed by data, prepped for interviews, ready to win." },
  ];
  return (
    <section id="how" className="border-y border-border bg-surface">
      <div className="container-page py-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <SectionEyebrow>How it works</SectionEyebrow>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">Six steps. One smarter career.</h2>
          </div>
          <p className="max-w-sm text-sm text-muted-foreground">A guided flow designed to take you from blank profile to confident applicant.</p>
        </div>
        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-3">
          {steps.map(s => (
            <div key={s.n} className="bg-card p-7 card-hover">
              <div className="font-metric text-sm text-muted-foreground">{s.n}</div>
              <h3 className="mt-3 font-display text-xl">{s.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const features = [
  { t: "AI Resume Builder", d: "Adaptive resumes that rewrite themselves for every job.", tint: "blue" },
  { t: "ATS Analyzer", d: "Real-time scoring against the systems recruiters actually use.", tint: "green" },
  { t: "JD Intelligence", d: "Extract role requirements, skills and signals from any post.", tint: "lavender" },
  { t: "Career Coach", d: "Personalized guidance on next moves, gaps and growth paths.", tint: "blue" },
  { t: "Skill Gap Analyzer", d: "See exactly what's between you and your target role.", tint: "green" },
  { t: "Interview Prep", d: "Tailored question banks for the company you're applying to.", tint: "lavender" },
  { t: "Learning Roadmaps", d: "Week-by-week plans to close skill gaps with resources.", tint: "blue" },
  { t: "Job Matching", d: "Curated roles ranked by fit — not just keyword overlap.", tint: "green" },
  { t: "Version History", d: "Every iteration tracked. Compare ATS scores side by side.", tint: "lavender" },
  { t: "Company Intelligence", d: "Culture, stack, values — and how to mirror them.", tint: "blue" },
];

function Features() {
  return (
    <section id="features" className="container-page py-24">
      <div className="max-w-2xl">
        <SectionEyebrow>Capabilities</SectionEyebrow>
        <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">An entire career team, in one product.</h2>
        <p className="mt-4 text-lg text-muted-foreground">Ten purpose-built modules working together — sharing context about you, your goals and your applications.</p>
      </div>
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map(f => (
          <div key={f.t} className="card-soft card-hover p-6">
            <div className={`mb-4 grid h-10 w-10 place-items-center rounded-lg bg-tint-${f.tint} text-tint-${f.tint}-foreground`}>
              <FeatureIcon name={f.t} />
            </div>
            <h3 className="font-display text-lg font-semibold">{f.t}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{f.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function FeatureIcon({ name }: { name: string }) {
  const common = "h-5 w-5";
  const props = { className: common, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (name) {
    case "AI Resume Builder": return <svg {...props}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 13h6M9 17h4"/></svg>;
    case "ATS Analyzer": return <svg {...props}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>;
    case "JD Intelligence": return <svg {...props}><path d="M4 6h16M4 12h10M4 18h16"/></svg>;
    case "Career Coach": return <svg {...props}><path d="M12 2a5 5 0 0 1 5 5v3a5 5 0 0 1-10 0V7a5 5 0 0 1 5-5zM4 22a8 8 0 0 1 16 0"/></svg>;
    case "Skill Gap Analyzer": return <svg {...props}><path d="M3 3v18h18"/><path d="M7 14l4-4 3 3 5-7"/></svg>;
    case "Interview Prep": return <svg {...props}><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4l-5 2 1.5-4.5A8.5 8.5 0 1 1 21 11.5z"/></svg>;
    case "Learning Roadmaps": return <svg {...props}><path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3z"/><path d="M9 3v15M15 6v15"/></svg>;
    case "Job Matching": return <svg {...props}><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
    case "Version History": return <svg {...props}><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/></svg>;
    default: return <svg {...props}><path d="M3 21h18M5 21V7l7-4 7 4v14M9 9h.01M15 9h.01M9 13h.01M15 13h.01"/></svg>;
  }
}

function DemoSection() {
  return (
    <section id="demo" className="border-y border-border bg-surface">
      <div className="container-page py-24">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <div>
            <SectionEyebrow>Product demo</SectionEyebrow>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">See your career, scored.</h2>
            <p className="mt-4 text-lg text-muted-foreground">A live dashboard surfaces Career Health, ATS Readiness, Job Match Strength and Skill Growth — all in one calm view.</p>
            <ul className="mt-6 space-y-3 text-sm">
              {["Career Score and trends", "ATS Score per resume version", "Job Match Score across saved jobs", "Missing skills with roadmap suggestions", "Weekly roadmap progress"].map(i => (
                <li key={i} className="flex items-center gap-2.5"><Check/>{i}</li>
              ))}
            </ul>
          </div>
          <div><HeroProductMock /></div>
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const items = [
    { q: "Got 3 interviews in a week after redoing my resume in CareerPilot. The ATS feedback was eye-opening.", n: "Priya S.", r: "Product Designer · ex-Stripe" },
    { q: "It feels less like a tool and more like a career strategist that actually understands my goals.", n: "Marcus L.", r: "Senior Engineer · Shopify" },
    { q: "The JD analyzer alone saved me hours per application. Then the roadmap closed gaps I didn't know existed.", n: "Aisha K.", r: "Data Scientist · candidate" },
  ];
  return (
    <section className="container-page py-24">
      <div className="max-w-2xl">
        <SectionEyebrow>Loved by professionals</SectionEyebrow>
        <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">Built for serious career growth.</h2>
      </div>
      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {items.map((t, i) => (
          <figure key={i} className="card-soft card-hover p-7">
            <svg className="h-5 w-5 text-muted-foreground" viewBox="0 0 24 24" fill="currentColor"><path d="M7 7h4v10H3V11c0-2.2 1.8-4 4-4zm10 0h4v10h-8V11c0-2.2 1.8-4 4-4z"/></svg>
            <blockquote className="mt-4 text-[15px] leading-relaxed">{t.q}</blockquote>
            <figcaption className="mt-5 text-sm">
              <div className="font-medium">{t.n}</div>
              <div className="text-muted-foreground">{t.r}</div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

function Faq() {
  const faqs = [
    { q: "Is CareerPilot a resume builder?", a: "It's much more. We build adaptive resumes, but the platform continuously analyzes JDs, ATS scores, skill gaps and career growth." },
    { q: "Does it really work with ATS systems?", a: "Yes. Our templates and analyzer are tested against the same parsing models used by major ATS platforms." },
    { q: "What's free vs paid?", a: "Core resume building, ATS scoring and dashboard insights are free forever. Advanced tailoring and roadmaps are part of Pro." },
    { q: "Will it write generic AI content?", a: "No. The writing assistant uses your real experience and the JD signals — it tailors rather than fabricates." },
    { q: "Is my data private?", a: "Your data is yours. We never sell information and you can export or delete everything anytime." },
  ];
  return (
    <section id="faq" className="border-t border-border bg-surface">
      <div className="container-page grid gap-10 py-24 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <SectionEyebrow>FAQ</SectionEyebrow>
          <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">Questions, answered.</h2>
          <p className="mt-4 text-muted-foreground">Can't find what you're looking for? <a href="#" className="text-foreground underline underline-offset-4">Talk to us</a>.</p>
        </div>
        <div className="divide-y divide-border rounded-2xl border border-border bg-card">
          {faqs.map((f, i) => (
            <details key={i} className="group p-6 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer items-center justify-between gap-4">
                <span className="font-display text-lg font-medium">{f.q}</span>
                <span className="grid h-7 w-7 place-items-center rounded-full border border-border text-muted-foreground transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="container-page py-24">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-10 sm:p-16">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-tint-blue/70 via-tint-lavender/40 to-tint-green/60"></div>
        <div className="max-w-2xl">
          <SectionEyebrow>Start today</SectionEyebrow>
          <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">Start building a smarter career today.</h2>
          <p className="mt-4 text-lg text-muted-foreground">Free to start. No credit card. Your first ATS-optimized resume in under five minutes.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/signup" className="inline-flex items-center gap-2 rounded-xl bg-foreground px-5 py-3 text-sm font-medium text-background shadow-soft transition-transform hover:scale-[1.02]">
              Create Free Account
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
            </Link>
            <Link to="/login" className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-medium hover:border-border-strong">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
