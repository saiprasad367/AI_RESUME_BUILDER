"""
Template Picker — Maps JD tone + seniority to a resume template name.
"""

TEMPLATE_MAP = {
    ("technical", "mid"):    "minimal_tech",
    ("technical", "senior"): "two_column_dense",
    ("technical", "junior"): "modern_clean",
    ("technical", "intern"): "modern_clean",
    ("formal", "senior"):    "executive_classic",
    ("formal", "mid"):       "executive_classic",
    ("formal", "junior"):    "modern_clean",
    ("formal", "intern"):    "modern_clean",
    ("startup", "junior"):   "modern_clean",
    ("startup", "intern"):   "modern_clean",
    ("startup", "mid"):      "sidebar_accent",
    ("startup", "senior"):   "sidebar_accent",
    ("creative", "junior"):  "sidebar_accent",
    ("creative", "intern"):  "sidebar_accent",
    ("creative", "mid"):     "sidebar_accent",
    ("creative", "senior"):  "sidebar_accent",
}


def pick_template(tone: str, seniority: str) -> str:
    """Return the best template name for the given tone and seniority level."""
    return TEMPLATE_MAP.get((tone.lower(), seniority.lower()), "modern_clean")
