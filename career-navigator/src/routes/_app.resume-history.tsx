import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card, Tint, Button } from "@/components/AppUI";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { downloadAsPdf, downloadAsWord } from "@/lib/resume-utils";

export const Route = createFileRoute("/_app/resume-history")({
  head: () => ({ meta: [{ title: "Resume History · CareerPilot AI" }] }),
  component: History,
});

type ExportEvent = {
  id: string;
  filename: string;
  ats_score: number;
  created_at: string;
  resume_data: {
    header?: { name?: string };
    sections?: { type: string }[];
  };
};

function History() {
  const [history, setHistory] = useState<ExportEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("resume_exports")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setHistory(data as ExportEvent[]);
      }
      setLoading(false);
    }
    fetchHistory();
  }, []);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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
        eyebrow="Resume History"
        title="Every iteration. Every improvement."
        description="Track resume versions, ATS movements, template changes and downloads."
        actions={
          <Button
            variant="secondary"
            onClick={() => {
              const text = JSON.stringify(history, null, 2);
              const blob = new Blob([text], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "resume_history_export.json";
              a.click();
            }}
            disabled={history.length === 0}
          >
            Export history
          </Button>
        }
      />
      {history.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-muted-foreground">No resumes exported yet.</p>
          <p className="text-xs text-muted-foreground mt-1">
            Head to Resume Studio to tailor and download your first resume.
          </p>
        </Card>
      ) : (
        <ol className="relative space-y-4 border-l border-border pl-6">
          {history.map((h) => {
            const sections = h.resume_data?.sections || [];
            const secTypes = sections.map((s) => s.type).join(", ");
            return (
              <li key={h.id} className="relative">
                <span className="absolute -left-[26px] top-4 h-2.5 w-2.5 rounded-full bg-foreground ring-4 ring-background"></span>
                <Card className="card-hover">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <Tint color={h.ats_score >= 80 ? "green" : h.ats_score >= 60 ? "blue" : "lavender"}>
                        ATS {h.ats_score}%
                      </Tint>
                      <p className="font-display text-base font-semibold">{h.filename}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{formatDate(h.created_at)}</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Included sections: <span className="capitalize">{secTypes || "None"}</span>
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      variant="primary"
                      size="xs"
                      onClick={() => {
                        const resultObj = {
                          tailored_resume: h.resume_data,
                          sections: h.resume_data.sections?.map((s: any) => s.type) || [],
                          section_reasons: {},
                          template: "modern",
                          filename: h.filename,
                          ats_score: { score: h.ats_score, matched: [], missing: [], total_keywords: 0 }
                        };
                        downloadAsPdf(resultObj);
                      }}
                    >
                      Download PDF
                    </Button>
                    <Button
                      variant="secondary"
                      size="xs"
                      onClick={() => {
                        const resultObj = {
                          tailored_resume: h.resume_data,
                          sections: h.resume_data.sections?.map((s: any) => s.type) || [],
                          section_reasons: {},
                          template: "modern",
                          filename: h.filename,
                          ats_score: { score: h.ats_score, matched: [], missing: [], total_keywords: 0 }
                        };
                        downloadAsWord(resultObj);
                      }}
                    >
                      Download Word
                    </Button>
                    <Button
                      variant="secondary"
                      size="xs"
                      onClick={() => {
                        const text = JSON.stringify(h.resume_data, null, 2);
                        const blob = new Blob([text], { type: "application/json" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = h.filename.replace(".pdf", ".json");
                        a.click();
                        URL.revokeObjectURL(url);
                        toast.success("JSON downloaded!");
                      }}
                    >
                      Download JSON
                    </Button>
                  </div>
                </Card>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
