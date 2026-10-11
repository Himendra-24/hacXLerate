# UNFRAME — AI Content Creator Marketplace
## Presentation Slides & Demonstration Guide (Deliverable #3)

**Competition:** Kampus.VC AI Content Creator Marketplace Challenge  
**Team / Project:** UNFRAME  
**Live Application:** Frontend: `http://localhost:5173` | Backend API: `http://127.0.0.1:8000`  
**Repository:** [https://github.com/Himendra-24/hacXLerate](https://github.com/Himendra-24/hacXLerate)  

---

## Slide 1: Title & The Core Problem

### UNFRAME — Find the Talent Behind the Vision
**The First AI-Native Marketplace Powered by Verifiable Creative Evidence**

* **The Problem:** Generative AI has spawned a new class of creative professionals (AI filmmakers, animators, CGI artists). But brands and agencies struggle to hire them:
  * Vanity visuals on traditional freelance sites do not reveal whether a creator can actually deliver a commercial brief.
  * Brands cannot verify underlying tools (Runway, Midjourney, ComfyUI, Topaz).
  * Commercial rights and licensing restrictions are ambiguous and high-risk.
  * Aspect ratios (16:9 vs 9:16) and multi-generation pipelines break down during delivery.
* **The UNFRAME Solution:** An AI-native marketplace connecting brands with creators based on **demonstrated evidence, verified workflows, and campaign-specific compatibility**.

---

## Slide 2: Core Architecture & The 4-Factor Matching Engine

### Deterministic Creative Fit Intelligence™
Unlike generic black-box matchers or keyword search, UNFRAME implements an explainable, deterministic 4-factor scoring algorithm:

$$\mathbf{Match\ Score} = (0.40 \times \text{Skills}) + (0.30 \times \text{Portfolio\ Evidence}) + (0.20 \times \text{Format\ Compatibility}) + (0.10 \times \text{Tool\ Stack})$$

1. **Skills & Specialization ($40\%$):** Mathematical overlap between brief aesthetic tags (`cinematic`, `photorealistic`, `cyberpunk`) and creator skills.
2. **Portfolio Relevance ($30\%$):** Evaluates actual uploaded deliverables matching the content type, aspect ratio, and genre.
3. **Format Compatibility ($20\%$):** Verified delivery capability across target dimensions (`16:9`, `9:16`, `1:1`) and resolutions (`4K`, `1080p`).
4. **Tool Stack Depth ($10\%$):** Evaluates demonstrated usage of generative tools (`Runway Gen-3`, `Midjourney v6`, `Topaz Video AI`, `ComfyUI`).

### 3 Independent Mandatory Gates:
* **Budget Cap Gate:** Excludes or flags creators whose rate minimum exceeds campaign budget max.
* **Commercial Rights Gate:** Evaluates specific project licensing against required commercial scope.
* **Availability Gate:** Flags creators marked as `Booked`.

---

## Slide 3: Bonus Features & Innovation Highlights

### 1. AI-Assisted Brief Builder (`/api/v1/briefs/structure`)
* Transforms rough natural language thoughts into production-ready briefs.
* **Integrity Guarantee:** Dual-engine (Gemini 1.5 Flash + Deterministic Heuristic Fallback).
* **Provenance Tracking:** Distinguishes `confirmed` (brand-stated), `suggested` (AI-inferred), and `needs_confirmation` (budget, deadline, exclusivity).

### 2. Multi-Tier Creator Verification Signals
* **Verified Capabilities:** Backed by persistent portfolio deliverables and documented multi-step prompt recipes.
* **Self-Reported Credentials:** Transparently labeled when creators list tools without project artifacts.
* **Commercial Rights Documentation:** Visible licensing status on every portfolio asset.

---

## Slide 4: End-to-End User Journey (Discovery Through Delivery)

```
[Brand Registers] ──> [Publishes Brief via AI Builder] ──> [Deterministic Matching Engine]
                                                                      │
                                                                      ▼
[Creator Delivers] <── [Direct Messaging & Pitch] <── [Shortlists Verified Creator]
        │
        ▼
[Version Revisions & Review] ──> [Commercial Handover Complete]
```

* **Dedicated Roles:** Separate Creator (`/creator/dashboard`) and Organization (`/organization/dashboard`) workspaces.
* **Authorized Direct Messaging:** Authoritative sender identity and complete participant isolation.
* **Engagement Milestones:** Versioned draft uploads (`/uploads/{uuid}.mp4`), timestamped brand feedback, and delivery approvals.

---

## Slide 5: Technical Execution & Security Verification

* **Full-Stack Stack:** React 19 + TypeScript + Vite + Tailwind CSS + FastAPI + SQLite / PostgreSQL + SQLAlchemy.
* **Enterprise Security Standards:**
  * Authoritative JWT Bearer authentication on all write endpoints.
  * Authenticated file upload pipeline with MIME validation and 50MB limits.
  * Fail-safe production JWT secrets.
  * Multi-tenant data isolation on shortlists, briefs, profiles, and messages.
* **Test Coverage:** **28/28 automated pytest unit and E2E simulation tests passing**.
* **Zero-Error Build:** Production bundle compiled cleanly via `tsc -b && vite build`.

---

## 4-Minute Live Demonstration Script for Evaluators

| Timestamp | Phase | Screen / Action | What is Proven |
| :--- | :--- | :--- | :--- |
| **0:00 – 1:00** | **Creator Verification** | Navigate to `/discover` $\to$ Click *Aria Sterling* | Show video player, verified tool badges (Runway Gen-3), 4-step workflow recipe, and commercial rights badge. |
| **1:00 – 2:00** | **AI Brief Creation** | Log into Brand Account $\to$ Open `/brief-builder` | Input: *"Cyberpunk electric supercar spec in 9:16 vertical video for Instagram"*. Click *Transform into Structured Brief*. Show auto-detected 9:16 format and *Needs Confirmation* budget flag. |
| **2:00 – 3:00** | **Explainable Matching** | Click *Find Verified Creator Matches* | Show ranked candidate cards. Highlight 4-factor scoring breakdown ($0.40K / 0.30P / 0.20F / 0.10T$). Show citation of actual project evidence. |
| **3:00 – 3:45** | **Shortlisting & Chat** | Click *+ Shortlist* $\to$ Open *Direct Message* | Send inquiry to creator. Log into creator account in second window. View and reply to message in real time. |
| **3:45 – 4:00** | **Conclusion** | Return to Dashboard | Summarize: UNFRAME replaces subjective freelance guessing with verifiable creative fit intelligence. |
