"""
Job Scraper — Scrapes real job listings from Naukri.com with LinkedIn fallback.
No API keys required. Uses httpx + BeautifulSoup.
"""
import asyncio
import httpx
from bs4 import BeautifulSoup

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/122.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Referer": "https://www.google.com/",
}


def _parse_naukri(html: str, location: str) -> list[dict]:
    soup = BeautifulSoup(html, "lxml")
    jobs = []

    # Naukri uses multiple possible class names — try all known patterns
    selectors = [
        "article.jobTuple",
        "div.jobTuple",
        "div[class*='job-tuple']",
        "div[class*='srp-jobtuple']",
        "article[class*='job']",
    ]

    job_cards = []
    for sel in selectors:
        cards = soup.select(sel)
        if cards:
            job_cards = cards
            break

    for card in job_cards[:10]:
        try:
            title_el = card.select_one(
                "a.title, a[class*='title'], a[class*='jobTitle'], h2 a, .jobTupleHeader a"
            )
            company_el = card.select_one(
                "a.subTitle, a[class*='comp-name'], span[class*='comp-name'], "
                "a[class*='company'], .companyInfo a"
            )
            loc_el = card.select_one(
                "li.location, span[class*='locWdth'], li[class*='location'], "
                "span[class*='location'], .locWdth"
            )
            exp_el = card.select_one(
                "li.experience, span[class*='expwdth'], li[class*='experience'], "
                ".experience"
            )
            sal_el = card.select_one(
                "li.salary, span[class*='salary'], li[class*='salary']"
            )

            if not title_el:
                continue

            jobs.append({
                "title": title_el.get_text(strip=True),
                "company": company_el.get_text(strip=True) if company_el else "Unknown",
                "location": loc_el.get_text(strip=True) if loc_el else location,
                "experience": exp_el.get_text(strip=True) if exp_el else "Not specified",
                "salary": sal_el.get_text(strip=True) if sal_el else "Not disclosed",
                "url": title_el.get("href", "") or "",
                "source": "Naukri",
            })
        except Exception:
            continue

    return jobs


def _parse_linkedin(html: str, location: str, fallback_url: str) -> list[dict]:
    soup = BeautifulSoup(html, "lxml")
    jobs = []

    selectors = [
        "div.job-search-card",
        "li.jobs-search-results__list-item",
        "div[class*='job-card']",
        "div[class*='base-card']",
    ]

    cards = []
    for sel in selectors:
        cards = soup.select(sel)
        if cards:
            break

    for card in cards[:8]:
        try:
            title_el = card.select_one("h3, h3.base-search-card__title, h3[class*='title']")
            company_el = card.select_one("h4, h4.base-search-card__subtitle, a[class*='company']")
            loc_el = card.select_one(
                "span.job-search-card__location, span[class*='location'], "
                "span[class*='job-location']"
            )
            link_el = card.select_one("a[class*='base-card__full-link'], a[class*='job'], a")

            if not title_el:
                continue

            jobs.append({
                "title": title_el.get_text(strip=True),
                "company": company_el.get_text(strip=True) if company_el else "Unknown",
                "location": loc_el.get_text(strip=True) if loc_el else location,
                "experience": "Not specified",
                "salary": "Not disclosed",
                "url": link_el.get("href", fallback_url) if link_el else fallback_url,
                "source": "LinkedIn",
            })
        except Exception:
            continue

    return jobs


async def scrape_jobs(role: str, location: str = "India") -> list[dict]:
    """
    Scrape job listings for the given role and location.
    Primary: Naukri.com
    Fallback: LinkedIn public job search
    Returns up to 8 job listings. Never raises — returns empty list on failure.
    """
    role_slug = role.lower().replace(" ", "-")
    location_slug = location.lower().replace(" ", "-")
    naukri_url = f"https://www.naukri.com/{role_slug}-jobs-in-{location_slug}"

    jobs: list[dict] = []

    async with httpx.AsyncClient(timeout=15, follow_redirects=True) as client:
        # Try Naukri first
        try:
            r = await client.get(naukri_url, headers=HEADERS)
            if r.status_code == 200:
                jobs = _parse_naukri(r.text, location)
        except Exception:
            pass

        # LinkedIn fallback
        if not jobs:
            role_encoded = role.replace(" ", "%20")
            loc_encoded = location.replace(" ", "%20")
            linkedin_url = (
                f"https://www.linkedin.com/jobs/search/"
                f"?keywords={role_encoded}&location={loc_encoded}"
            )
            try:
                r = await client.get(linkedin_url, headers=HEADERS)
                if r.status_code == 200:
                    jobs = _parse_linkedin(r.text, location, linkedin_url)
            except Exception:
                pass

        # Indeed fallback
        if not jobs:
            role_encoded = role.replace(" ", "+")
            loc_encoded = location.replace(" ", "+")
            indeed_url = f"https://www.indeed.com/jobs?q={role_encoded}&l={loc_encoded}"
            try:
                r = await client.get(indeed_url, headers=HEADERS)
                if r.status_code == 200:
                    soup = BeautifulSoup(r.text, "lxml")
                    cards = soup.select("div.job_seen_beacon, div[class*='jobCard']")
                    for card in cards[:8]:
                        try:
                            title_el = card.select_one("h2 a span, a[class*='jcs-JobTitle']")
                            company_el = card.select_one("span[class*='company'], div[class*='company']")
                            loc_el = card.select_one("div[class*='location'], span[class*='location']")
                            link_el = card.select_one("h2 a")
                            if title_el:
                                jobs.append({
                                    "title": title_el.get_text(strip=True),
                                    "company": company_el.get_text(strip=True) if company_el else "Unknown",
                                    "location": loc_el.get_text(strip=True) if loc_el else location,
                                    "experience": "Not specified",
                                    "salary": "Not disclosed",
                                    "url": ("https://www.indeed.com" + link_el.get("href", "")) if link_el else indeed_url,
                                    "source": "Indeed",
                                })
                        except Exception:
                            continue
            except Exception:
                pass

    return jobs
