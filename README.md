# Cre8Match AI — The Right Creative. The Right Proof. The Right Match.

> **Kampus.VC AI Content Creator Marketplace Hackathon MVP**  
> **Core Differentiator:** Job-to-Evidence Matching via *Creative Fit Intelligence™*

---

## 🚀 Live Services
- **Frontend App:** [http://localhost:5173](http://localhost:5173) (Vite + React 19 + TypeScript + Tailwind CSS)
- **FastAPI REST API:** [http://127.0.0.1:8000](http://127.0.0.1:8000)
- **Interactive Swagger Docs:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

## 🎯 The Product Thesis
Brands seeking AI-generated content face a major challenge: **Visual appearance alone does not reveal whether a creator has the technical workflow, aspect ratio experience, or commercial licensing clarity needed to deliver.**

**Cre8Match AI** solves this by:
1. Converting rough campaign thoughts into structured, verified briefs.
2. Comparing brief requirements against documented creator skills and portfolio evidence.
3. Ranking candidates using an explainable 4-factor compatibility formula with hard mandatory requirement gating.
4. Transparently presenting *why* candidates matched, the exact portfolio proof, missing requirements, and licensing caveats.

---

## ⚡ Key Features

| Category | Features |
|---|---|
| **AI Brief Builder** | Converts unstructured prompts into structured briefs with content type, aspect ratio, duration, resolution, style tags, and "Needs Confirmation" flags for legal/budget integrity. |
| **Creative Fit Intelligence** | Deterministic 4-factor scoring: `0.40 * skill_match + 0.30 * portfolio_relevance + 0.20 * format_compatibility + 0.10 * tool_compatibility`. |
| **Mandatory Gating** | Hard exclusions/warnings for budget caps, creator availability, and commercial rights confirmation. |
| **Workflow Recipes** | Multi-step recipes documenting exact production pipelines (Concept → Prompting → Diffusion Synthesis → Upscaling → Editorial Grade). |
| **Evidence & Trust** | Multi-tier evidence verification badges (Verified Capabilities, Demo Sandbox, Self-Reported). |
| **Engagement Lifecycle** | Full iteration log (`invited` → `in_progress` → `revision_requested` → `approved` → `delivered`) with versioned deliverables and recorded commercial terms. |

---

## 🛠 Tech Stack
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Lucide React, React Router v7
- **Backend:** FastAPI, Python 3.12, SQLAlchemy, Pydantic v2, Uvicorn, HTTPX
- **Database:** SQLite (zero-config local setup) / PostgreSQL compatible
- **Testing:** Pytest, HTTPX integration test suite

---

## ⏱ 4-Minute Demo Script

| Time | Flow | What to Show |
|---|---|---|
| **0:00 – 0:35** | **Creator Portfolios & Workflow Recipes** | Open Elena Rostova's profile. Show verified tool stack (`Runway Gen-3`, `Midjourney v6`, `Topaz Video AI 4`), aspect ratios, and the 5-step production recipe. |
| **0:35 – 1:15** | **AI Creative Brief Builder** | Enter rough idea in the Hero or Brief Builder. Observe instant draft structuring, auto-detected 16:9 format, and "Needs Confirmation" flags on budget and legal terms. |
| **1:15 – 2:15** | **Creative Fit Intelligence Engine** | Click *Find Verified Creator Matches*. Show ranked scores (e.g. Elena 88/100), the 4-factor breakdown bars, documented fit drivers, and commercial rights summary. |
| **2:15 – 2:35** | **Mandatory Filtering & Empty States** | Toggle "Hide candidates failing mandatory requirements". Show how booked/over-budget creators are flagged. Test search filters to see actionable empty states. |
| **2:35 – 3:25** | **Shortlist, Invitation & Revisions** | Shortlist creator, send structured invitation, view Engagement Hub. Review Version 1 draft, leave brand revision notes, upload Version 2, approve, and view final delivery summary. |
| **3:25 – 4:00** | **Creative Fit Differentiator Recap** | Summarize the core value: connecting briefs with verifiable evidence of creator capabilities rather than vanity visuals. |

---

## 🧪 Automated Testing
Run the backend test suite:
```bash
python -m pytest backend/test_backend.py -v
```
All 7 tests pass:
- `test_health`
- `test_seeded_creators_count`
- `test_creator_filters`
- `test_brief_structure_endpoint`
- `test_deterministic_matching_engine`
- `test_mandatory_violations_flagging`
- `test_shortlist_lifecycle`

---

## 📦 Running Locally

### 1. Backend
```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```
Visit `http://localhost:5173`.
