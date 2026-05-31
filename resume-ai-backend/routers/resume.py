from fastapi import APIRouter, Header, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, Any
from services.hf_client import get_user_from_token
from services.profile_builder import build_relevant_profile
from services.section_gatekeeper import get_sections
from services.template_picker import pick_template
from services.rl_ranker import BulletRanker
from services.filename_generator import generate_filename
from services.ats_scorer import score_ats
from config import settings

router = APIRouter(prefix="/resume", tags=["Resume Operations"])


# Mock user for local testing if Supabase isn't configured
class MockUser:
    id = "00000000-0000-0000-0000-000000000000"
    email = "candidate@example.com"


def get_current_user(authorization: Optional[str] = Header(None)):
    """Dependency to retrieve user from Bearer token, falling back to mock in development."""
    # If no token is provided but we are running without full config, return a mock user
    is_configured = (
        settings.SUPABASE_URL
        and settings.SUPABASE_SERVICE_KEY
        and settings.SUPABASE_URL != "https://your-supabase-url.supabase.co"
    )
    
    if not authorization:
        if not is_configured:
            return MockUser()
        raise HTTPException(status_code=401, detail="Authorization header missing")

    try:
        if not authorization.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Invalid token scheme. Use Bearer <token>")
        token = authorization.split(" ")[1]
        
        if not is_configured and token == "mock-token":
            return MockUser()
            
        return get_user_from_token(token)
    except Exception as e:
        if not is_configured:
            return MockUser()
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")


class TailorRequest(BaseModel):
    jd_parsed: dict


class FeedbackRequest(BaseModel):
    resume_id: str
    bullet_text: str
    section: str
    user_action: str  # 'kept', 'edited', 'deleted', 'downloaded'


@router.post("/tailor")
async def tailor_resume(request: TailorRequest, user: Any = Depends(get_current_user)):
    """
    Tailor a resume based on the parsed Job Description.
    Applies embedding-based experience sorting, section gatekeeping,
    seniority-based template selection, and reinforcement learning bullet ranking.
    """
    user_id = str(user.id)
    jd_parsed = request.jd_parsed

    user_email = getattr(user, "email", "") or ""
    user_name = "Candidate"
    user_metadata = getattr(user, "user_metadata", None)
    if user_metadata and isinstance(user_metadata, dict):
        user_name = user_metadata.get("full_name") or "Candidate"

    try:
        # 1. Fetch profile & filter by semantic relevance
        filtered_profile = build_relevant_profile(user_id, jd_parsed, user_email=user_email, user_name=user_name)
    except HTTPException as e:
        is_configured = (
            settings.SUPABASE_URL
            and settings.SUPABASE_SERVICE_KEY
            and settings.SUPABASE_URL != "https://your-supabase-url.supabase.co"
        )
        if e.status_code == 404:
            # Profile genuinely not found — surface this to the user
            if not is_configured:
                # Dev/local mode: use mock profile instead
                filtered_profile = {
                    "header": {"name": "Alex Morgan", "email": "alex@example.com", "phone": "123-456-7890", "location": "San Francisco, CA"},
                    "summary": "Senior Frontend Engineer with 7+ years building accessible, performant React applications at scale.",
                    "experiences": [
                        {
                            "title": "Senior Frontend Engineer",
                            "company": "Stripe",
                            "description": "Led core developer experience improvements.",
                            "skills_used": ["React", "TypeScript", "Next.js"],
                            "bullets": [
                                "Led the migration to a federated design system, reducing component duplication by 62%.",
                                "Shipped a perf initiative that cut LCP from 3.2s to 1.4s.",
                                "Mentored 4 junior frontend developers on design system best practices."
                            ]
                        },
                        {
                            "title": "Software Engineer",
                            "company": "Linear",
                            "description": "Worked on client side reactivity.",
                            "skills_used": ["React", "GraphQL"],
                            "bullets": [
                                "Built high performance kanban board components in React.",
                                "Optimized GraphQL query patterns, saving 200ms on initial page loads."
                            ]
                        }
                    ],
                    "projects": [
                        {
                            "name": "Design System Sandbox",
                            "description": "Interactive playground for testing UI components accessibility.",
                            "technologies": ["React", "TypeScript", "WASM"]
                        }
                    ],
                    "education": [
                        {"degree": "Bachelor of Science", "institution": "UC Berkeley", "field": "Computer Science"}
                    ],
                    "skills": ["React", "TypeScript", "Next.js", "Node.js", "GraphQL", "Tailwind", "AWS"],
                    "certifications": [{"name": "AWS Certified Solutions Architect", "issuer": "Amazon Web Services"}]
                }
            else:
                raise e  # Surface 404 to the client
        else:
            # 502/503 from HuggingFace or other transient errors:
            # profile_builder already has a keyword-overlap fallback, so this
            # branch should rarely be hit. If it is, return a clear 500.
            raise HTTPException(
                status_code=500,
                detail=f"Profile processing failed (AI service unavailable). Please try again. ({e.detail})"
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Profile retrieval failed: {str(e)}")

    # 2. Gatekeeper: Determine which sections to include
    final_sections, diff_reasons = get_sections(jd_parsed, filtered_profile)

    # 3. Template Picker: Get layout template based on tone/seniority
    tone = jd_parsed.get("tone", "formal")
    seniority = jd_parsed.get("seniority", "mid")
    template_name = pick_template(tone, seniority)

    # 4. RL Ranker: Rank bullet points in experience and projects
    ranker = BulletRanker(user_id)
    for exp in filtered_profile.get("experiences", []):
        if "bullets" in exp and isinstance(exp["bullets"], list):
            exp["bullets"] = ranker.rank(exp["bullets"])

    # 5. Filename Generator
    user_name = filtered_profile.get("header", {}).get("name", "Candidate")
    role_title = jd_parsed.get("role_title", "Resume")
    company_name = jd_parsed.get("company_name", "Company") or "Company"
    filename = generate_filename(user_name, role_title, company_name)

    # 6. Build the final structured tailored resume
    sections_list = []
    for sec in final_sections:
        if sec == "summary":
            sections_list.append({"type": "summary", "content": filtered_profile.get("summary", "")})
        elif sec == "experience":
            sections_list.append({"type": "experience", "items": filtered_profile.get("experiences", [])})
        elif sec == "education":
            # Handle list naming variants
            edu_items = filtered_profile.get("education", []) or filtered_profile.get("educations", [])
            sections_list.append({"type": "education", "items": edu_items})
        elif sec == "skills":
            skills_data = filtered_profile.get("skills", [])
            if isinstance(skills_data, list):
                sections_list.append({"type": "skills", "categories": {"Technical Skills": skills_data}})
            elif isinstance(skills_data, dict):
                sections_list.append({"type": "skills", "categories": skills_data})
        elif sec == "projects":
            sections_list.append({"type": "projects", "items": filtered_profile.get("projects", [])})
        elif sec == "certifications":
            certs = filtered_profile.get("certifications", []) or filtered_profile.get("certification", [])
            sections_list.append({"type": "certifications", "items": certs})
        elif sec in ["publications", "patents", "volunteer", "awards", "languages"]:
            items_key = f"{sec}" if sec in filtered_profile else f"{sec}s"
            sections_list.append({"type": sec, "items": filtered_profile.get(items_key, [])})

    tailored_resume = {
        "header": filtered_profile.get("header", {}),
        "sections": sections_list,
    }

    # 7. ATS Scorer: Generate ATS Match score
    ats_score = score_ats(tailored_resume, jd_parsed)

    return {
        "tailored_resume": tailored_resume,
        "sections": final_sections,
        "section_reasons": diff_reasons,
        "template": template_name,
        "filename": filename,
        "ats_score": ats_score,
    }


@router.post("/feedback")
async def submit_feedback(request: FeedbackRequest, user: Any = Depends(get_current_user)):
    """
    Receive user feedback (e.g. bullet point kept, edited, or deleted)
    to update RL scores and persist to db.
    """
    user_id = str(user.id)
    ranker = BulletRanker(user_id)
    try:
        await ranker.update(
            resume_id=request.resume_id,
            bullet_text=request.bullet_text,
            section=request.section,
            user_action=request.user_action,
        )
        return {"status": "success", "message": "Feedback submitted and RL weights updated."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to submit feedback: {str(e)}")
