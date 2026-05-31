"""
Terminal Test Script — Tests all files inside the services/ folder.
Executes individually and prints results/statuses for all modules.
"""
import sys
import os
import asyncio
import json

# Ensure parent directory is in path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database.supabase_client import supabase
from services.hf_client import call_mistral, get_embeddings
from services.jd_analyser import analyse_jd
from services.ats_scorer import score_ats, _match_keyword
from services.company_intel import fetch_company_intel
from services.job_scraper import scrape_jobs
from services.profile_builder import build_relevant_profile
from services.section_gatekeeper import get_sections
from services.template_picker import pick_template
from services.rl_ranker import BulletRanker
from services.filename_generator import generate_filename

# Test config
TEST_USER_ID = "45d9774a-98e0-4b2f-b05c-a2e12fa6b7d4"
SAMPLE_JD = """
About Nokia:
We are looking for a Senior Full Stack Developer to join our team.

Responsibilities:
- Build and deploy scalable web applications using Java and Python.
- Develop front-end interfaces using React and Tailwind CSS.
- Optimize database queries in PostgreSQL.

Requirements:
- Strong knowledge of Python, Java, and React.
- Experience with Docker, AWS, and Git/GitHub.
- Experience with C++ or C# is a plus.
- Knowledge of .NET platform.
"""

def print_banner(title: str):
    print("=" * 60)
    print(f" {title.upper()} ".center(60, "-"))
    print("=" * 60)

async def test_hf_client():
    print_banner("1. Testing Hugging Face Client")
    
    # Test embeddings
    print("Testing get_embeddings() with 'Python'...")
    try:
        embeds = get_embeddings(["Python"])
        print(f"  [OK] Successfully retrieved embeddings. Length: {len(embeds[0])} dimensions.")
    except Exception as e:
        print(f"  [FAIL] Embeddings failed: {e}")
        if "403" in str(e) or "sufficient permissions" in str(e).lower():
            print("\n  >> WARNING: Your Hugging Face token lacks the 'Make calls to Inference Providers' scope.")
            print("  >> Please go to https://huggingface.co/settings/tokens to enable this permission.\n")
            
    # Test chat completion
    print("Testing call_mistral() with a test prompt...")
    try:
        resp = call_mistral("Say 'HF Client Test Successful' in exactly one sentence.")
        print(f"  [OK] Response: {resp}")
    except Exception as e:
        print(f"  [FAIL] Mistral call failed: {e}")
        if "403" in str(e) or "sufficient permissions" in str(e).lower():
            print("\n  >> WARNING: Your Hugging Face token lacks the 'Make calls to Inference Providers' scope.")
            print("  >> Please go to https://huggingface.co/settings/tokens to enable this permission.\n")

async def test_jd_analyser():
    print_banner("2. Testing JD Analyser")
    print("Analysing sample Job Description...")
    try:
        res = await analyse_jd(SAMPLE_JD)
        print("Parsed JD Result:")
        print(json.dumps(res, indent=2))
        print("  [OK] JD Analyser completed successfully.")
        return res
    except Exception as e:
        print(f"  [FAIL] JD Analyser failed: {e}")
        return None

def test_ats_scorer():
    print_banner("3. Testing ATS Scorer & Boundary-Safe Optimizations")
    
    # Explicit test cases for false-positive prevention
    print("Running boundary-safe test cases...")
    test_cases = [
        # (keyword, resume_text, expected_match)
        ("go", "experience with django development", False),
        ("go", "i love to go to the store", True),
        ("java", "expert in javascript development", False),
        ("java", "proficient in java 21", True),
        ("c++", "experienced with c++ developer", True),
        ("c++", "knows c and other languages", False),
        ("c#", "developed in c# applications", True),
        (".net", "worked on .net core", True),
        (".net", "internet technologies", False),
        ("react", "react.js developer", True),
        ("react", "reactive architecture", False),
        ("project management", "led agile project management methodologies", True),
        ("project management", "project team coordination management", False),
    ]
    
    boundary_ok = True
    for kw, resume, expected in test_cases:
        actual = _match_keyword(kw, resume)
        status = "[PASS]" if actual == expected else "[FAIL]"
        print(f"  {status} Match '{kw}' in '{resume}'? Expected: {expected}, Got: {actual}")
        if actual != expected:
            boundary_ok = False
            
    if boundary_ok:
        print("  [OK] Boundary-safe keyword match logic passed all unit tests!")
    else:
        print("  [FAIL] Boundary-safe keyword match logic failed some tests.")

    # Test scoring with a dummy resume
    dummy_resume = {
        "header": {"name": "Sai Prasad"},
        "sections": [
            {
                "type": "skills",
                "categories": {
                    "Technical Skills": ["Python", "React", "PostgreSQL", "Git", "GitHub", "JavaScript"]
                }
            }
        ]
    }
    
    dummy_jd_parsed = {
        "required_skills": ["Python", "Java", "React"],
        "preferred_skills": ["Docker", "AWS", "Git"],
        "keywords": ["go", "c++", ".net"]
    }
    
    score_result = score_ats(dummy_resume, dummy_jd_parsed)
    print("Sample Resume ATS Score Results:")
    print(json.dumps(score_result, indent=2))
    print(f"  [OK] ATS Scorer finished with score {score_result['score']}%")

async def test_company_intel():
    print_banner("4. Testing Company Intel Scraper")
    print("Fetching company intelligence for 'Nokia'...")
    try:
        intel = await fetch_company_intel("Nokia")
        print("Company Intel Result (Culture, Tech stack, Mission, Values):")
        print(json.dumps(intel, indent=2))
        print("  [OK] Company Intel Scraper completed successfully.")
    except Exception as e:
        print(f"  [FAIL] Company Intel Scraper failed: {e}")

async def test_job_scraper():
    print_banner("5. Testing Job Scraper")
    print("Scraping jobs for role 'Full Stack Developer' in 'India'...")
    try:
        jobs = await scrape_jobs("Full Stack Developer", "India")
        print(f"Scraped {len(jobs)} jobs. Top 2 results:")
        for idx, job in enumerate(jobs[:2]):
            print(f"  Job {idx+1}: {job['title']} at {job['company']} (Source: {job['source']}) - Link: {job['url']}")
        print("  [OK] Job Scraper completed successfully.")
    except Exception as e:
        print(f"  [FAIL] Job Scraper failed: {e}")

async def test_profile_builder_and_gatekeeper(jd_parsed):
    print_banner("6. Testing Profile Builder & Section Gatekeeper")
    
    if not jd_parsed:
        print("  [SKIP] Skipping because JD parsed data is unavailable.")
        return None, None
        
    print(f"Building relevant profile for user {TEST_USER_ID}...")
    
    # Test profile builder
    filtered_profile = None
    try:
        filtered_profile = build_relevant_profile(TEST_USER_ID, jd_parsed)
        print(f"  [OK] Successfully built relevant profile.")
        print(f"  Retained experiences: {len(filtered_profile.get('experiences', []))}")
        print(f"  Retained projects: {len(filtered_profile.get('projects', []))}")
    except Exception as e:
        print(f"  [FAIL] Profile Builder failed: {e}")
        print("  Retrying with a local mock profile for gatekeeper/picker testing...")
        filtered_profile = {
            "header": {"name": "Sai Prasad", "email": "saiprasad@example.com"},
            "summary": "Full Stack Developer skilled in Python, React, and Java.",
            "experiences": [
                {
                    "title": "AI on Azure Intern",
                    "company": "Edunet Foundation",
                    "bullets": ["Developed AI apps", "Built secure APIs"]
                }
            ],
            "projects": [
                {"name": "SmartBioGPT", "technologies": ["React", "Express.js"]}
            ],
            "education": [
                {"degree": "Bachelor of Technology", "institution": "CMR College", "field": "CSE"}
            ]
        }

    # Test Section Gatekeeper
    print("Determining sections with Gatekeeper...")
    try:
        final_sections, diff_reasons = get_sections(jd_parsed, filtered_profile)
        print(f"  [OK] Section Gatekeeper completed.")
        print(f"  Final Sections: {final_sections}")
        print(f"  Decisions: {json.dumps(diff_reasons, indent=2)}")
        return filtered_profile, final_sections
    except Exception as e:
        print(f"  [FAIL] Section Gatekeeper failed: {e}")
        return filtered_profile, None

def test_template_picker_and_filename_generator(jd_parsed, profile):
    print_banner("7. Testing Template Picker & Filename Generator")
    
    if not jd_parsed:
        print("  [SKIP] Skipping due to missing JD data.")
        return
        
    # Template Picker
    tone = jd_parsed.get("tone", "formal")
    seniority = jd_parsed.get("seniority", "mid")
    try:
        template = pick_template(tone, seniority)
        print(f"  [OK] Selected template for Tone '{tone}' and Seniority '{seniority}': {template}")
    except Exception as e:
        print(f"  [FAIL] Template Picker failed: {e}")

    # Filename Generator
    try:
        user_name = profile.get("header", {}).get("name", "Sai Prasad") if profile else "Sai Prasad"
        role_title = jd_parsed.get("role_title", "Developer")
        company_name = jd_parsed.get("company_name", "Nokia")
        filename = generate_filename(user_name, role_title, company_name)
        print(f"  [OK] Generated filename: {filename}")
    except Exception as e:
        print(f"  [FAIL] Filename Generator failed: {e}")

async def test_rl_ranker():
    print_banner("8. Testing RL Ranker Feedback Loop")
    
    bullets = [
        "Built highly scalable microservices that handled 50k requests per minute.",
        "Fixed critical UI bugs on the dashboard.",
        "Refactored legacy code to improve readability.",
        "Designed database models for PostgreSQL.",
    ]
    
    print(f"Original bullets:\n  " + "\n  ".join(bullets))
    
    try:
        ranker = BulletRanker(TEST_USER_ID)
        
        # Rank
        ranked = ranker.rank(bullets)
        print(f"Ranked bullets (Epsilon-greedy):\n  " + "\n  ".join(ranked))
        
        # Update / Feedback loop
        print("Simulating user selecting 'kept' on bullet #1 and 'deleted' on bullet #3...")
        await ranker.update(
            resume_id="test-resume-id-123",
            bullet_text=bullets[0],
            section="experience",
            user_action="kept"
        )
        await ranker.update(
            resume_id="test-resume-id-123",
            bullet_text=bullets[2],
            section="experience",
            user_action="deleted"
        )
        
        print(f"  [OK] RL Ranker score updated successfully. Bullet #1 score: {ranker.get_score(bullets[0]):.4f}, Bullet #3 score: {ranker.get_score(bullets[2]):.4f}")
    except Exception as e:
        print(f"  [FAIL] RL Ranker failed: {e}")

async def test_end_to_end_tailoring(jd_parsed, profile, final_sections):
    print_banner("9. Testing E2E Resume Tailoring & Optimization Outcome")
    if not jd_parsed or not profile or not final_sections:
        print("  [SKIP] Skipping E2E tailoring due to missing components.")
        return
        
    print("Constructing final tailored resume JSON structure...")
    try:
        sections_list = []
        for sec in final_sections:
            if sec == "summary":
                sections_list.append({"type": "summary", "content": profile.get("summary", "")})
            elif sec == "experience":
                sections_list.append({"type": "experience", "items": profile.get("experiences", [])})
            elif sec == "education":
                sections_list.append({"type": "education", "items": profile.get("education", [])})
            elif sec == "skills":
                sections_list.append({"type": "skills", "categories": {"Technical Skills": profile.get("skills", [])}})
            elif sec == "projects":
                sections_list.append({"type": "projects", "items": profile.get("projects", [])})
            elif sec == "certifications":
                sections_list.append({"type": "certifications", "items": profile.get("certifications", [])})
        
        tailored_resume = {
            "header": profile.get("header", {"name": "Sai Prasad"}),
            "sections": sections_list
        }
        
        # Calculate ATS match
        ats_res = score_ats(tailored_resume, jd_parsed)
        
        print("\nTailored Resume ATS Analysis Result against Nokia JD:")
        print(f"  ATS Match Score: {ats_res['score']}%")
        print(f"  Matched Keywords: {ats_res['matched']}")
        print(f"  Missing Keywords: {ats_res['missing']}")
        print(f"  Total Keywords Searched: {ats_res['total_keywords']}")
        print("\n  [OK] E2E tailoring, template selection, and ATS scoring complete!")
    except Exception as e:
        print(f"  [FAIL] E2E tailoring pipeline failed: {e}")

async def main():
    print_banner("STARTING ALL SERVICES API TESTS")
    
    # 1. Test HF Client
    await test_hf_client()
    
    # 2. Test JD Analyser
    jd_parsed = await test_jd_analyser()
    
    # 3. Test ATS Scorer
    test_ats_scorer()
    
    # 4. Test Company Intel
    await test_company_intel()
    
    # 5. Test Job Scraper
    await test_job_scraper()
    
    # 6. Test Profile Builder and Gatekeeper
    profile, sections = await test_profile_builder_and_gatekeeper(jd_parsed)
    
    # 7. Test Template Picker and Filename Generator
    test_template_picker_and_filename_generator(jd_parsed, profile)
    
    # 8. Test RL Ranker
    await test_rl_ranker()
    
    # 9. Test E2E Tailoring
    await test_end_to_end_tailoring(jd_parsed, profile, sections)
    
    print_banner("ALL TESTS COMPLETED")

if __name__ == "__main__":
    asyncio.run(main())
