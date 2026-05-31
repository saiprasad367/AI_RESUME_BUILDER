"""
ATS Scorer — Keyword match scorer comparing resume content against JD keywords.
"""
import re


def _flatten_resume_text(resume_json: dict) -> str:
    """Flatten all text from a resume JSON into a single lowercase string."""
    parts = []

    # Header
    header = resume_json.get("header", {})
    parts.append(str(header.get("name", "")))

    # Sections
    for section in resume_json.get("sections", []):
        section_type = section.get("type", "")

        if section_type == "summary":
            parts.append(str(section.get("content", "")))

        elif section_type == "experience":
            for item in section.get("items", []):
                parts.append(str(item.get("title", "")))
                parts.append(str(item.get("company", "")))
                for bullet in item.get("bullets", []):
                    parts.append(str(bullet))

        elif section_type == "skills":
            for category, skills in section.get("categories", {}).items():
                if isinstance(skills, list):
                    parts.extend([str(s) for s in skills])
                else:
                    parts.append(str(skills))

        elif section_type == "education":
            for item in section.get("items", []):
                parts.append(str(item.get("degree", "")))
                parts.append(str(item.get("institution", "")))
                parts.append(str(item.get("field", "")))

        elif section_type == "projects":
            for item in section.get("items", []):
                parts.append(str(item.get("name", "")))
                parts.append(str(item.get("description", "")))
                for bullet in item.get("bullets", []):
                    parts.append(str(bullet))
                techs = item.get("technologies", [])
                if isinstance(techs, list):
                    parts.extend([str(t) for t in techs])

        elif section_type == "certifications":
            for item in section.get("items", []):
                parts.append(str(item.get("name", "")))
                parts.append(str(item.get("issuer", "")))

        elif section_type == "publications":
            for item in section.get("items", []):
                parts.append(str(item.get("title", "")))

        elif section_type == "awards":
            for item in section.get("items", []):
                parts.append(str(item.get("title", "")))

    return " ".join(parts).lower()


def _match_keyword(keyword: str, resume_text: str) -> bool:
    """
    Checks if keyword matches resume_text in a boundary-safe manner.
    Prevents false positives (e.g., matching "go" inside "django", "java" inside "javascript").
    Handles special characters like C++, C#, .NET, etc.
    Matches multi-word phrases contiguously rather than scattered across the text.
    """
    kw_lower = keyword.lower().strip()
    if not kw_lower:
        return False

    # Normalize whitespace
    kw_clean = " ".join(kw_lower.split())
    words = kw_clean.split()
    if not words:
        return False

    pattern_parts = []
    for i, w in enumerate(words):
        w_esc = re.escape(w)
        prefix = r'\b' if w[0].isalnum() else r'(?:^|\s)'
        suffix = r'\b' if w[-1].isalnum() else r'(?:$|\s|[.,;:?!])'
        
        # For middle words, we don't strictly enforce start/end boundaries on outer edges
        if i > 0:
            prefix = r'\b' if w[0].isalnum() else ''
        if i < len(words) - 1:
            suffix = r'\b' if w[-1].isalnum() else ''
            
        pattern_parts.append(prefix + w_esc + suffix)

    # Join words allowing one or more whitespace characters
    pattern = r'\s+'.join(pattern_parts)
    
    if re.search(pattern, resume_text):
        return True

    return False


def score_ats(resume_json: dict, jd_parsed: dict) -> dict:
    """
    Score resume against JD keywords.
    Returns score (%), matched keywords, missing keywords, and totals.
    """
    resume_text = _flatten_resume_text(resume_json)

    # Collect all unique keywords from JD
    all_keywords = (
        jd_parsed.get("required_skills", [])
        + jd_parsed.get("preferred_skills", [])
        + jd_parsed.get("keywords", [])
    )
    # Deduplicate case-insensitively
    seen = set()
    unique_keywords = []
    for kw in all_keywords:
        kw_lower = kw.lower().strip()
        if kw_lower and kw_lower not in seen:
            seen.add(kw_lower)
            unique_keywords.append(kw)

    matched = []
    missing = []

    for keyword in unique_keywords:
        if _match_keyword(keyword, resume_text):
            matched.append(keyword)
        else:
            missing.append(keyword)

    total = len(unique_keywords)
    score = round((len(matched) / total * 100), 1) if total > 0 else 0.0

    return {
        "score": score,
        "matched": matched,
        "missing": missing,
        "total_keywords": total,
    }

