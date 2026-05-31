from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.jd_analyser import analyse_jd

router = APIRouter(prefix="/jd", tags=["Job Description Analysis"])


class JDRequest(BaseModel):
    jd_text: str


@router.post("/analyse")
async def analyze_job_description(request: JDRequest):
    if not request.jd_text.strip():
        raise HTTPException(status_code=400, detail="Job description text cannot be empty.")
    try:
        result = await analyse_jd(request.jd_text)
        return result
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while analyzing the job description: {str(e)}"
        )
