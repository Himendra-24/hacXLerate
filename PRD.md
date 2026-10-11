# UNFRAME — Product Requirements Document (PRD)

**Tagline:** Find the talent behind the vision.  
**Platform:** Kampus.VC AI Content Creator Marketplace  
**Core Differentiator:** Job-to-Evidence Matching (Creative Fit Intelligence)

---

## 1. Executive Summary & Problem Thesis
Brands seeking AI-generated content face a paradox: AI portfolios are visually dazzling, but visual appearance alone does not reveal whether a creator:
1. Actually possessed the workflow, prompting, compositing, and editing rigor needed for commercial delivery.
2. Mastered specific aspect ratios (9:16 vertical reels vs 16:9 cinematic vs 1:1 ads), target resolutions (4K upscaled), or audio-visual sync.
3. Has verified commercial-use rights, model licensing clarity, or unencumbered asset provenance.
4. Matches the exact technical and stylistic needs of an ambiguous, evolving brand brief.

**UNFRAME** solves this by converting rough ideas into structured creative briefs, comparing them against verified creator skills and portfolio evidence, ranking candidates via explainable multi-factor scoring, and transparently highlighting fit, missing requirements, and licensing gaps.

---

## 2. Key Personas & Journeys
- **Brand / Agency Marketer:**
  - Enters rough campaign vision.
  - Reviews AI-assisted structured brief draft (objectives, formats, commercial rights, budget, style tags).
  - Flags & confirms unpopulated mandatory terms ("Needs confirmation").
  - Matches against creator pool with explainable breakdown (Skills, Portfolio, Formats, Tools).
  - Shortlists, invites, reviews versions, requests revisions, and manages delivery.
- **AI Content Creator:**
  - Manages Creator Studio profile (bio, rates, availability).
  - Publishes projects with full workflow recipes (e.g., Midjourney -> Runway Gen-3 -> Topaz -> Premiere).
  - Documents evidence status (Self-reported, Evidence submitted, Pending review, Verified, Demo-only).
  - Receives brief invitations, submits revision deliverables, and tracks delivery status.

---

## 3. Core Feature Specification
1. **Homepage:**
   - Cinematic editorial hero with clear positioning.
   - Category strip (AI Filmmaking, Product CGI, Motion Design, AI Ad Creative, Animation).
   - "Proof behind the process" workflow recipe showcase.
   - Interactive brief builder launcher and creator showcase.
2. **AI Creative Brief Builder:**
   - Dual-input: rough unstructured text idea or manual structured creation.
   - Structured schema: Objective, content type, style/mood, aspect ratios, duration, commercial scope, license duration, exclusivity, budget range, deadline.
   - Clear distinction between confirmed data and "Needs confirmation" suggestions.
3. **Creative Fit Intelligence (Matching Engine):**
   - Configurable formula: `0.40 * skill_match + 0.30 * portfolio_relevance + 0.20 * format_compatibility + 0.10 * tool_compatibility`.
   - Hard gating for mandatory requirements (e.g., Commercial rights required, exact aspect ratio, hard budget).
   - Explainable cards: Why they matched, exact portfolio proof, missing/warning criteria.
4. **Creator Discovery & Portfolios:**
   - Full-text and multi-faceted search (tools, skills, formats, specializations, verification).
   - Transparent workflow recipes (Concept -> Prompting -> Generation -> Compositing -> Editing).
   - Multi-tier evidence badges (Self-reported vs Verified vs Demo).
5. **Engagement & Delivery Lifecycle:**
   - Lifecycle: `invited` -> `in_progress` -> `revision_requested` -> `approved` -> `delivered`.
   - Iteration log with submission versions, creator notes, and brand feedback.
   - Delivery summary displaying finalized deliverables & commercial terms overview.
