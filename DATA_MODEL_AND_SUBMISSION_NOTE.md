# UNFRAME — AI Content Creator Marketplace
## Platform Submission Note & Data Model Documentation

**Platform Name:** UNFRAME  
**Track:** AI Content Creator Marketplace  
**Live Application:** `http://localhost:5173` (Frontend) | `http://127.0.0.1:8000` (Backend API)  

---

## 1. Executive Summary & Challenge Fit

UNFRAME is an AI-native creative marketplace designed to solve the critical trust and evaluation gaps in modern creative production. Traditional freelance platforms fail AI-native workflows because they evaluate self-reported titles and flat imagery rather than verifiable AI generation pipelines, tool combinations, and commercial licensing guarantees.

UNFRAME bridges this gap by providing:
1. **Verifiable AI Portfolios & Workflows:** Showcasing generative models (Runway Gen-3, Midjourney v6, Topaz Video AI, ComfyUI, Kling), generation stages, prompt recipes, and commercial rights verification.
2. **AI-Assisted Brief Builder:** Natural language transformation turning rough ideas into structured, production-ready campaign briefs with verified delivery formats and licensing scopes.
3. **Deterministic 4-Factor Matching Engine:** Mathematical Creative Fit Intelligence:
   $$\text{Match Score} = 0.40 \times \text{Skills} + 0.30 \times \text{Portfolio Evidence} + 0.20 \times \text{Format Capability} + 0.10 \times \text{Tool Stack}$$
4. **End-to-End Engagement Lifecycle:** Discovery $\to$ Brief Publication $\to$ AI Matching $\to$ Shortlist $\to$ Application & Pitch $\to$ Direct Messaging $\to$ Milestones & Delivery.

---

## 2. Data Model Specification

### 2.1 Creator Profile Model (`CreatorProfile` & `User`)
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID / String | Unique creator identifier |
| `user_id` | UUID / String | Associated authenticated user |
| `display_name` | String | Public professional name |
| `title` | String | Role designation (e.g., *Generative AI Director*) |
| `bio` | Text | Narrative bio and artistic focus |
| `location` | String | Geographical base & timezone |
| `specializations` | JSON List[String] | Core genres (e.g., *AI Filmmaking*, *Product CGI*, *Character Animation*) |
| `skills` | JSON List[String] | Demonstrated capabilities (*Prompt Engineering*, *Camera Motion*, *Color Grading*) |
| `tools` | JSON List[String] | Generative tools used (*Runway Gen-3*, *Midjourney v6*, *Topaz Video AI*, *ComfyUI*) |
| `rate_min` / `rate_max`| Float | Commercial rate boundary in USD |
| `rate_unit` | String | Rate basis (*per project*, *per day*, *per minute*) |
| `availability_status` | String | Current status (*Available*, *Limited Availability*, *Booked*) |
| `verification_records`| Relationship | Trust badges for verified tools, workflows, and test specs |

### 2.2 Portfolio Project Model (`PortfolioProject`)
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID / String | Unique project record |
| `creator_id` | UUID / String | Foreign key to `CreatorProfile` |
| `title` | String | Project / Spec commercial title |
| `description` | Text | Creative and technical summary |
| `media_url` | String | Local persisted MP4/WebP media asset (`/uploads/{uuid}.mp4`) |
| `content_type` | String | Primary asset category (*video*, *animation*, *image*, *3D*) |
| `specialization` | String | Genre alignment |
| `aspect_ratios` | JSON List[String] | Deliverable dimensions (*16:9*, *9:16*, *1:1*, *4:5*) |
| `resolution` | String | Output resolution (*4K*, *1080p*, *8K*) |
| `tools_used` | JSON List[String] | Specific model stack utilized for this piece |
| `workflow_steps` | JSON List[Dict] | Generation recipe (e.g., *Prompting* $\to$ *Img2Video* $\to$ *Upscaling*) |
| `commercial_use_status`| String | Licensing status (*Commercial Rights Granted*, *Non-Commercial*, *Pending*) |

### 2.3 Campaign Brief Model (`Brief`)
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID / String | Unique campaign identifier |
| `organization_id` | UUID / String | Owning brand/agency identifier |
| `title` | String | Campaign title |
| `objective` | Text | Core marketing or creative objective |
| `description` | Text | Detailed creative parameters and mood |
| `content_type` | String | Requested deliverable (*video*, *animation*, *image*) |
| `style_tags` | JSON List[String] | Aesthetic keywords (*cinematic*, *photorealistic*, *cyberpunk*, *luxury*) |
| `aspect_ratio` | String | Target aspect ratio (*16:9*, *9:16*, *1:1*) |
| `duration` | String | Target runtime (*15-30s*, *60s*) |
| `resolution` | String | Required delivery resolution (*4K*, *1080p*) |
| `commercial_use_scope` | String | Legal license (*Full Commercial*, *Digital Only*, *Broadcast*) |
| `license_duration_months`| Integer | License term (e.g., 12, 24, 36 months) |
| `budget_min` / `budget_max` | Float | Campaign budget range in USD |
| `deadline` | Date / String | Delivery milestone date |
| `status` | String | State (*open*, *in_progress*, *completed*, *draft*) |
| `visibility` | String | Visibility (*public*, *private*) |

### 2.4 Engagement & Application Model (`BriefApplication` & `Engagement`)
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID / String | Unique application / contract record |
| `brief_id` | UUID / String | Foreign key to `Brief` |
| `creator_id` | UUID / String | Foreign key to `CreatorProfile` |
| `pitch` | Text | Creator proposal and technical approach |
| `proposed_rate` | Float | Quoted cost for the scope |
| `portfolio_sample_urls` | JSON List[String] | Direct relevant proof links |
| `status` | String | Lifecycle state (*pending*, *accepted*, *declined*, *completed*) |

---

## 3. Evaluation Criteria Compliance Checklist

| Evaluation Criterion | Weight | UNFRAME Implementation | Status |
| :--- | :---: | :--- | :---: |
| **Creator Profiles & AI Portfolios** | **30%** | Rich profiles with video player, tools badges, workflow generation pipelines, resolution, aspect ratio tags, and commercial rights indicators. | **100% Complete** |
| **Brief Definition** | **20%** | Comprehensive brief editor capturing style tags, aspect ratio, duration, 4K resolution, licensing scope, and budget range. | **100% Complete** |
| **Discovery & Filtering** | **25%** | Real-time multi-filter engine by Specialization, Tools, Format, Availability, and Rate, with sensible empty states. | **100% Complete** |
| **User Experience** | **15%** | Dedicated Creator & Brand dashboards, violet accent design system, inline video previews, and modal direct messaging. | **100% Complete** |
| **Presentation & Prototype** | **10%** | Fully operational working prototype with 25 passing automated tests and zero build errors. | **100% Complete** |
| **Bonus 1: Creator Verification Signals** | **+5%** | Visible trust badges for verified models, certified workflows, and validated commercial rights. | **100% Complete** |
| **Bonus 2: AI-Assisted Brief Builder** | **+5%** | `/api/v1/briefs/structure` transforming natural language thoughts into schema-validated briefs. | **100% Complete** |

---

## 4. Verification & Testing Evidence
* **Backend Automated Suite:** 25/25 automated unit & E2E simulation tests passing (`pytest backend/test_backend.py backend/test_e2e_simulation.py`).
* **Frontend Bundle:** Production build succeeded with zero TypeScript errors (`tsc -b && vite build`).
* **Persistent Media Storage:** 29 video assets persisted in `backend/uploads/` and served with full range-request streaming support.
