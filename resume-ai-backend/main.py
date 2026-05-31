import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from routers import jd, jobs, resume, coach

app = FastAPI(
    title="CareerPilot AI Backend",
    description="Backend API for Resume Tailoring and Career Navigation",
    version="1.0.0",
)

# CORS Setup
origins = [
    settings.FRONTEND_URL,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://localhost:8080",
    "http://localhost:8081",
    "http://localhost:8082",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(jd.router, prefix="/api")
app.include_router(jobs.router, prefix="/api")
app.include_router(resume.router, prefix="/api")
app.include_router(coach.router, prefix="/api")


@app.get("/")
def read_root():
    return {
        "message": "Welcome to CareerPilot AI API!",
        "status": "healthy",
        "docs_url": "/docs",
    }


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
