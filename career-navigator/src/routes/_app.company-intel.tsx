import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card, Tint, Button } from "@/components/AppUI";
import { useState, useEffect } from "react";
import { getCompanyIntel } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/company-intel")({
  head: () => ({ meta: [{ title: "Company Intelligence · CareerPilot AI" }] }),
  component: CI,
});

type IntelData = {
  culture_keywords: string[];
  tech_stack: string[];
  mission: string;
  values: string[];
  about_text: string;
};

function CI() {
  const [companyName, setCompanyName] = useState("Stripe");
  const [searchQuery, setSearchQuery] = useState("Stripe");
  const [intel, setIntel] = useState<IntelData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchIntel = async (name: string) => {
    setLoading(true);
    try {
      const data = await getCompanyIntel(name);
      setIntel(data);
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch company intelligence.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntel(companyName);
  }, [companyName]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      setCompanyName(query);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Company Intelligence"
        title={companyName}
        description="Know the company. Mirror their values. Tailor your resume accordingly."
      />

      <Card>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for any company (e.g. Google, Vercel, Stripe)…"
            className="flex-1 rounded-lg border border-border bg-card px-3.5 py-2 text-sm outline-none focus:border-foreground/30 focus:ring-4 focus:ring-foreground/5"
          />
          <Button type="submit" disabled={loading}>
            {loading ? "Searching…" : "Search"}
          </Button>
        </form>
      </Card>

      {loading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-foreground" />
        </div>
      ) : intel ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <h3 className="font-display text-lg font-semibold">Overview / Mission</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              {intel.mission || `Intelligence about ${companyName} sourced from public directories and careers pages.`}
            </p>
            {intel.about_text && (
              <div className="mt-4 border-t border-border pt-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">About the company</h4>
                <p className="mt-2 text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                  {intel.about_text}
                </p>
              </div>
            )}
          </Card>

          <Card>
            <h3 className="font-display text-lg font-semibold">Tech stack</h3>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {intel.tech_stack.length > 0 ? (
                intel.tech_stack.map((t) => (
                  <span key={t} className="rounded-md border border-border bg-surface px-2.5 py-1 text-xs">
                    {t}
                  </span>
                ))
              ) : (
                <span className="text-xs text-muted-foreground">No specific technologies detected.</span>
              )}
            </div>
          </Card>

          <Card>
            <h3 className="font-display text-lg font-semibold">Values</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {intel.values.length > 0 ? (
                intel.values.map((v) => (
                  <li key={v} className="flex gap-2">
                    <Tint color="green">✓</Tint>
                    {v}
                  </li>
                ))
              ) : (
                ["Rigorous standards", "Move with focus", "Customer obsessed"].map((v) => (
                  <li key={v} className="flex gap-2">
                    <Tint color="green">✓</Tint>
                    {v}
                  </li>
                ))
              )}
            </ul>
          </Card>

          <Card>
            <h3 className="font-display text-lg font-semibold">Culture keywords</h3>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {intel.culture_keywords.length > 0 ? (
                intel.culture_keywords.map((t) => (
                  <span key={t} className="rounded-md bg-tint-lavender px-2.5 py-1 text-xs text-tint-lavender-foreground">
                    {t}
                  </span>
                ))
              ) : (
                ["ownership", "craft", "impact", "rigor"].map((t) => (
                  <span key={t} className="rounded-md bg-tint-lavender px-2.5 py-1 text-xs text-tint-lavender-foreground">
                    {t}
                  </span>
                ))
              )}
            </div>
          </Card>

          <Card className="lg:col-span-3">
            <h3 className="font-display text-lg font-semibold">How to tailor your resume</h3>
            <ul className="mt-3 grid gap-2 text-sm md:grid-cols-2">
              {[
                `Emphasize impact metrics and achievements aligned with ${companyName}'s core mission.`,
                intel.tech_stack.length > 0
                  ? `Explicitly reference key technologies from their stack: ${intel.tech_stack.slice(0, 3).join(", ")}.`
                  : "Mirror their core culture keywords in your bullet points.",
                "Author clear, structured bullet points demonstrating end-to-end ownership.",
                "Structure experience sections cleanly to highlight reliability and engineering standards.",
              ].map((t, idx) => (
                <li key={idx} className="flex gap-2">
                  <Tint color="blue">Tip</Tint>
                  {t}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      ) : (
        <Card className="text-center py-8">
          <p className="text-muted-foreground">No intelligence loaded. Try searching for a company above.</p>
        </Card>
      )}
    </div>
  );
}
