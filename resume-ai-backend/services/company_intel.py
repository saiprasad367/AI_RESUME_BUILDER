"""
Company Intel Scraper — Fetches and extracts company culture, tech stack,
mission and values from public web pages using httpx + BeautifulSoup.
Results are cached in Supabase jd_cache.company_intel column.
"""
import json
import asyncio
import httpx
from bs4 import BeautifulSoup
from database.supabase_client import supabase
from services.hf_client import call_mistral

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/122.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}

EMPTY_INTEL = {
    "culture_keywords": [],
    "tech_stack": [],
    "mission": "",
    "values": [],
    "about_text": "",
}


def _get_urls(company_name: str) -> list[str]:
    slug = company_name.lower().replace(" ", "").replace(".", "")
    slug_dash = company_name.lower().replace(" ", "-")
    return [
        f"https://www.{slug}.com/about",
        f"https://www.{slug}.com/about-us",
        f"https://www.{slug}.com/company",
        f"https://www.{slug}.com/careers",
        f"https://www.{slug}.com/culture",
        f"https://en.wikipedia.org/wiki/{company_name.replace(' ', '_')}",
        f"https://www.linkedin.com/company/{slug_dash}/about/",
    ]


async def _scrape_page(client: httpx.AsyncClient, url: str) -> str | None:
    try:
        r = await client.get(url, headers=HEADERS, timeout=10, follow_redirects=True)
        if r.status_code == 200 and "text/html" in r.headers.get("content-type", ""):
            soup = BeautifulSoup(r.text, "lxml")
            for tag in soup(["script", "style", "nav", "footer", "header", "aside"]):
                tag.decompose()
            text = soup.get_text(separator=" ", strip=True)
            # Return up to 3000 chars of clean text
            return " ".join(text.split())[:3000]
    except Exception:
        return None
    return None


def _extract_intel_with_mistral(text: str) -> dict:
    prompt = f"""[INST]
Extract company culture data from this text. Return ONLY valid JSON, no explanation.
{{
  "culture_keywords": ["max 6 words like ownership, move fast, customer obsessed"],
  "tech_stack": ["technologies mentioned"],
  "mission": "one sentence company mission",
  "values": ["up to 5 company values"]
}}

Text: {text[:2000]}
[/INST]"""
    try:
        result = call_mistral(prompt)
        start = result.find("{")
        end = result.rfind("}") + 1
        if start >= 0 and end > 0:
            parsed = json.loads(result[start:end])
            return {
                "culture_keywords": parsed.get("culture_keywords", [])[:6],
                "tech_stack": parsed.get("tech_stack", [])[:10],
                "mission": str(parsed.get("mission", ""))[:300],
                "values": parsed.get("values", [])[:5],
            }
    except Exception:
        pass
    return {}


async def fetch_company_intel(company_name: str) -> dict:
    """
    Fetch and return company intel. Checks Supabase cache first.
    Falls back gracefully — returns EMPTY_INTEL if all scraping fails.
    """
    if not company_name or not company_name.strip():
        return dict(EMPTY_INTEL)

    company_name = company_name.strip()

    # Check cache in jd_cache table
    try:
        cached = (
            supabase.table("jd_cache")
            .select("company_intel")
            .eq("company_name", company_name)
            .not_.is_("company_intel", "null")
            .limit(1)
            .execute()
        )
        if cached.data and len(cached.data) > 0:
            ci = cached.data[0].get("company_intel")
            if ci:
                return ci
    except Exception:
        pass

    intel = dict(EMPTY_INTEL)

    # Scrape multiple URLs
    urls = _get_urls(company_name)
    async with httpx.AsyncClient() as client:
        for url in urls:
            text = await _scrape_page(client, url)
            if text and len(text) > 200:
                extracted = await asyncio.to_thread(_extract_intel_with_mistral, text)
                intel.update(extracted)
                intel["about_text"] = text[:500]
                break  # Stop at first successful scrape

    # Cache the result
    try:
        supabase.table("jd_cache").update(
            {"company_intel": intel}
        ).eq("company_name", company_name).execute()
    except Exception:
        pass

    return intel
