"""
Section Gatekeeper — Decides which resume sections to include/exclude
based on JD keywords and user profile data availability.
"""

BASE_SECTIONS = ["summary", "experience", "education", "skills"]

SECTION_RULES = {
    "publications": {
        "triggers": ["research", "phd", "scholar", "journal", "arxiv", "ieee", "acm", "publication"],
        "reason": "JD mentions research/academic work",
    },
    "certifications": {
        "triggers": [
            "certified", "certification", "aws", "azure", "gcp", "pmp",
            "cissp", "comptia", "cka", "ceh", "ccna",
        ],
        "reason": "JD requires certifications",
    },
    "patents": {
        "triggers": ["patent", "intellectual property", "inventor", "ip"],
        "reason": "JD mentions intellectual property",
    },
    "volunteer": {
        "triggers": ["nonprofit", "community", "social impact", "ngo", "volunteering", "open source"],
        "reason": "JD values community involvement",
    },
    "languages": {
        "triggers": [
            "multilingual", "bilingual", "language skills",
            "french", "german", "spanish", "mandarin", "hindi", "arabic",
        ],
        "reason": "JD requires language skills",
    },
    "awards": {
        "triggers": ["award", "recognition", "achievement", "honor", "distinction", "scholarship"],
        "reason": "JD values achievements",
    },
    "projects": {
        "triggers": [],  # handled separately by seniority rule
        "reason": "Entry-level candidates benefit from project showcase",
    },
}


def _has_data(profile: dict, section: str) -> bool:
    """Check if the user profile actually has data for a section."""
    val = profile.get(section) or profile.get(f"{section}s")
    if val is None:
        return False
    if isinstance(val, list):
        return len(val) > 0
    if isinstance(val, str):
        return bool(val.strip())
    return bool(val)


def get_sections(jd_parsed: dict, user_profile: dict) -> tuple[list[str], dict]:
    """
    Returns (final_sections, diff_reasons).
    diff_reasons maps section name -> reason string for every add/remove decision.
    """
    sections = list(BASE_SECTIONS)
    diff_reasons: dict[str, str] = {}

    # Automatically showcase projects and certifications if they contain data in the user's profile
    if _has_data(user_profile, "projects") and "projects" not in sections:
        sections.append("projects")
        diff_reasons["projects"] = "Showcasing projects from your profile"
    if _has_data(user_profile, "certifications") and "certifications" not in sections:
        sections.append("certifications")
        diff_reasons["certifications"] = "Showcasing certifications from your profile"

    # Add JD-required sections
    for s in jd_parsed.get("sections_needed", []):
        if s not in sections and s in [
            "summary", "experience", "education", "skills",
            "projects", "certifications", "publications",
            "patents", "volunteer", "awards", "languages",
        ]:
            sections.append(s)
            diff_reasons[s] = "Required by job description"

    # Check keyword triggers
    all_keywords = " ".join(jd_parsed.get("keywords", []) + jd_parsed.get("required_skills", [])).lower()

    for section_name, rule in SECTION_RULES.items():
        if section_name in sections:
            continue
        for trigger in rule["triggers"]:
            if trigger in all_keywords:
                sections.append(section_name)
                diff_reasons[section_name] = rule["reason"]
                break

    # Add projects for entry-level if user has projects
    if jd_parsed.get("seniority") in ("intern", "junior"):
        if "projects" not in sections and _has_data(user_profile, "projects"):
            sections.append("projects")
            diff_reasons["projects"] = SECTION_RULES["projects"]["reason"]

    # Remove sections where user has no data
    final_sections = []
    for s in sections:
        if s in BASE_SECTIONS:
            # Always include base sections (may be empty — handled in generator)
            final_sections.append(s)
        elif _has_data(user_profile, s) or _has_data(user_profile, s[:-1]):
            final_sections.append(s)
        else:
            diff_reasons[s] = "No data available in your profile"

    return final_sections, diff_reasons
