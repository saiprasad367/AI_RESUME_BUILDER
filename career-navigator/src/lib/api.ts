/**
 * Central API client for the CareerPilot AI backend.
 * Reads the backend URL from the VITE_BACKEND_URL env variable.
 * Automatically attaches the Supabase access token as Bearer auth.
 */
import { supabase } from "./supabase";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

async function getAuthHeaders(): Promise<Record<string, string>> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (session?.access_token) {
    headers["Authorization"] = `Bearer ${session.access_token}`;
  }
  return headers;
}

export async function apiGet<T>(path: string): Promise<T> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${BACKEND}${path}`, { headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `API error ${res.status}`);
  }
  return res.json() as T;
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${BACKEND}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `API error ${res.status}`);
  }
  return res.json() as T;
}

// ─── Typed API calls ───────────────────────────────────────────────────────────

export async function analyseJD(jdText: string) {
  return apiPost<{
    role_title: string;
    company_name: string | null;
    required_skills: string[];
    preferred_skills: string[];
    keywords: string[];
    sections_needed: string[];
    tone: string;
    seniority: string;
    page_count: number;
    industry: string;
    responsibilities: string[];
  }>("/api/jd/analyse", { jd_text: jdText });
}

export async function searchJobs(role: string, location: string = "India") {
  return apiGet<{
    listings: {
      title: string;
      company: string;
      location: string;
      experience: string;
      salary: string;
      url: string;
      source: string;
    }[];
  }>(`/api/jobs/search?role=${encodeURIComponent(role)}&location=${encodeURIComponent(location)}`);
}

export async function tailorResume(jdParsed: Record<string, unknown>) {
  return apiPost<{
    tailored_resume: Record<string, unknown>;
    sections: string[];
    section_reasons: Record<string, string>;
    template: string;
    filename: string;
    ats_score: { score: number; matched: string[]; missing: string[]; total_keywords: number };
  }>("/api/resume/tailor", { jd_parsed: jdParsed });
}

export async function submitFeedback(payload: {
  resume_id: string;
  bullet_text: string;
  section: string;
  user_action: string;
}) {
  return apiPost<{ status: string; message: string }>("/api/resume/feedback", payload);
}

export async function getCompanyIntel(companyName: string) {
  return apiGet<{
    culture_keywords: string[];
    tech_stack: string[];
    mission: string;
    values: string[];
    about_text: string;
  }>(`/api/jobs/intel?company_name=${encodeURIComponent(companyName)}`);
}

export async function getSkillGap(jdText: string) {
  return apiPost<{
    role_title: string;
    match_percentage: number;
    matched_skills: string[];
    missing_skills: string[];
    future_skills: string[];
  }>("/api/coach/gap", { jd_text: jdText });
}

export async function getRoadmap(missingSkills: string[]) {
  return apiPost<{
    weeks: {
      week: string;
      topic: string;
      tasks: string[];
      resources: string[];
      project: string;
      done: number;
    }[];
  }>("/api/coach/roadmap", { missing_skills: missingSkills });
}

export async function getInterviewPrep(roleTitle: string, companyName: string) {
  return apiPost<{
    Technical: string[];
    Behavioral: string[];
    Project: string[];
    Company: string[];
  }>("/api/coach/interview-prep", { role_title: roleTitle, company_name: companyName });
}

export async function getCoachRecommendations() {
  return apiPost<{
    paths: { title: string; timeline: string; skills: string[] }[];
    opportunities: string[];
    skills: string[];
    projects: string[];
    courses: { title: string; provider: string; duration: string }[];
  }>("/api/coach/recommendations", {});
}

