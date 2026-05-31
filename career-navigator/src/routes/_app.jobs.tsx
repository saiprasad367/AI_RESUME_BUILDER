import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card, Tint, Button } from "@/components/AppUI";
import { useState } from "react";
import { searchJobs } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/jobs")({
  head: () => ({ meta: [{ title: "Jobs · CareerPilot AI" }] }),
  component: Jobs,
});

type Job = {
  title: string;
  company: string;
  location: string;
  experience: string;
  salary: string;
  url: string;
  source: string;
};

function Jobs() {
  const [role, setRole] = useState("");
  const [location, setLocation] = useState("India");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!role.trim()) {
      toast.error("Please enter a job role to search.");
      return;
    }
    setLoading(true);
    setJobs([]);
    try {
      const data = await searchJobs(role.trim(), location.trim() || "India");
      setJobs(data.listings);
      setSearched(true);
      if (data.listings.length === 0) {
        toast.info("No listings found. Try a different role or location.");
      } else {
        toast.success(`Found ${data.listings.length} job listings!`);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to search jobs. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Job Search"
        title="Find roles that fit you"
        description="Search real job listings from Naukri, LinkedIn and Indeed — scraped live for you."
      />

      {/* Search bar */}
      <Card>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Job role (e.g. Frontend Engineer, Data Scientist…)"
            className="flex-1 rounded-lg border border-border bg-card px-3.5 py-2.5 text-sm outline-none focus:border-foreground/30 focus:ring-4 focus:ring-foreground/5"
          />
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Location (e.g. Bangalore, Remote)"
            className="w-full rounded-lg border border-border bg-card px-3.5 py-2.5 text-sm outline-none focus:border-foreground/30 focus:ring-4 focus:ring-foreground/5 sm:w-56"
          />
          <Button onClick={handleSearch} disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-background border-t-transparent" />
                Searching…
              </span>
            ) : (
              "🔍 Search"
            )}
          </Button>
        </div>
      </Card>

      {/* Results */}
      {!searched && !loading && (
        <div className="py-16 text-center text-muted-foreground text-sm">
          Enter a role above and hit Search to find live job listings.
        </div>
      )}

      {searched && jobs.length === 0 && !loading && (
        <Card>
          <div className="py-12 text-center">
            <p className="text-muted-foreground text-sm">No jobs found for "{role}" in "{location}".</p>
            <p className="mt-2 text-xs text-muted-foreground">Try a broader role title or different location.</p>
          </div>
        </Card>
      )}

      {jobs.length > 0 && (
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Showing {jobs.length} live listings for <strong>{role}</strong> in <strong>{location}</strong>
          </p>
          {jobs.map((j, idx) => (
            <Card key={idx} className="card-hover">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-surface text-sm font-semibold">
                    {j.company?.[0] || "?"}
                  </span>
                  <div>
                    <p className="font-display text-lg font-semibold">{j.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {j.company} · {j.location}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {j.experience !== "Not specified" && (
                        <Tint color="blue">{j.experience}</Tint>
                      )}
                      {j.salary !== "Not disclosed" && (
                        <Tint color="green">{j.salary}</Tint>
                      )}
                      <Tint color="lavender">{j.source}</Tint>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {j.url ? (
                    <a href={j.url} target="_blank" rel="noopener noreferrer">
                      <Button>Apply →</Button>
                    </a>
                  ) : (
                    <Button disabled>Apply</Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
