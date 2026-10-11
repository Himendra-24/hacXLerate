# UNFRAME — AI Content Creator Marketplace
> **Official Submission for the Kampus.VC AI Content Creator Marketplace Challenge**  
> *Core Innovation: Evidence-Based Creative Fit Intelligence™ & Verifiable Generative Workflows*

[![Build Status](https://img.shields.io/badge/Frontend%20Build-Passing%20(Vite%20%2B%20TypeScript)-7C3AED)](http://localhost:5173)
[![Test Suite](https://img.shields.io/badge/Backend%20Tests-28%2F28%20Passed-10B981)](http://127.0.0.1:8000/docs)
[![License](https://img.shields.io/badge/Security-Authoritative%20RBAC%20%26%20JWT-6366F1)](http://127.0.0.1:8000)

---

## 📌 Executive Summary & Challenge Alignment

Generative AI tools (Runway Gen-3, Midjourney v6, Topaz Video AI, ComfyUI, Kling) have created a new category of creative professionals: AI filmmakers, AI animators, and generative VFX directors. However, brands and creative agencies face acute friction when hiring them:
1. **Vanity Visuals vs. Production Evidence:** Existing freelance marketplaces rely on flat imagery and unverified titles, unable to establish whether a creator has the generative pipeline needed to deliver.
2. **Ambiguous Tool & Workflow Stacks:** Brands cannot evaluate the models or multi-generation recipes behind generated content.
3. **Commercial Licensing Uncertainty:** Licensing and rights scopes (e.g. Full Commercial vs. Personal) are rarely documented per asset.
4. **Format Breakdown:** Missing capability to guarantee deliverable specifications (aspect ratios: 16:9, 9:16; resolutions: 4K, 1080p).

**UNFRAME** solves this by matching campaign briefs against **documented creator skills, verified AI tools, production workflow recipes, and persistent portfolio evidence**.

---

## 🏆 Evaluation Criteria Compliance (100 Points + Bonus)

| Criterion | Weight | UNFRAME Implementation & Verified Evidence | Deliverable Location |
| :--- | :---: | :--- | :--- |
| **1. Creator Profiles & AI Portfolios** | **30%** | Rich creator profiles with custom video players, documented AI models used, specializations, prompt recipes, generation stages, and commercial licensing tags. | [`CreatorProfilePage.tsx`](frontend/src/pages/CreatorProfilePage.tsx)<br>[`CreatorDashboardPage.tsx`](frontend/src/pages/CreatorDashboardPage.tsx) |
| **2. Brief Definition** | **20%** | Structured campaign brief builder capturing content type, style tags, target aspect ratio (16:9, 9:16, 1:1), 4K resolution, commercial-use scope, budget boundaries, and delivery deadline. | [`BriefBuilderPage.tsx`](frontend/src/pages/BriefBuilderPage.tsx)<br>[`BriefForm.tsx`](frontend/src/components/briefs/BriefForm.tsx) |
| **3. Discovery & Filtering** | **25%** | Real-time multi-attribute search and filtering across Specializations, Generative Tools, Content Types, Aspect Ratios, Rate Range, and Availability with sensible empty states. | [`DiscoverPage.tsx`](frontend/src/pages/DiscoverPage.tsx)<br>[`creators.py`](backend/app/api/creators.py) |
| **4. User Experience** | **15%** | Dedicated role-segregated Creator (`/creator/dashboard`) and Brand (`/organization/dashboard`) portals, violet accent design tokens (`#7C3AED`), inline video players, and direct messaging. | [`Navbar.tsx`](frontend/src/components/layout/Navbar.tsx)<br>[`ProtectedRoute.tsx`](frontend/src/components/auth/ProtectedRoute.tsx) |
| **5. Presentation & Working Prototype** | **10%** | Zero-mock working full-stack prototype with 28 automated tests and live browser execution. | [`test_backend.py`](backend/test_backend.py)<br>[`test_e2e_simulation.py`](backend/test_e2e_simulation.py) |
| **BONUS: Creator Verification Signals** | **+5%** | Visible trust tiers (*Verified Capabilities* vs. *Self-Reported Credentials*) backed by verified tools and workflow recipes. | [`VerificationBadge.tsx`](frontend/src/components/ui/VerificationBadge.tsx) |
| **BONUS: AI-Assisted Brief Builder** | **+5%** | Dual-engine natural language idea structurer (Gemini 1.5 Flash + Heuristic Fallback) with explicit field provenance (`confirmed`, `suggested`, `needs_confirmation`). | [`brief_builder.py`](backend/app/services/brief_builder.py) |

---

## 📦 Challenge Deliverables Directory

1. **Working Prototype:**
   * Frontend: `http://localhost:5173`
   * Backend REST API: `http://127.0.0.1:8000` (Swagger UI: `http://127.0.0.1:8000/docs`)
2. **Data Model Documentation (Deliverable #2):**
   * Detailed specification of `CreatorProfile`, `PortfolioProject`, `Brief`, `Engagement`, `Review`, and `AssetUpload` in [DATA_MODEL_AND_SUBMISSION_NOTE.md](DATA_MODEL_AND_SUBMISSION_NOTE.md).
3. **Presentation Slides & Demo Walkthrough (Deliverable #3):**
   * Slide deck structure and 4-minute judge demo script in [PRESENTATION_SLIDES_AND_DEMO.md](PRESENTATION_SLIDES_AND_DEMO.md).

---

## 🧠 Creative Fit Intelligence™ Matching Formula

UNFRAME evaluates candidates using a deterministic, transparent formula:

$$\mathbf{Match\ Score} = (0.40 \times \text{Skills}) + (0.30 \times \text{Portfolio\ Evidence}) + (0.20 \times \text{Format\ Compatibility}) + (0.10 \times \text{Tool\ Stack})$$

### 3 Mandatory Constraint Gates
* **Budget Cap Gate:** Excludes or flags creators whose minimum rate exceeds campaign budget max.
* **Campaign-Specific Commercial Rights Gate:** Validates licensing on the specific projects matching the campaign deliverable.
* **Availability Gate:** Disqualifies or flags creators marked as `Booked`.

---

## 🔒 Security & Data Isolation Architecture

* **Role-Based Access Control (RBAC):** Backend authoritative role checks (`require_role(["creator"])` vs `require_role(["brand"])`).
* **Authenticated Uploads:** Secure upload endpoint derives identity from JWT claims; validates file MIME types; enforces 50MB limits; authorizes creator/organization resource ownership.
* **Message Thread Isolation:** Users can only query and post in threads they participate in.
* **Production Secret Protection:** Application halts on startup if `JWT_SECRET_KEY` is missing in production.

---

## 🧪 Automated Testing (28/28 Tests Passing)

Run the full automated test suite:
```bash
pytest backend/test_backend.py backend/test_e2e_simulation.py -v
```

### Passing Test Suites:
* `test_health` & `test_seeded_creators_count`
* `test_creator_filters` (Specializations, Tools, Content Types)
* `test_brief_structure_endpoint` & `test_brief_builder_field_provenance`
* `test_deterministic_matching_engine` & `test_mandatory_violations_flagging`
* `test_shortlist_lifecycle` & `test_public_cannot_see_draft_briefs`
* `test_auth_creator_registration_and_login` & `test_auth_brand_registration_and_login`
* `test_ownership_checks_on_brief_mutation` & `test_ownership_checks_on_organization_mutation`
* `test_asset_upload` & `test_upload_resource_authorization` (401 unauth & 403 spoofing)
* `test_messages_threads_and_sending` & `test_messaging_authorization_boundaries`
* `test_full_creator_organization_e2e_workflow_and_security` (10-stage simulation)

---

## 💻 Quick Start & Local Execution

### 1. Backend Service
```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### 2. Frontend Application
```bash
cd frontend
npm install
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.
