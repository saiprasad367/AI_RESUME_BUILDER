<div align="center">

# 🚀 CareerPilot AI — Your Career, Optimized by AI

[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20DB-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

**An AI-powered Career Operating System** — ATS-optimized resumes, JD analysis, skill-gap intelligence, interview prep and job matching — all in one platform.

[Live Demo](#) · [Report Bug](https://github.com/saiprasad367/AI_RESUME_BUILDER/issues) · [Request Feature](https://github.com/saiprasad367/AI_RESUME_BUILDER/issues)

</div>

---

## 📌 Problem Statement

Many students and job seekers struggle to create professional resumes due to limited design knowledge, lack of proper formatting skills, and difficulty in writing impactful career summaries. Traditional resume creation methods using word processors are time-consuming and often result in inconsistent layouts and unprofessional designs.

Additionally, most resume builders stop at PDF generation — they don't help users understand how ATS (Applicant Tracking Systems) parse and score their resumes, what skills are missing for a target role, or how to close their career gaps efficiently.

---

## 🎯 Objective

The objective of this project is to develop an **AI-Powered Resume Builder** that simplifies the resume creation process through an intuitive and responsive web interface. The system allows users to:

- Easily input their details, customize resume templates, preview resumes in real time, and export them as **PDF** or **Word** documents.
- Receive **AI-generated professional summaries** and objective statements tailored to their experience.
- Analyze job descriptions and get **ATS compatibility scores** with actionable improvement tips.
- Identify **skill gaps** between their profile and target roles, with structured **learning roadmaps**.
- Get matched to relevant **job listings** and prepare for interviews with **AI-generated Q&A**.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 **AI Resume Builder** | Adaptive resumes that rewrite themselves for every job using AI |
| 📊 **ATS Analyzer** | Real-time ATS scoring with keyword and formatting feedback |
| 🔍 **JD Intelligence** | Extract role requirements, skills and signals from any job post |
| 🧑‍💼 **Career Coach** | Personalized AI guidance on next moves, gaps and growth paths |
| 📉 **Skill Gap Analyzer** | See exactly what's between you and your target role |
| 🎤 **Interview Prep** | Tailored question banks for the company you're applying to |
| 🗺️ **Learning Roadmaps** | Week-by-week curricula to close skill gaps with curated resources |
| 💼 **Job Matching** | Curated roles ranked by fit, not just keyword overlap |
| 🕰️ **Resume Version History** | Every iteration tracked — compare ATS scores side by side |
| 🏢 **Company Intelligence** | Culture, stack, values, and how to mirror them in your resume |
| 📥 **Export to PDF / Word** | Download resumes as `Name_Role.pdf` or `.doc` with one click |
| 🔐 **Google OAuth + Email Auth** | Sign in with Google or email/password via Supabase Auth |
| 📱 **Responsive Design** | Fully responsive across desktop, tablet, and mobile |

---

## 🧠 AI Algorithms & Logic

### 1. ATS Scoring Engine (`ats_scorer.py`)
- Extracts keywords from job descriptions using NLP tokenization.
- Computes **TF-IDF weighted keyword match score** between resume text and JD requirements.
- Evaluates formatting compliance (section headings, bullet points, date formats).
- Produces a final ATS score (0–100) with a breakdown of missing keywords and structural suggestions.

### 2. Reinforcement Learning Ranker (`rl_ranker.py`)
- Implements a **contextual bandit model** that learns from user feedback (clicks, downloads, applications).
- Uses `scikit-learn` to update weights via incremental learning (`partial_fit`).
- Ranks job listings and resume template suggestions based on historical user engagement stored in Supabase (`rl_feedback` table).

### 3. JD Analyser (`jd_analyser.py`)
- Parses raw job description text to extract:
  - Required vs. preferred skills
  - Seniority signals and role-level indicators
  - Industry-specific terminology and ATS keywords
- Uses **Hugging Face Inference API** for zero-shot classification of skill categories.

### 4. Profile Builder & Section Gatekeeper (`profile_builder.py`, `section_gatekeeper.py`)
- Dynamically determines which resume sections to include based on user profile completeness.
- Prevents empty or weak sections from being rendered in the exported resume.
- Uses rule-based scoring with threshold gates for each resume section.

### 5. Career Coach & Roadmap Generator (`coach.py`)
- Generates **progressive, multi-week learning roadmaps** that are non-repeating and tailored to skill gap analysis results.
- Provides personalized career guidance using structured prompts to the Hugging Face text-generation API.
- Tracks weekly progress and adjusts recommendations dynamically.

### 6. Company Intelligence (`company_intel.py`)
- Scrapes and summarizes public company data using `httpx` and `BeautifulSoup`.
- Extracts tech stack signals, culture indicators, and role-specific values to help users tailor their applications.

### 7. Resume Export Engine (`resume-utils.ts`)
- **PDF Export**: Renders the live DOM resume preview via `html2pdf.js` (loaded from CDN), capturing exact visual output. File is named `FirstName_LastName_RoleName.pdf`.
- **Word Export**: Serializes resume HTML to `.doc` format using a Blob with MIME type `application/msword`.
- **Text Export**: Extracts plain text from DOM for ATS-safe submission.

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 18** | UI Framework |
| **TypeScript 5** | Type Safety |
| **TanStack Router** | File-based routing |
| **Vite** | Build tool & dev server |
| **Vanilla CSS** | Custom design system (no Tailwind) |
| **html2pdf.js** (CDN) | PDF generation from DOM |
| **Supabase JS Client** | Auth, database queries |

### Backend
| Technology | Purpose |
|---|---|
| **FastAPI 0.115** | REST API framework |
| **Python 3.11+** | Core language |
| **Uvicorn** | ASGI server |
| **Pydantic v2** | Data validation & settings |
| **Supabase Python** | Database & auth integration |
| **scikit-learn** | ML / RL ranker |
| **Hugging Face Hub** | AI text generation & classification |
| **BeautifulSoup4** | Web scraping for job & company data |
| **httpx** | Async HTTP client |

### Infrastructure & Auth
| Technology | Purpose |
|---|---|
| **Supabase** | PostgreSQL database + Auth (Google OAuth, Email/Password) |
| **Google OAuth 2.0** | Social login via Supabase provider |
| **GitHub Actions** *(optional)* | CI/CD pipeline |

---

## 🗄️ Database Schema

The app uses **Supabase (PostgreSQL)** with 4 core tables:

```sql
user_profiles     -- Extended user data (bio, target role, skills, etc.)
resume_exports    -- Every exported resume with version tracking & ATS score
rl_feedback       -- User interaction signals for the RL ranker model
jd_cache          -- Cached JD analysis results to avoid redundant API calls
```

Run `supabase_schema.sql` in your Supabase SQL editor to initialize all tables, indexes, and Row Level Security (RLS) policies.

---

## ⚙️ Setup & Installation

### Prerequisites

- **Node.js** ≥ 18.x and **npm** ≥ 9.x
- **Python** ≥ 3.11
- A **Supabase** project ([supabase.com](https://supabase.com))
- A **Hugging Face** account with an API token ([huggingface.co](https://huggingface.co))
- A **Google Cloud** project with OAuth 2.0 credentials configured

---

### 1. Clone the Repository

```bash
git clone https://github.com/saiprasad367/AI_RESUME_BUILDER.git
cd AI_RESUME_BUILDER
```

---

### 2. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor** and run the entire contents of `supabase_schema.sql`.
3. Go to **Authentication → Providers** and enable:
   - **Email** (enabled by default)
   - **Google** — add your Google OAuth Client ID and Client Secret
4. Under **Authentication → URL Configuration**, set:
   - Site URL: `http://localhost:5173`
   - Redirect URLs: `http://localhost:5173/**`

---

### 3. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services → Credentials**.
2. Create an **OAuth 2.0 Client ID** (Web application type).
3. Add Authorized Redirect URI:
   ```
   https://<your-supabase-project-ref>.supabase.co/auth/v1/callback
   ```
4. Copy the **Client ID** and **Client Secret** into your Supabase Google provider settings.

---

### 4. Backend Setup

```bash
cd resume-ai-backend

# Create and activate virtual environment
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

Create your `.env` file:

```bash
cp .env.example .env
```

Edit `resume-ai-backend/.env` and fill in all values:

```env
# ─── Supabase ───────────────────────────────────────────────
SUPABASE_URL=https://<your-project-ref>.supabase.co
SUPABASE_SERVICE_KEY=<your-service-role-key>      # Settings → API → service_role (secret)
SUPABASE_ANON_KEY=<your-anon-public-key>          # Settings → API → anon / public

# ─── Hugging Face ───────────────────────────────────────────
HF_API_TOKEN=hf_<your-huggingface-api-token>      # huggingface.co → Settings → Tokens

# ─── CORS ───────────────────────────────────────────────────
FRONTEND_URL=http://localhost:5173
```

Start the backend server:

```bash
uvicorn main:app --reload --port 8000
```

Backend will be live at: `http://localhost:8000`
API docs at: `http://localhost:8000/docs`

---

### 5. Frontend Setup

```bash
cd career-navigator

# Install dependencies
npm install
```

Create your frontend `.env` file:

```bash
# career-navigator/.env
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-public-key>
VITE_API_BASE_URL=http://localhost:8000
```

Start the development server:

```bash
npm run dev
```

Frontend will be live at: `http://localhost:5173`

---

### 6. Full Environment Variable Reference

#### Backend (`resume-ai-backend/.env`)

| Variable | Description | Where to Find |
|---|---|---|
| `SUPABASE_URL` | Your Supabase project URL | Supabase → Settings → API |
| `SUPABASE_SERVICE_KEY` | Service role secret key (server-only) | Supabase → Settings → API → `service_role` |
| `SUPABASE_ANON_KEY` | Public anon key | Supabase → Settings → API → `anon` |
| `HF_API_TOKEN` | Hugging Face API token | huggingface.co → Settings → Access Tokens |
| `FRONTEND_URL` | Frontend origin for CORS | Default: `http://localhost:5173` |

#### Frontend (`career-navigator/.env`)

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Same Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Same anon/public key |
| `VITE_API_BASE_URL` | Backend API URL (default: `http://localhost:8000`) |

> ⚠️ **Never commit `.env` files.** Both `.gitignore` files are pre-configured to exclude them.

---

## 📁 Project Structure

```
AI_RESUME_BUILDER/
├── career-navigator/               # React + TypeScript Frontend
│   ├── src/
│   │   ├── routes/                 # TanStack file-based routes
│   │   │   ├── index.tsx           # Landing page
│   │   │   ├── login.tsx           # Login (Google + Email)
│   │   │   ├── _app.dashboard.tsx  # Main dashboard
│   │   │   ├── _app.resume-studio.tsx   # Resume builder & tailor
│   │   │   ├── _app.ats-analyzer.tsx    # ATS score checker
│   │   │   ├── _app.jd-analyzer.tsx     # Job description analyzer
│   │   │   ├── _app.skill-gap.tsx       # Skill gap analysis
│   │   │   ├── _app.roadmap.tsx         # Learning roadmap
│   │   │   ├── _app.career-coach.tsx    # AI career coach
│   │   │   ├── _app.interview-prep.tsx  # Interview Q&A
│   │   │   ├── _app.jobs.tsx            # Job listings
│   │   │   ├── _app.company-intel.tsx   # Company intelligence
│   │   │   ├── _app.resume-history.tsx  # Export history
│   │   │   └── _app.profile.tsx         # User profile
│   │   ├── lib/
│   │   │   ├── resume-utils.ts     # PDF, Word, Text export logic
│   │   │   └── supabase.ts         # Supabase client
│   │   └── components/             # Shared UI components
│   └── package.json
│
├── resume-ai-backend/              # Python + FastAPI Backend
│   ├── routers/
│   │   ├── resume.py               # Resume generation & tailoring
│   │   ├── coach.py                # Career coach & roadmap routes
│   │   ├── jd.py                   # JD analysis routes
│   │   └── jobs.py                 # Job search routes
│   ├── services/
│   │   ├── ats_scorer.py           # ATS scoring engine
│   │   ├── jd_analyser.py          # Job description NLP parser
│   │   ├── rl_ranker.py            # Reinforcement learning ranker
│   │   ├── profile_builder.py      # User profile compiler
│   │   ├── section_gatekeeper.py   # Resume section validator
│   │   ├── company_intel.py        # Company data scraper
│   │   ├── job_scraper.py          # Live job listing scraper
│   │   ├── hf_client.py            # Hugging Face API client
│   │   ├── template_picker.py      # Template selection logic
│   │   └── filename_generator.py   # Export filename generator
│   ├── main.py                     # FastAPI app entry point
│   ├── config.py                   # Pydantic settings
│   ├── requirements.txt
│   └── .env.example
│
├── supabase_schema.sql             # Database schema + RLS policies
└── README.md
```

---

## 🚀 Running Tests

```bash
# Backend tests
cd resume-ai-backend
python -m pytest test_services.py -v

# Frontend build validation
cd career-navigator
npm run build
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/AmazingFeature`
3. Commit your changes: `git commit -m 'Add AmazingFeature'`
4. Push to the branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 👤 Author

**Sai Prasad**
- GitHub: [@saiprasad367](https://github.com/saiprasad367)
- Email: saiprasad2523@gmail.com

---

<div align="center">
  Made with ❤️ by Sai Prasad · <a href="https://github.com/saiprasad367/AI_RESUME_BUILDER">Star this repo ⭐</a>
</div>
