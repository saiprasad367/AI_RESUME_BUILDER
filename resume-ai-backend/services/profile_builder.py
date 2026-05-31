"""
Profile Builder — Fetches user profile from Supabase and filters entries
by cosine similarity to the JD's required skills using HuggingFace embeddings.
Falls back to keyword-overlap scoring if embeddings are unavailable.
"""
import re
import numpy as np
from fastapi import HTTPException
from database.supabase_client import supabase
from services.hf_client import get_embeddings


def cosine_similarity(a: list[float], b: list[float]) -> float:
    """Compute cosine similarity between two embedding vectors."""
    va, vb = np.array(a), np.array(b)
    return float(np.dot(va, vb) / (np.linalg.norm(va) * np.linalg.norm(vb) + 1e-10))


def _keyword_overlap_score(text: str, keywords: list[str]) -> float:
    """Fallback scorer: fraction of JD keywords that appear in the text."""
    if not keywords:
        return 0.5
    text_lower = text.lower()
    matches = sum(
        1 for kw in keywords
        if re.search(r'(?<![a-zA-Z])' + re.escape(kw.lower()) + r'(?![a-zA-Z])', text_lower)
    )
    return matches / len(keywords)


def build_relevant_profile(user_id: str, jd_parsed: dict, user_email: str = "", user_name: str = "") -> dict:
    """
    Fetch user profile and filter experience/projects/certifications
    by relevance to the job description.

    Strategy:
      1. Try a single batched HuggingFace embedding call for all texts.
      2. If HF is unavailable/slow, fall back to keyword-overlap scoring.
    This avoids N+1 API calls and never raises a 502 for the tailor endpoint.
    """
    # Fetch full user profile
    result = (
        supabase.table("user_profiles")
        .select("*")
        .eq("user_id", user_id)
        .single()
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=404,
            detail="User profile not found. Please complete your profile first."
        )

    profile = result.data

    # Build JD skills/keywords text
    required = jd_parsed.get("required_skills", []) or []
    keywords = jd_parsed.get("keywords", []) or []
    all_jd_keywords = required + keywords
    jd_skills_text = " ".join(all_jd_keywords)

    page_count = jd_parsed.get("page_count", 1)

    experiences = profile.get("experiences", []) or []
    projects = profile.get("projects", []) or []

    # Build text representations for all items
    exp_texts = [
        " ".join([
            str(exp.get("title", "")),
            str(exp.get("company", "")),
            str(exp.get("description", "")),
            " ".join(exp.get("skills_used", []) if isinstance(exp.get("skills_used"), list) else []),
        ])
        for exp in experiences
    ]
    proj_texts = [
        " ".join([
            str(proj.get("name", "")),
            str(proj.get("description", "")),
            " ".join(proj.get("technologies", []) if isinstance(proj.get("technologies"), list) else []),
        ])
        for proj in projects
    ]

    # --- Try batched embedding scoring ---
    use_embeddings = bool(jd_skills_text.strip() and (exp_texts or proj_texts))
    embedding_ok = False
    exp_scores: list[float] = [0.5] * len(experiences)
    proj_scores: list[float] = [0.5] * len(projects)

    if use_embeddings:
        try:
            all_texts = [jd_skills_text] + exp_texts + proj_texts
            all_embeddings = get_embeddings(all_texts)
            jd_emb = all_embeddings[0]
            exp_embs = all_embeddings[1: 1 + len(exp_texts)]
            proj_embs = all_embeddings[1 + len(exp_texts):]
            exp_scores = [cosine_similarity(jd_emb, e) for e in exp_embs]
            proj_scores = [cosine_similarity(jd_emb, e) for e in proj_embs]
            embedding_ok = True
        except Exception:
            pass  # Fall through to keyword overlap

    # --- Fallback: keyword-overlap scoring ---
    if not embedding_ok:
        exp_scores = [_keyword_overlap_score(t, all_jd_keywords) for t in exp_texts]
        proj_scores = [_keyword_overlap_score(t, all_jd_keywords) for t in proj_texts]

    # Sort by score descending
    scored_experiences = sorted(
        zip(exp_scores, experiences), key=lambda x: x[0], reverse=True
    )
    scored_projects = sorted(
        zip(proj_scores, projects), key=lambda x: x[0], reverse=True
    )

    # Apply page-count limits
    if page_count == 1:
        top_experiences = [exp for _, exp in scored_experiences[:3]]
        top_projects = [proj for _, proj in scored_projects[:3]]
        top_certs = (profile.get("certifications", []) or [])[:2]
    else:
        top_experiences = [exp for _, exp in scored_experiences[:5]]
        top_projects = [proj for _, proj in scored_projects[:5]]
        top_certs = profile.get("certifications", []) or []

    filtered = dict(profile)
    filtered["experiences"] = top_experiences
    filtered["projects"] = top_projects
    filtered["certifications"] = top_certs

    # Inject a clean, unified header block
    filtered["header"] = {
        "name": user_name or "Candidate",
        "email": user_email or "",
        "phone": "",
        "location": profile.get("location", "") or "",
    }

    # Tailor summary and projects (bullets format)
    filtered = tailor_profile_content(filtered, jd_parsed, user_email, user_name)

    return filtered


def tailor_profile_content(profile: dict, jd_parsed: dict, user_email: str = "", user_name: str = "") -> dict:
    """
    Tailor profile summary and convert project description to bullet points.
    Uses AI if available (with strict fail-fast), falls back to high-quality local rule-based generation.
    """
    from services.hf_client import call_mistral
    import json

    tailored_summary = ""
    tailored_projects = []

    # Get details for prompts
    role_title = jd_parsed.get("role_title", "Software Engineer")
    company_name = jd_parsed.get("company_name", "Company") or "Company"
    seniority = jd_parsed.get("seniority", "mid")
    skills = profile.get("skills", [])
    experiences = profile.get("experiences", [])
    projects = profile.get("projects", [])

    # Let's try AI tailoring
    try:
        # Construct experiences and projects summary for AI context
        exp_summary = "\n".join([
            f"- {e.get('title')} at {e.get('company')}: {', '.join(e.get('bullets', []))}"
            for e in experiences
        ])
        proj_summary = "\n".join([
            f"- {p.get('name')}: {p.get('description')} using {', '.join(p.get('technologies', []))}"
            for p in projects
        ])

        prompt = f"""You are an expert ATS-optimizing resume writer.
Given the target Job Description (JD) and Candidate Profile, tailor the candidate's Resume Summary and Projects.

Guidelines:
1. SUMMARY: Write a highly professional, ATS-optimized 2-3 sentence resume summary matching the JD's tone and requirements. Highlight matching skills ({', '.join(skills[:6])}) and experiences.
2. PROJECT BULLETS: For each project, rewrite the plain paragraph description into 2 to 3 high-impact, professional bullet points. Each bullet point MUST start with a strong action verb (e.g. Developed, Shipped, Architected, Optimized), include specific technical achievements, and integrate relevant keywords from the JD. Do NOT write a paragraph.

You must respond in raw JSON format with exactly the following structure (no markdown fences, no extra text):
{{
  "summary": "Tailored 2-3 sentence summary...",
  "projects": [
    {{
      "name": "Project Name 1",
      "bullets": [
        "High-impact bullet point 1...",
        "High-impact bullet point 2..."
      ]
    }}
  ]
}}

Job Description:
Role Title: {role_title}
Company: {company_name}
Seniority: {seniority}
Required Skills: {', '.join(jd_parsed.get('required_skills', []))}
Preferred Skills: {', '.join(jd_parsed.get('preferred_skills', []))}
Keywords: {', '.join(jd_parsed.get('keywords', []))}

Candidate Profile:
Headline: {profile.get('headline', '')}
Skills: {', '.join(skills)}
Experiences:
{exp_summary}
Projects:
{proj_summary}
"""
        response_text = call_mistral(prompt)
        # Clean response if markdown code blocks were included despite instructions
        if "```" in response_text:
            response_text = response_text.split("```")[1]
            if response_text.startswith("json"):
                response_text = response_text[4:]
        data = json.loads(response_text.strip())
        
        if "summary" in data and isinstance(data["summary"], str):
            tailored_summary = data["summary"].strip()
        if "projects" in data and isinstance(data["projects"], list):
            tailored_projects = data["projects"]
    except Exception:
        # Fall through to offline rule-based fallback
        pass

    # --- FALLBACK 1: Tailored Summary ---
    if not tailored_summary:
        matching_skills = [
            s for s in skills
            if s.lower() in [k.lower() for k in (jd_parsed.get("required_skills", []) + jd_parsed.get("keywords", []))]
        ]
        if not matching_skills:
            matching_skills = skills[:5]
        
        headline_title = profile.get("headline") or f"{seniority.capitalize()} {role_title}"
        skills_str = ", ".join(matching_skills[:4])
        
        tailored_summary = (
            f"Results-oriented {headline_title} with a proven track record of designing and implementing high-performance solutions. "
            f"Demonstrated expertise in {skills_str or 'software engineering'}, with strong alignment to the {role_title} requirements at {company_name}. "
            f"Passionate about leveraging modern technologies and engineering best practices to drive successful product deliveries."
        )

    # --- FALLBACK 2: Project Bullets ---
    final_projects = []
    for proj in projects:
        proj_name = proj.get("name", "")
        # Find if AI successfully structured this project
        ai_proj = next((ap for ap in tailored_projects if ap.get("name", "").lower() == proj_name.lower()), None)
        
        if ai_proj and ai_proj.get("bullets"):
            bullets = ai_proj["bullets"]
        else:
            # Rule-based fallback: split paragraph description into sentences, clean them up as bullets
            desc = proj.get("description", "")
            sentences = [s.strip() for s in re.split(r'\.\s+', desc) if s.strip()]
            bullets = []
            for s in sentences:
                clean_s = s.rstrip(".")
                if clean_s:
                    # Capitalize first letter
                    clean_s = clean_s[0].upper() + clean_s[1:]
                    bullets.append(clean_s + ".")
            
            # If no sentences could be extracted, use a single bullet
            if not bullets and desc:
                bullets.append(desc.rstrip(".") + ".")
            
            # If still empty, add a default bullet
            if not bullets:
                bullets.append(f"Developed the {proj_name} project using {', '.join(proj.get('technologies', []))}.")

        # Add technologies used as a nice suffix to the last bullet if not already included
        techs = proj.get("technologies", [])
        if techs and bullets:
            techs_str = ", ".join(techs)
            if not any(techs_str.lower() in b.lower() for b in bullets):
                bullets.append(f"Technologies used: {techs_str}.")

        final_projects.append({
            "name": proj_name,
            "description": proj.get("description", ""),
            "technologies": techs,
            "bullets": bullets
        })

    # Update profile copies with tailored fields
    tailored_profile = dict(profile)
    tailored_profile["summary"] = tailored_summary
    tailored_profile["projects"] = final_projects
    
    return tailored_profile
