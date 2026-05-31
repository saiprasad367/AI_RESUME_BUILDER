import asyncio
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Any, List
from routers.resume import get_current_user
from database.supabase_client import supabase
from services.jd_analyser import analyse_jd

router = APIRouter(prefix="/coach", tags=["Career Coach Operations"])


class GapRequest(BaseModel):
    jd_text: str


class RoadmapRequest(BaseModel):
    missing_skills: List[str]


class InterviewPrepRequest(BaseModel):
    role_title: str
    company_name: str


# ── Skill → curated learning content map ────────────────────────────────────────
SKILL_CONTENT = {
    "docker": {
        "tasks": ["Install Docker Desktop and run your first container", "Write a multi-stage Dockerfile for a Node.js/Python app", "Use docker-compose to orchestrate 3+ services locally"],
        "resources": ["Docker Official Docs (docs.docker.com)", "Play with Docker — free browser lab (labs.play-with-docker.com)", "TechWorld with Nana — Docker Tutorial (YouTube)"],
        "project": "Containerize a full-stack app (frontend + backend + DB) with docker-compose and push to Docker Hub.",
    },
    "kubernetes": {
        "tasks": ["Install minikube and deploy your first Pod", "Create Deployments, Services, and Ingress resources", "Set up Horizontal Pod Autoscaling and health probes"],
        "resources": ["Kubernetes Official Docs (kubernetes.io/docs)", "Kelsey Hightower — Kubernetes the Hard Way (GitHub)", "KodeKloud — Kubernetes for Absolute Beginners (Udemy)"],
        "project": "Deploy a 3-tier application on a local k8s cluster with HPA, rolling updates, and ConfigMaps.",
    },
    "react": {
        "tasks": ["Build a component library using React + TypeScript", "Implement state management with Zustand or Redux Toolkit", "Optimize performance with React.memo, useMemo, useCallback"],
        "resources": ["React Official Docs (react.dev)", "Josh W Comeau — The Joy of React (joyofreact.com)", "Jack Herrington — React TypeScript (YouTube)"],
        "project": "Build a full CRUD dashboard app with React Query, TypeScript, and a REST API backend.",
    },
    "typescript": {
        "tasks": ["Learn type inference, generics, and utility types", "Type a real-world API response using Zod + TypeScript", "Set up strict TypeScript config in an existing JS project"],
        "resources": ["TypeScript Handbook (typescriptlang.org/docs)", "Matt Pocock — Total TypeScript (totaltypescript.com)", "Execute Program — TypeScript interactive course"],
        "project": "Migrate a JavaScript project to strict TypeScript with full type coverage and zero 'any' types.",
    },
    "python": {
        "tasks": ["Learn Python data types, list comprehensions, and generators", "Build a REST API with FastAPI and Pydantic validation", "Write unit tests with pytest and achieve 80%+ coverage"],
        "resources": ["Python Official Docs (docs.python.org)", "Corey Schafer — Python Tutorials (YouTube)", "Real Python (realpython.com)"],
        "project": "Build a REST API with FastAPI, SQLAlchemy, PostgreSQL, and deploy it in a Docker container.",
    },
    "aws": {
        "tasks": ["Set up IAM roles, S3, and EC2 via AWS Console and CLI", "Deploy a containerized app using ECS Fargate or EKS", "Set up CloudWatch monitoring and SNS alerts"],
        "resources": ["AWS Documentation (docs.aws.amazon.com)", "Stephane Maarek — AWS SAA Course (Udemy)", "AWS Skill Builder — free tier labs"],
        "project": "Deploy a full web application on AWS (S3 + CloudFront + Lambda + RDS) with CI/CD via GitHub Actions.",
    },
    "node.js": {
        "tasks": ["Build a RESTful API with Express.js and middleware", "Implement JWT auth with Passport.js", "Add rate limiting, caching with Redis, and error handling"],
        "resources": ["Node.js Official Docs (nodejs.org/docs)", "The Odin Project — NodeJS path (theodinproject.com)", "Maximilian Schwarzmüller — NodeJS Course (Udemy)"],
        "project": "Build a production-ready REST API with Node.js, Express, MongoDB, and comprehensive error handling.",
    },
    "postgresql": {
        "tasks": ["Learn advanced SQL: joins, CTEs, window functions", "Design normalized schemas with proper indexing", "Set up replication and connection pooling with PgBouncer"],
        "resources": ["PostgreSQL Tutorial (postgresqltutorial.com)", "Hussein Nasser — PostgreSQL Internals (YouTube)", "Prisma Data Guide (prisma.io/dataguide)"],
        "project": "Design and build a database schema for an e-commerce platform with proper indexes and query optimization.",
    },
    "graphql": {
        "tasks": ["Build a GraphQL API with Apollo Server", "Implement queries, mutations, subscriptions", "Add DataLoader for N+1 query prevention"],
        "resources": ["GraphQL Official Docs (graphql.org/learn)", "Apollo GraphQL Tutorial (apollographql.com/tutorials)", "The Guild Blog (the-guild.dev/blog)"],
        "project": "Build a real-time GraphQL API with subscriptions for a chat/notification system.",
    },
    "system design": {
        "tasks": ["Study key concepts: CAP theorem, sharding, load balancing", "Design a URL shortener, Twitter feed, or Uber system", "Practice whiteboard system design with time limits"],
        "resources": ["Designing Data-Intensive Applications — Martin Kleppmann (book)", "System Design Primer (GitHub)", "ByteByteGo Newsletter (blog.bytebytego.com)"],
        "project": "Design and document a complete scalable system architecture for a real-world application (LLD + HLD).",
    },
    "next.js": {
        "tasks": ["Learn App Router routing conventions (layout, page, loading, error)", "Implement Server Actions with validation and state transitions", "Configure ISR, SSR, and dynamic rendering strategies"],
        "resources": ["Next.js Docs (nextjs.org/docs)", "Lee Robinson — Next.js Mastery (YouTube)", "Next.js Learn Course"],
        "project": "Build a SaaS marketing page and application dashboard with Next.js App Router, Tailwind, and Supabase Auth.",
    },
    "go": {
        "tasks": ["Learn Go syntax, structs, interfaces, and slices", "Master concurrency: Goroutines, Channels, sync.Mutex, and select", "Build a high-performance HTTP router using standard library or Gin"],
        "resources": ["A Tour of Go (tour.golang.org)", "Effective Go guide", "Ardan Labs Go Web Development course"],
        "project": "Build a fast microservice in Go with prometheus metrics, JSON logging, and clean domain architecture.",
    },
    "rust": {
        "tasks": ["Understand Ownership, Borrowing, Lifetimes, and Smart Pointers", "Implement error handling with Result and Option", "Write async code using Tokio runtime and build an HTTP endpoint"],
        "resources": ["The Rust Programming Language (doc.rust-lang.org/book)", "Rust by Example", "Jon Gjengset — Rust Tutorials (YouTube)"],
        "project": "Build a CLI tool or web service using Axum, SQLx, and PostgreSQL in Rust.",
    },
    "java": {
        "tasks": ["Learn OOP principles, Generics, and Collections in Java", "Build a REST API with Spring Boot, Spring Data JPA, and Lombok", "Implement security and authentication using Spring Security"],
        "resources": ["Baeldung Spring Boot Tutorials", "Java Brains — Spring Boot (YouTube)", "Spring Guides (spring.io/guides)"],
        "project": "Build an enterprise back-office management system with Spring Boot, MySQL, and Thymeleaf/React.",
    },
    "mongodb": {
        "tasks": ["Create document models and understand indexing strategies", "Perform aggregation pipelines for complex reporting queries", "Set up replica sets, clustering, and sharding configurations"],
        "resources": ["MongoDB University courses (university.mongodb.com)", "MongoDB Official Docs", "Maximilian Schwarzmüller — MongoDB Guide (Udemy)"],
        "project": "Design the database for a high-traffic gaming dashboard using MongoDB, including indexing and aggregate statistics.",
    },
    "observability": {
        "tasks": ["Understand structural logging, metrics, and trace contexts", "Instrument an app with OpenTelemetry SDK", "Build Grafana dashboards showing CPU, RAM, and HTTP latency metrics"],
        "resources": ["OpenTelemetry Official Website (opentelemetry.io)", "Prometheus Docs (prometheus.io)", "Grafana Labs Tutorials"],
        "project": "Set up a Prometheus, Grafana, and Jaeger stack to monitor and profile a containerized Node.js/Python application.",
    },
}


def _generate_roadmap_locally(missing_skills: list[str]) -> list[dict]:
    """Generate a detailed, progressive week-by-week learning roadmap."""
    # Clean up input list
    skills = [s.strip() for s in missing_skills if s.strip() and not s.startswith("✅")]
    if not skills:
        skills = ["System Design", "Docker", "Kubernetes", "Observability"]

    # We want a 6-week roadmap.
    # We will distribute the skills across 6 weeks.
    weeks = []
    num_skills = len(skills)
    
    for i in range(6):
        # Determine which skill and level this week belongs to
        if num_skills >= 6:
            skill = skills[min(i, num_skills - 1)]
            phase = "Foundations & Practice"
            level = 1
        elif num_skills == 5:
            if i == 0:
                skill = skills[0]
                phase = "Foundations"
                level = 1
            elif i == 1:
                skill = skills[0]
                phase = "Advanced & Project"
                level = 2
            else:
                skill = skills[i - 1]
                phase = "Core Concepts"
                level = 1
        elif num_skills == 4:
            if i in [0, 1]:
                skill = skills[0]
                phase = "Foundations" if i == 0 else "Advanced Project"
                level = 1 if i == 0 else 2
            elif i in [2, 3]:
                skill = skills[1]
                phase = "Foundations" if i == 2 else "Advanced Project"
                level = 1 if i == 2 else 2
            else:
                skill = skills[i - 2]
                phase = "Core Concepts"
                level = 1
        elif num_skills == 3:
            skill = skills[i // 2]
            level = (i % 2) + 1
            phase = "Foundations & Configuration" if level == 1 else "Advanced Production Scenarios"
        elif num_skills == 2:
            skill = skills[i // 3]
            level = (i % 3) + 1
            phase = "Foundations" if level == 1 else "Intermediate Development" if level == 2 else "Advanced Production & Capstone Project"
        else: # 1 skill
            skill = skills[0]
            level = i + 1
            phases = [
                "Foundations & Basic Syntax",
                "Core Features & Environment Setup",
                "Advanced Concepts & Best Practices",
                "Testing, Debugging & Performance",
                "System Architecture & API Integration",
                "Production Deployment & Capstone Project"
            ]
            phase = phases[i]
            
        skill_key = skill.lower().strip()
        
        # Look for curated content for this skill
        content = None
        for k, v in SKILL_CONTENT.items():
            if k in skill_key or skill_key in k:
                content = v
                break
                
        # Generate week detail
        if content:
            all_tasks = content["tasks"]
            all_resources = content["resources"]
            all_project = content["project"]
            
            if level == 1:
                tasks = [all_tasks[0]] if len(all_tasks) > 0 else [f"Configure first development environment for {skill}"]
                if len(all_tasks) > 1:
                    tasks.append(all_tasks[1])
                tasks.append(f"Explore the fundamental directories and architectural layouts of {skill}")
                project = f"Configure and build a minimal working prototype implementing {skill}."
            elif level == 2:
                tasks = [all_tasks[1]] if len(all_tasks) > 1 else [f"Build complex features using {skill}"]
                if len(all_tasks) > 2:
                    tasks.append(all_tasks[2])
                tasks.append(f"Implement intermediate error handling and edge case mitigations in {skill}")
                project = f"Develop a functional sandbox project applying core capabilities of {skill}."
            else:
                tasks = [all_tasks[-1]] if len(all_tasks) > 0 else [f"Optimize and deploy {skill} into staging/production"]
                tasks.extend([
                    f"Perform stress-testing, benchmarking, and observability setup for {skill}",
                    f"Review security guidelines and lock down the production configurations for {skill}"
                ])
                project = all_project
            resources = all_resources
        else:
            if level == 1:
                tasks = [
                    f"Install necessary tooling, runtime SDKs, or CLI utilities for {skill}",
                    f"Write a simple 'Hello World' or equivalent baseline program with {skill}",
                    f"Read {skill}'s official documentation and learn the primary primitives and syntax rules"
                ]
                resources = [
                    f"{skill} Official Website & Quickstart Guides",
                    f"Search on YouTube for '{skill} Crash Course for Beginners'",
                    f"Study simple repository starters on GitHub containing {skill}"
                ]
                project = f"Setup a clean repository with {skill} and build a basic functional app."
            elif level == 2 or level == 3:
                tasks = [
                    f"Implement clean code standards and structural patterns with {skill}",
                    f"Set up automated unit testing using standard testing framework for {skill}",
                    f"Build CRUD api endpoints or components that interact with dynamic state using {skill}"
                ]
                resources = [
                    f"Advanced reference guides and blog posts for {skill} architecture",
                    f"Read community-recommended books or GitHub repositories showing best practices for {skill}"
                ]
                project = f"Build an intermediate sandbox application demonstrating modularity and structure using {skill}."
            else:
                tasks = [
                    f"Configure CI/CD pipelines to build, test, and containerize {skill}",
                    f"Implement logging, metrics, error tracking, and telemetry for {skill}",
                    f"Perform performance tuning, profile memory footprint, and resolve resource bottlenecks"
                ]
                resources = [
                    f"{skill} Production Guidelines and Security Cheat Sheets",
                    f"Study performance optimization guides and caching strategies for {skill}"
                ]
                project = f"Deploy a production-ready application showcasing {skill} with full test coverage and monitoring."

        weeks.append({
            "week": f"Week {i + 1}",
            "topic": f"{skill} — {phase}",
            "tasks": tasks,
            "resources": resources,
            "project": project,
            "done": 0,
        })
        
    return weeks


def _generate_interview_questions(role: str, company: str) -> dict:
    """Generate targeted interview questions based on role and company."""
    r = role.lower()
    is_frontend = any(w in r for w in ["frontend", "react", "ui", "web"])
    is_backend = any(w in r for w in ["backend", "api", "node", "python", "java"])
    is_fullstack = "full" in r or (is_frontend and is_backend)
    is_data = any(w in r for w in ["data", "ml", "machine learning", "analyst"])
    is_mobile = any(w in r for w in ["mobile", "ios", "android", "flutter"])
    is_senior = any(w in r for w in ["senior", "lead", "principal", "staff", "architect"])

    if is_frontend:
        technical = [
            f"How do you architect a large-scale React application for performance and maintainability at {company}?",
            "Explain the difference between server-side rendering, static generation, and client-side rendering — when do you choose each?",
            "How do you handle state management in a complex app — what's your decision framework between Context, Zustand, and Redux?",
        ]
    elif is_backend:
        technical = [
            f"How would you design a high-availability microservices architecture at {company}'s scale?",
            "Walk through your approach to database schema design, indexing strategy, and query optimization.",
            "How do you design a rate-limiting and caching layer for a REST API under heavy traffic?",
        ]
    elif is_data:
        technical = [
            f"How do you evaluate and select ML models for a production use case at {company}?",
            "Explain your approach to feature engineering, validation strategy, and preventing data leakage.",
            "How do you monitor model performance drift in production and decide when to retrain?",
        ]
    elif is_mobile:
        technical = [
            f"How do you manage state and navigation in a large {role} application?",
            "Explain your approach to offline-first architecture and data synchronization.",
            "How do you profile and optimize rendering performance on both iOS and Android?",
        ]
    else:
        technical = [
            f"What's your approach to designing scalable systems for a {role} position at {company}?",
            f"How do you ensure code quality, testability, and maintainability in your {role} work?",
            "Describe your debugging process when facing an intermittent production issue with no clear logs.",
        ]

    if is_senior:
        behavioral = [
            "Tell me about a time you drove a major technical decision that had org-wide impact. How did you build alignment?",
            "Describe a situation where you mentored a struggling team member and changed their trajectory.",
            "How do you balance technical debt reduction with feature delivery pressure from product?",
        ]
    else:
        behavioral = [
            "Describe a time you had to learn a new technology under a tight deadline. How did you approach it?",
            f"Tell me about a conflict with a colleague at a previous role. How did you resolve it professionally?",
            "Give an example of a project where you took ownership beyond your assigned scope. What was the outcome?",
        ]

    project = [
        f"Walk me through the most technically complex project in your portfolio — architecture, challenges, and trade-offs.",
        "What would you do differently if you rebuilt your most recent significant project from scratch today?",
        f"How did you measure the business impact of your last major project, and what metrics mattered?",
    ]

    company_qs = [
        f"Why {company} specifically — what about the product, mission, or engineering culture excites you most?",
        f"What do you see as the biggest engineering challenges {company} will face in the next 2-3 years, and how would you approach them?",
        f"How do your career goals align with where {company} is heading as a company?",
    ]

    return {
        "Technical": technical,
        "Behavioral": behavioral,
        "Project": project,
        "Company": company_qs,
    }


def _generate_recommendations(headline: str, skills: list[str]) -> dict:
    """Generate career recommendations based on profile data."""
    skill_set = {s.lower() for s in skills}
    h = headline.lower()

    # Detect specialization
    is_frontend = any(s in skill_set for s in ["react", "vue", "angular", "typescript", "javascript"])
    is_backend = any(s in skill_set for s in ["python", "node.js", "java", "go", "django", "fastapi"])
    is_data = any(s in skill_set for s in ["python", "tensorflow", "pytorch", "pandas", "ml"])
    is_senior = any(w in h for w in ["senior", "lead", "principal", "staff"])

    if is_frontend:
        paths = [
            {"title": "Senior Frontend Engineer → Staff Engineer", "timeline": "12–18 months", "skills": ["System Design", "Web Performance", "Design Systems"]},
            {"title": "Full-Stack Product Engineer", "timeline": "9–12 months", "skills": ["Node.js", "PostgreSQL", "Docker"]},
            {"title": "Frontend Platform / DX Engineer", "timeline": "12 months", "skills": ["Bundlers", "Monorepo tooling", "Developer Experience"]},
        ]
        rec_skills = ["System Design", "Web Vitals / Performance", "Next.js App Router", "GraphQL", "Accessibility (WCAG)"]
        projects = [
            "Build a production-grade design system from scratch with Storybook + Chromatic",
            "Create a performance monitoring dashboard using PerformanceObserver APIs",
            "Open-source a React component library with full a11y and TypeScript support",
        ]
        courses = [
            {"title": "The Joy of React", "provider": "Josh W Comeau", "duration": "40h"},
            {"title": "System Design for Frontend Engineers", "provider": "Frontend Masters", "duration": "12h"},
            {"title": "Web Performance Fundamentals", "provider": "Frontend Masters", "duration": "8h"},
        ]
    elif is_backend:
        paths = [
            {"title": "Senior Backend Engineer → Tech Lead", "timeline": "12–18 months", "skills": ["Distributed Systems", "System Design", "Mentoring"]},
            {"title": "Platform / Infrastructure Engineer", "timeline": "12 months", "skills": ["Kubernetes", "Terraform", "Observability"]},
            {"title": "API / Integration Architect", "timeline": "9 months", "skills": ["API Design", "Event-Driven Architecture", "gRPC"]},
        ]
        rec_skills = ["Distributed Systems", "Kafka / Event Streaming", "Kubernetes", "System Design", "Observability (OpenTelemetry)"]
        projects = [
            "Build a distributed task queue system with Redis and worker pools",
            "Create a real-time notification service with WebSockets and Kafka",
            "Design and implement a multi-tenant SaaS API with rate limiting and billing integration",
        ]
        courses = [
            {"title": "Designing Data-Intensive Applications", "provider": "O'Reilly (Book)", "duration": "30h"},
            {"title": "Kubernetes for Developers", "provider": "KodeKloud", "duration": "20h"},
            {"title": "FastAPI Production Course", "provider": "TestDriven.io", "duration": "15h"},
        ]
    elif is_data:
        paths = [
            {"title": "ML Engineer", "timeline": "12 months", "skills": ["MLOps", "Feature Stores", "Model Serving"]},
            {"title": "AI Product Engineer", "timeline": "9 months", "skills": ["LLM APIs", "RAG", "Vector Databases"]},
            {"title": "Data Platform Engineer", "timeline": "12 months", "skills": ["dbt", "Airflow", "Data Modeling"]},
        ]
        rec_skills = ["MLOps / Model Deployment", "LangChain / LLM APIs", "Vector Databases (Pinecone / Weaviate)", "dbt", "Spark"]
        projects = [
            "Build an end-to-end ML pipeline with training, evaluation, and serving via FastAPI",
            "Create a RAG chatbot over a private document corpus using LangChain + Pinecone",
            "Design a real-time recommendation system with collaborative filtering",
        ]
        courses = [
            {"title": "Full Stack LLM Bootcamp", "provider": "The Full Stack (FSDL)", "duration": "20h"},
            {"title": "MLOps Fundamentals", "provider": "Coursera / Google", "duration": "15h"},
            {"title": "Practical Deep Learning", "provider": "fast.ai", "duration": "30h"},
        ]
    else:
        paths = [
            {"title": f"Senior {headline.split()[-1] if headline else 'Engineer'}", "timeline": "12 months", "skills": ["System Design", "Technical Leadership", "Mentoring"]},
            {"title": "Engineering Manager", "timeline": "18–24 months", "skills": ["People Management", "Roadmapping", "OKRs"]},
            {"title": "AI-Enhanced Developer", "timeline": "6 months", "skills": ["Prompt Engineering", "LLM APIs", "AI tooling"]},
        ]
        rec_skills = ["System Design", "Cloud (AWS/GCP)", "Docker + Kubernetes", "AI/LLM Integration", "Technical Writing"]
        projects = [
            "Build a production-ready microservice architecture with proper observability",
            "Create an AI-powered tool that automates a repetitive task in your current workflow",
            "Write a detailed technical blog series documenting a complex system you've built",
        ]
        courses = [
            {"title": "System Design Interview", "provider": "Educative.io", "duration": "15h"},
            {"title": "AWS Certified Solutions Architect", "provider": "A Cloud Guru", "duration": "40h"},
            {"title": "Generative AI for Developers", "provider": "DeepLearning.AI", "duration": "8h"},
        ]

    opportunities = [
        "Take ownership of the next large technical feature end-to-end — design, implementation, and rollout.",
        "Mentor a junior team member — teaching solidifies your own understanding and demonstrates leadership.",
        "Write a technical design document (TDD) for a system you'd like to build — share it internally or publicly.",
    ]

    return {
        "paths": paths,
        "opportunities": opportunities,
        "skills": rec_skills,
        "projects": projects,
        "courses": courses,
    }


# ── Routes ───────────────────────────────────────────────────────────────────────

@router.post("/gap")
async def analyze_skill_gap(request: GapRequest, user: Any = Depends(get_current_user)):
    """Analyze skill gap between candidate profile and target job description."""
    user_id = str(user.id)

    # 1. Fetch user profile skills
    profile_skills: list[str] = []
    try:
        profile_res = (
            supabase.table("user_profiles")
            .select("skills")
            .eq("user_id", user_id)
            .maybeSingle()
            .execute()
        )
        if profile_res and profile_res.data:
            profile_skills = profile_res.data.get("skills") or []
    except Exception:
        pass

    # 2. Parse JD locally (no internet)
    try:
        jd_parsed = await analyse_jd(request.jd_text)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Failed to analyze JD: {str(e)}")

    user_skills_lower = {s.lower().strip() for s in profile_skills}
    req_skills = jd_parsed.get("required_skills") or []
    pref_skills = jd_parsed.get("preferred_skills") or []
    keywords = jd_parsed.get("keywords") or []

    matched = [s for s in req_skills if s.lower().strip() in user_skills_lower]
    missing = [s for s in req_skills if s.lower().strip() not in user_skills_lower]
    match_pct = int((len(matched) / len(req_skills)) * 100) if req_skills else 0

    # Future skills: preferred + keywords not already owned
    all_future = list({s for s in (pref_skills + keywords) if s.lower().strip() not in user_skills_lower})[:6]
    if not all_future:
        all_future = ["System Design", "Cloud Architecture", "CI/CD", "Observability", "Docker"]

    return {
        "role_title": jd_parsed.get("role_title") or "Target Role",
        "match_percentage": match_pct,
        "matched_skills": matched,
        "missing_skills": missing if missing else ["✅ You meet all required skills!"],
        "future_skills": all_future,
    }


@router.post("/roadmap")
async def generate_learning_roadmap(request: RoadmapRequest, user: Any = Depends(get_current_user)):
    """Generate a detailed week-by-week learning roadmap — fully local, no LLM needed."""
    missing = [s for s in request.missing_skills if not s.startswith("✅")]
    if not missing:
        missing = ["System Design", "Docker", "Kubernetes", "CI/CD", "Observability", "Cloud Architecture"]

    weeks = await asyncio.to_thread(_generate_roadmap_locally, missing)
    return {"weeks": weeks}


@router.post("/interview-prep")
async def generate_interview_prep(request: InterviewPrepRequest, user: Any = Depends(get_current_user)):
    """Generate customized interview prep questions — fully local."""
    role = request.role_title or "Software Engineer"
    company = request.company_name or "the company"
    result = await asyncio.to_thread(_generate_interview_questions, role, company)
    return result


@router.post("/recommendations")
async def get_coach_recommendations(user: Any = Depends(get_current_user)):
    """Fetch career path recommendations from profile data — fully local."""
    user_id = str(user.id)
    profile: dict = {}

    try:
        profile_res = (
            supabase.table("user_profiles")
            .select("*")
            .eq("user_id", user_id)
            .maybeSingle()
            .execute()
        )
        if profile_res and profile_res.data:
            profile = profile_res.data
    except Exception:
        pass

    headline = profile.get("headline") or "Software Engineer"
    skills = profile.get("skills") or []
    result = await asyncio.to_thread(_generate_recommendations, headline, skills)
    return result
