"""
Filename Generator — Produces a smart, clean PDF filename from user name,
role title, and company name.
Example: Chindam_Saiprasad_Backend_Engineer_Nokia.pdf
"""
import re


def _slugify(text: str, max_len: int) -> str:
    """Convert text to a safe filename slug."""
    if not text:
        return ""
    text = re.sub(r"[^a-zA-Z0-9\s]", "", text)
    text = "_".join(text.strip().split())
    return text[:max_len]


def generate_filename(name: str, role: str, company: str) -> str:
    """
    Generate a descriptive PDF filename.
    Format: Name_Role_Company.pdf
    """
    name_slug = _slugify(name or "Candidate", 25)
    role_slug = _slugify(role or "Resume", 20)
    company_slug = _slugify(company or "Company", 15)

    # Ensure no empty parts
    name_slug = name_slug or "Candidate"
    role_slug = role_slug or "Resume"
    company_slug = company_slug or "Company"

    return f"{name_slug}_{role_slug}_{company_slug}.pdf"
