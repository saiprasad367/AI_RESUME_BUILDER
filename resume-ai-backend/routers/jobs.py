from fastapi import APIRouter, Query, HTTPException
from services.job_scraper import scrape_jobs
from services.company_intel import fetch_company_intel

router = APIRouter(prefix="/jobs", tags=["Jobs and Company Intelligence"])


@router.get("/search")
async def search_jobs(
    role: str = Query(..., min_length=1, description="Job role to search for"),
    location: str = Query("India", description="Location to filter jobs by"),
):
    try:
        listings = await scrape_jobs(role, location)
        return {"listings": listings}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to scrape job listings: {str(e)}"
        )


@router.get("/intel")
async def get_company_intelligence(
    company_name: str = Query(..., min_length=1, description="Company name to scrape intelligence for")
):
    try:
        intel = await fetch_company_intel(company_name)
        return intel
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to fetch company intel: {str(e)}"
        )
