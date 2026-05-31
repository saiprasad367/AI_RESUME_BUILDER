"""
JD Analyser — Fully local regex + keyword-based parser.
No internet required. Works 100% offline.
Results are cached in Supabase jd_cache table by MD5 hash.
"""
import hashlib
import re
import asyncio
from database.supabase_client import supabase

# ── Comprehensive skills database ──────────────────────────────────────────────
TECH_SKILLS = [
    # Languages
    "Python", "JavaScript", "TypeScript", "Java", "C", "C++", "C#", "Go", "Golang",
    "Rust", "Ruby", "PHP", "Swift", "Kotlin", "Scala", "R", "MATLAB", "Perl",
    "Shell", "Bash", "PowerShell", "SQL", "HTML", "CSS", "Dart",
    # Frontend
    "React", "ReactJS", "React.js", "Vue", "Vue.js", "Angular", "Svelte",
    "Next.js", "Nuxt.js", "Gatsby", "Remix", "Vite", "Webpack", "Tailwind",
    "Tailwind CSS", "Bootstrap", "Material UI", "Chakra UI", "Styled Components",
    "Redux", "Zustand", "MobX", "GraphQL", "REST", "REST API", "RESTful",
    "WebSockets", "WebSocket", "HTML5", "CSS3", "SASS", "SCSS", "Less",
    # Backend
    "Node.js", "Express", "Express.js", "FastAPI", "Django", "Flask", "Spring",
    "Spring Boot", "NestJS", "Laravel", "Rails", "Ruby on Rails", "ASP.NET",
    ".NET", "Gin", "gRPC", "Kafka", "RabbitMQ", "Celery", "Redis", "Nginx",
    "Apache", "Microservices", "Serverless",
    # Databases
    "PostgreSQL", "MySQL", "MongoDB", "SQLite", "Oracle", "SQL Server", "MSSQL",
    "DynamoDB", "Cassandra", "Elasticsearch", "Neo4j", "Supabase", "Firebase",
    "Prisma", "SQLAlchemy", "Sequelize", "Mongoose",
    # Cloud & DevOps
    "AWS", "GCP", "Azure", "Docker", "Kubernetes", "Terraform", "Ansible",
    "Jenkins", "GitHub Actions", "GitLab CI", "CircleCI", "Travis CI",
    "CI/CD", "DevOps", "Linux", "Unix", "Helm", "Prometheus", "Grafana",
    "CloudFormation", "Pulumi", "ArgoCD", "Datadog", "New Relic",
    # AI/ML
    "Machine Learning", "Deep Learning", "NLP", "Computer Vision", "TensorFlow",
    "PyTorch", "Keras", "Scikit-learn", "Pandas", "NumPy", "OpenCV",
    "Hugging Face", "LangChain", "RAG", "Vector Databases", "Pinecone",
    "Weaviate", "OpenAI", "LLM", "GPT", "BERT", "Transformers",
    # Mobile
    "iOS", "Android", "React Native", "Flutter", "SwiftUI", "Jetpack Compose",
    "Expo", "Xcode", "Android Studio",
    # Tools
    "Git", "GitHub", "GitLab", "Bitbucket", "Jira", "Confluence", "Slack",
    "Figma", "Postman", "VS Code", "IntelliJ", "Eclipse", "Vim",
    # Testing
    "Jest", "Pytest", "Cypress", "Playwright", "Selenium", "JUnit", "Mocha",
    "Chai", "Testing Library", "Vitest", "Unit Testing", "Integration Testing",
    "TDD", "BDD",
    # Architecture
    "System Design", "Microservices", "Monorepo", "API Design", "REST API",
    "GraphQL API", "WebSocket", "Event-Driven", "CQRS", "DDD",
    "Design Patterns", "SOLID", "Clean Architecture",
    # Soft skills / methodology
    "Agile", "Scrum", "Kanban", "Jira", "Confluence", "OKRs",
    "Communication", "Leadership", "Mentoring", "Code Review", "Problem Solving",
]

SOFT_SKILLS = [
    "Communication", "Leadership", "Teamwork", "Problem Solving", "Critical Thinking",
    "Adaptability", "Time Management", "Collaboration", "Mentoring", "Creativity",
    "Ownership", "Initiative", "Attention to Detail", "Analytical",
]

# Role title patterns
ROLE_PATTERNS = [
    r"(?:hiring|looking for|seeking|need|position of|role of|join as)\s+(?:a\s+|an\s+)?([A-Z][a-zA-Z\s/&+]{3,50}?)(?:\s+at|\s+to|\s+who|\s*\.|,|\n)",
    r"(?:job title|position|role|opening):\s*([A-Z][a-zA-Z\s/&+]{3,50})",
    r"^([A-Z][a-zA-Z\s/&+]{3,50}?)\s*(?:\||–|-|at\b)",
    r"(?:Senior|Junior|Lead|Staff|Principal|Mid-Level|Entry-Level|Manager|Director|VP|Head of)\s+[A-Z][a-zA-Z\s/]{2,40}",
]

COMPANY_PATTERNS = [
    r"(?:at|@|join)\s+([A-Z][a-zA-Z0-9\s&.,'-]{2,40}?)(?:\s+as|\s+we|\s+is|\s+\.|,|\n)",
    r"(?:company|employer|organization|firm|startup):\s*([A-Z][a-zA-Z0-9\s&.,'-]{2,40})",
    r"About\s+([A-Z][a-zA-Z0-9\s&.,'-]{2,40}):",
]

SENIORITY_MAP = {
    "intern": ["intern", "internship", "student", "trainee", "0-1 year", "0 year", "fresher", "graduate"],
    "junior": ["junior", "associate", "entry", "0-2 year", "1-2 year", "1+ year", "2 year"],
    "mid": ["mid", "intermediate", "2-5 year", "3+ year", "3-5 year", "4 year", "2+ year"],
    "senior": ["senior", "sr.", "sr ", "lead", "5+ year", "6+ year", "7+ year", "8+ year", "5-8 year", "experienced"],
    "staff": ["staff", "principal", "architect", "head", "director", "vp", "manager", "10+ year"],
}

TONE_SIGNALS = {
    "startup": ["startup", "fast-paced", "move fast", "scrappy", "ownership", "wear many hats", "scale", "seed", "series a", "vc"],
    "technical": ["engineer", "developer", "architect", "systems", "infrastructure", "algorithms", "performance"],
    "creative": ["design", "creative", "brand", "marketing", "content", "storytelling", "UX", "UI"],
    "formal": ["corporation", "enterprise", "global", "international", "compliance", "regulatory"],
}

INDUSTRY_SIGNALS = {
    "fintech": ["fintech", "payment", "banking", "finance", "trading", "crypto", "blockchain", "defi"],
    "healthtech": ["health", "medical", "clinical", "pharma", "biotech", "healthcare", "patient"],
    "edtech": ["education", "learning", "school", "university", "student", "curriculum", "edtech"],
    "e-commerce": ["e-commerce", "ecommerce", "retail", "marketplace", "shopping", "product catalog"],
    "saas": ["saas", "b2b", "platform", "subscription", "enterprise software"],
    "technology": ["software", "tech", "IT", "digital", "cloud", "data", "AI", "ML"],
    "gaming": ["game", "gaming", "unity", "unreal", "mobile game"],
}

SECTIONS_KEYWORDS = {
    "summary": ["summary", "objective", "about you", "profile"],
    "experience": ["experience", "work history", "employment", "job"],
    "education": ["education", "degree", "university", "college", "academic"],
    "skills": ["skills", "technical skills", "competencies", "expertise", "proficiency"],
    "projects": ["projects", "portfolio", "side projects", "open source"],
    "certifications": ["certification", "certified", "certificate", "credential", "license"],
    "publications": ["publication", "paper", "research", "journal", "conference"],
    "awards": ["award", "honor", "achievement", "recognition", "prize"],
    "languages": ["language", "multilingual", "bilingual", "fluent"],
}


def _md5(text: str) -> str:
    return hashlib.md5(text.strip().lower().encode()).hexdigest()


def _extract_role_title(text: str) -> str:
    """Extract job title from JD text."""
    # Try structured patterns first
    for pattern in ROLE_PATTERNS:
        m = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
        if m:
            title = m.group(1).strip()
            if 3 < len(title) < 60:
                return title

    # Fallback: look for seniority + role combo anywhere
    seniority_words = r"(?:Senior|Sr\.?|Junior|Jr\.?|Lead|Staff|Principal|Mid[- ]?Level|Associate|Entry[- ]?Level)"
    role_words = r"(?:Engineer|Developer|Architect|Designer|Manager|Analyst|Scientist|Specialist|Consultant|Director|VP|Head)"
    pattern = rf"{seniority_words}\s+[A-Z]?[a-z]+\s+{role_words}|{seniority_words}\s+{role_words}"
    m = re.search(pattern, text, re.IGNORECASE)
    if m:
        return m.group(0).strip()

    # Last resort: find "X Engineer" or "X Developer" etc.
    m = re.search(r"[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\s+(?:Engineer|Developer|Designer|Manager|Analyst|Scientist)", text)
    if m:
        return m.group(0).strip()

    return "Software Engineer"


def _extract_company(text: str) -> str | None:
    """Extract company name from JD text."""
    for pattern in COMPANY_PATTERNS:
        m = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
        if m:
            name = m.group(1).strip().rstrip(".,")
            if 2 < len(name) < 50:
                return name
    return None


def _extract_skills(text: str) -> tuple[list[str], list[str]]:
    """Extract required and preferred skills from JD text."""
    text_lower = text.lower()

    # Split text into required vs preferred sections
    req_section = text
    pref_section = ""

    # Find "preferred" / "nice to have" sections
    pref_patterns = [
        r"(?:nice[- ]to[- ]have|preferred|bonus|plus|advantageous)[:\s]+(.*?)(?:\n\n|\Z)",
        r"(?:preferred qualifications?|bonus points?)[:\s]+(.*?)(?:\n\n|\Z)",
    ]
    for p in pref_patterns:
        m = re.search(p, text, re.IGNORECASE | re.DOTALL)
        if m:
            pref_section = m.group(1)
            # Remove preferred section from required search area
            req_section = text[:m.start()]
            break

    required = []
    preferred = []
    seen = set()

    for skill in TECH_SKILLS:
        skill_lower = skill.lower()
        # Check if skill appears in text (word boundary aware)
        pattern = r'\b' + re.escape(skill_lower) + r'\b'
        if re.search(pattern, req_section.lower()):
            if skill_lower not in seen:
                seen.add(skill_lower)
                required.append(skill)

    for skill in TECH_SKILLS:
        skill_lower = skill.lower()
        if pref_section and re.search(r'\b' + re.escape(skill_lower) + r'\b', pref_section.lower()):
            if skill_lower not in seen:
                seen.add(skill_lower)
                preferred.append(skill)

    return required, preferred


def _extract_keywords(text: str, required: list[str], preferred: list[str]) -> list[str]:
    """Extract additional keywords from JD not in skills lists."""
    keywords = []
    seen_lower = {s.lower() for s in required + preferred}

    # Look for capitalized phrases that may be keywords
    cap_phrases = re.findall(r'\b[A-Z][a-zA-Z]{2,}(?:\s+[A-Z][a-zA-Z]{2,})*\b', text)
    for phrase in cap_phrases:
        p_lower = phrase.lower()
        if (p_lower not in seen_lower
                and len(phrase) > 2
                and phrase not in ("The", "This", "That", "We", "Our", "You", "Your", "About", "Join")):
            keywords.append(phrase)
            seen_lower.add(p_lower)

    # Also check soft skills
    for soft in SOFT_SKILLS:
        if re.search(r'\b' + re.escape(soft.lower()) + r'\b', text.lower()):
            if soft.lower() not in seen_lower:
                keywords.append(soft)
                seen_lower.add(soft.lower())

    return keywords[:15]


def _detect_seniority(text: str) -> str:
    text_lower = text.lower()
    for level, signals in SENIORITY_MAP.items():
        for signal in signals:
            if signal in text_lower:
                return level
    return "mid"


def _detect_tone(text: str) -> str:
    text_lower = text.lower()
    scores = {}
    for tone, signals in TONE_SIGNALS.items():
        scores[tone] = sum(1 for s in signals if s in text_lower)
    return max(scores, key=scores.get) if any(scores.values()) else "formal"


def _detect_industry(text: str) -> str:
    text_lower = text.lower()
    scores = {}
    for industry, signals in INDUSTRY_SIGNALS.items():
        scores[industry] = sum(1 for s in signals if s in text_lower)
    return max(scores, key=scores.get) if any(scores.values()) else "technology"


def _detect_page_count(text: str) -> int:
    """1 page for junior/intern, 2 for senior+."""
    seniority = _detect_seniority(text)
    return 2 if seniority in ("senior", "staff") else 1


def _detect_sections(text: str, required: list[str]) -> list[str]:
    """Detect which resume sections are most relevant for this role."""
    text_lower = text.lower()
    sections = ["summary", "experience", "skills"]

    # Always include education
    sections.append("education")

    # Add optional sections based on JD signals
    if any(kw in text_lower for kw in SECTIONS_KEYWORDS["projects"]):
        sections.append("projects")
    if any(kw in text_lower for kw in SECTIONS_KEYWORDS["certifications"]):
        sections.append("certifications")
    if any(kw in text_lower for kw in SECTIONS_KEYWORDS["publications"]):
        sections.append("publications")
    if any(kw in text_lower for kw in SECTIONS_KEYWORDS["awards"]):
        sections.append("awards")

    # If many tech skills → include projects by default
    if len(required) >= 5 and "projects" not in sections:
        sections.append("projects")

    return sections


def _extract_responsibilities(text: str) -> list[str]:
    """Extract bullet-point responsibilities from JD."""
    lines = text.split("\n")
    responsibilities = []
    in_resp_section = False

    for line in lines:
        line = line.strip()
        line_lower = line.lower()

        # Detect start of responsibilities section
        if re.search(r"(?:responsibilities|what you.ll do|you will|duties|role overview)", line_lower):
            in_resp_section = True
            continue

        # Detect end of section
        if in_resp_section and re.search(r"(?:requirements?|qualifications?|skills|about you|what we)", line_lower):
            in_resp_section = False

        # Extract bullet points
        if in_resp_section and re.match(r"^[-•*·✓►▸]\s+.{10,}", line):
            cleaned = re.sub(r"^[-•*·✓►▸]\s+", "", line).strip()
            if len(cleaned) > 10:
                responsibilities.append(cleaned)

    # Fallback: extract any bullet points with action verbs
    if not responsibilities:
        action_verbs = r"(?:build|develop|design|create|implement|maintain|lead|manage|collaborate|own|drive|ship|improve|optimize)"
        for line in lines:
            line = line.strip()
            if (re.match(r"^[-•*·✓►▸]\s+", line)
                    and re.search(action_verbs, line, re.IGNORECASE)
                    and len(line) > 15):
                cleaned = re.sub(r"^[-•*·✓►▸]\s+", "", line).strip()
                responsibilities.append(cleaned)

    return responsibilities[:8]


def parse_jd_locally(jd_text: str) -> dict:
    """
    Parse a job description entirely locally — no internet required.
    Returns the same structure as the LLM-based parser used to.
    """
    required, preferred = _extract_skills(jd_text)
    keywords = _extract_keywords(jd_text, required, preferred)
    seniority = _detect_seniority(jd_text)
    tone = _detect_tone(jd_text)
    industry = _detect_industry(jd_text)
    sections = _detect_sections(jd_text, required)
    responsibilities = _extract_responsibilities(jd_text)
    role_title = _extract_role_title(jd_text)
    company_name = _extract_company(jd_text)
    page_count = _detect_page_count(jd_text)

    return {
        "role_title": role_title,
        "company_name": company_name,
        "required_skills": required,
        "preferred_skills": preferred,
        "keywords": keywords,
        "sections_needed": sections,
        "tone": tone,
        "seniority": seniority,
        "page_count": page_count,
        "industry": industry,
        "responsibilities": responsibilities,
    }


async def analyse_jd(jd_text: str) -> dict:
    """
    Analyse a job description and return structured parsed data.
    Uses local regex-based parser (no internet needed).
    Results are cached in Supabase by MD5 hash.
    """
    jd_hash = _md5(jd_text)

    # Check cache first
    try:
        cached = (
            supabase.table("jd_cache")
            .select("parsed_result")
            .eq("jd_hash", jd_hash)
            .execute()
        )
        if cached.data and len(cached.data) > 0:
            result = cached.data[0].get("parsed_result")
            if result and isinstance(result, dict) and result.get("role_title"):
                return result
    except Exception:
        pass  # Cache miss — continue to parse

    # Parse locally — runs in thread to avoid blocking event loop
    parsed = await asyncio.to_thread(parse_jd_locally, jd_text)

    # Normalize fields with safe defaults
    parsed.setdefault("role_title", "Software Engineer")
    parsed.setdefault("company_name", None)
    parsed.setdefault("required_skills", [])
    parsed.setdefault("preferred_skills", [])
    parsed.setdefault("keywords", [])
    parsed.setdefault("sections_needed", ["summary", "experience", "education", "skills"])
    parsed.setdefault("tone", "formal")
    parsed.setdefault("seniority", "mid")
    parsed.setdefault("page_count", 1)
    parsed.setdefault("industry", "technology")
    parsed.setdefault("responsibilities", [])

    # Cache the result (upsert to avoid duplicate-key errors)
    try:
        supabase.table("jd_cache").upsert({
            "jd_hash": jd_hash,
            "parsed_result": parsed,
            "company_name": parsed.get("company_name"),
        }, on_conflict="jd_hash").execute()
    except Exception:
        pass  # Cache write failure is non-critical

    return parsed
