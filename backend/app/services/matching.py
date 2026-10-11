from typing import List, Dict, Any, Tuple
from app.models.models import CreatorProfile, PortfolioProject, Brief
from app.schemas.schemas import CreatorMatchResult, MatchScoreBreakdown, CreatorProfileResponse, PortfolioProjectResponse

def calculate_overlap_ratio(required_items: List[str], documented_items: List[str]) -> float:
    """
    Computes ratio of required items matched by documented items.
    If required_items is empty, returns 0.5 (neutral unconfirmed baseline).
    If documented_items is empty, returns 0.0 (missing evidence penalized).
    """
    if not documented_items:
        return 0.0
    if not required_items:
        return 0.5  # Neutral baseline when requirements are underspecified

    req_set = {item.strip().lower() for item in required_items if item.strip()}
    doc_set = {item.strip().lower() for item in documented_items if item.strip()}

    if not req_set:
        return 0.5

    intersection = req_set.intersection(doc_set)
    # Check partial substring matches (e.g. "Runway" matches "Runway Gen-3")
    for req in req_set:
        if req not in intersection:
            if any(req in doc or doc in req for doc in doc_set):
                intersection.add(req)

    return min(1.0, max(0.0, len(intersection) / len(req_set)))

def evaluate_creator_fit(
    creator: CreatorProfile,
    brief: Brief,
    required_tools: List[str] = None
) -> CreatorMatchResult:
    """
    Computes deterministic Creative Fit Intelligence matching score and explains exact evidence.

    Formula:
      score = 0.40 * skill_match + 0.30 * portfolio_relevance + 0.20 * format_compatibility + 0.10 * tool_compatibility

    Components (each strictly 0.0 - 100.0):
      1. skill_match (0.40): Overlap of brief style tags + content type with creator's demonstrated skills.
      2. portfolio_relevance (0.30): Metadata evidence from portfolio projects matching content type, specialization, and format.
      3. format_compatibility (0.20): Demonstrated capability delivering the brief's aspect ratio and content type.
      4. tool_compatibility (0.10): Overlap of required AI generative tools (or modern tool stack depth) with creator tools.

    Mandatory Constraints are evaluated independently from the weighted score:
      - Budget cap: creator.rate_min <= brief.budget_max
      - Commercial rights: verified commercial licensing on portfolio projects
      - Creator availability: creator not marked as "Booked"
    """
    if required_tools is None:
        required_tools = []

    # 1. Skill Match (0.0 - 100.0)
    brief_skills_needed = [tag.lower() for tag in (brief.style_tags or [])]
    if brief.content_type:
        brief_skills_needed.append(brief.content_type.lower())

    creator_skills = [s.lower() for s in (creator.skills or [])]
    if not creator_skills:
        skill_score = 0.0
    else:
        skill_ratio = calculate_overlap_ratio(brief_skills_needed, creator_skills)
        skill_score = min(100.0, max(0.0, skill_ratio * 100.0))

    # 2. Portfolio Relevance (0.0 - 100.0)
    # Evaluated from metadata of actual portfolio projects; 0.0 if creator has no portfolio projects
    matching_projects: List[PortfolioProject] = []
    total_relevance_points = 0.0

    if not creator.portfolio_projects or len(creator.portfolio_projects) == 0:
        portfolio_relevance_score = 0.0
    else:
        brief_styles = {t.lower() for t in (brief.style_tags or [])}
        for proj in creator.portfolio_projects:
            proj_score = 0.0
            # Content type match (up to 40 pts)
            if proj.content_type and brief.content_type and proj.content_type.lower() == brief.content_type.lower():
                proj_score += 40.0
            elif proj.specialization and brief.content_type and brief.content_type.lower() in proj.specialization.lower():
                proj_score += 25.0

            # Aspect ratio match (up to 30 pts)
            proj_ratios = [r.strip() for r in (proj.aspect_ratios or [])]
            if brief.aspect_ratio and brief.aspect_ratio in proj_ratios:
                proj_score += 30.0

            # Demonstrated skills overlap (up to 30 pts)
            proj_skills = {s.lower() for s in (proj.skills_demonstrated or [])}
            overlap = proj_skills.intersection(brief_styles)
            if overlap:
                proj_score += min(30.0, len(overlap) * 15.0)

            if proj_score >= 25.0:
                matching_projects.append(proj)
                total_relevance_points = max(total_relevance_points, proj_score)

        portfolio_relevance_score = min(100.0, max(0.0, total_relevance_points))

    # 3. Format Compatibility (0.0 - 100.0)
    has_aspect_ratio = any(
        brief.aspect_ratio in (p.aspect_ratios or [])
        for p in (creator.portfolio_projects or [])
    ) if (brief.aspect_ratio and creator.portfolio_projects) else False

    has_content_type = any(
        (p.content_type or "").lower() == (brief.content_type or "").lower()
        for p in (creator.portfolio_projects or [])
    ) if (brief.content_type and creator.portfolio_projects) else False

    if not creator.portfolio_projects or len(creator.portfolio_projects) == 0:
        format_score = 0.0
    elif has_aspect_ratio and has_content_type:
        format_score = 100.0
    elif has_aspect_ratio:
        format_score = 65.0
    elif has_content_type:
        format_score = 50.0
    else:
        format_score = 15.0

    # 4. Tool Compatibility (0.0 - 100.0)
    creator_tools = [t.lower() for t in (creator.tools or [])]
    if not creator_tools:
        tool_score = 0.0
    elif required_tools:
        tool_ratio = calculate_overlap_ratio(required_tools, creator_tools)
        tool_score = min(100.0, max(0.0, tool_ratio * 100.0))
    else:
        # Standard AI generative stack coverage (Runway, Midjourney, Topaz, ComfyUI, etc.)
        tool_score = min(100.0, max(10.0, len(creator_tools) * 20.0))

    # Composite Score calculation
    composite_score = round(
        min(100.0, max(0.0,
            (0.40 * skill_score) +
            (0.30 * portfolio_relevance_score) +
            (0.20 * format_score) +
            (0.10 * tool_score)
        )),
        1
    )

    # Mandatory Requirements Evaluation
    mandatory_violations: List[str] = []
    
    # 1. Budget constraint check
    if brief.budget_max is not None and creator.rate_min is not None:
        if creator.rate_min > brief.budget_max:
            mandatory_violations.append(
                f"Rate minimum (${int(creator.rate_min)}) exceeds campaign budget cap (${int(brief.budget_max)})"
            )

    # 2. Commercial rights check
    # Check if creator has verified or confirmed commercial use in relevant projects
    unconfirmed_commercial = False
    commercial_granted_projects = [
        p for p in creator.portfolio_projects
        if "granted" in p.commercial_use_status.lower()
    ]
    if not commercial_granted_projects:
        unconfirmed_commercial = True
        mandatory_violations.append("Commercial rights require explicit confirmation before contract execution.")

    # 3. Availability check
    if creator.availability_status == "Booked":
        mandatory_violations.append("Creator is currently booked and unavailable for new campaigns.")

    mandatory_passed = len(mandatory_violations) == 0

    # Evidence & Explanations Generation based strictly on stored data
    explanations: List[str] = []
    missing_items: List[str] = []

    # Positive matches
    if skill_score >= 60:
        matching_skills = [s for s in (creator.skills or []) if any(t in s.lower() for t in brief_skills_needed)]
        if matching_skills:
            explanations.append(f"Strong skill alignment in: {', '.join(matching_skills[:3])}")
    
    if matching_projects:
        explanations.append(f"Documented portfolio proof in {len(matching_projects)} project(s) matching '{brief.content_type}' and {brief.aspect_ratio}")
    
    if has_aspect_ratio:
        explanations.append(f"Demonstrated production experience in target aspect ratio {brief.aspect_ratio}")

    # Missing / Uncertain Requirements
    if not has_aspect_ratio:
        missing_items.append(f"No portfolio projects demonstrating target aspect ratio {brief.aspect_ratio}")
    
    if not has_content_type:
        missing_items.append(f"Limited documented evidence for content type '{brief.content_type}'")

    unmatched_skills = [tag for tag in (brief.style_tags or []) if not any(tag.lower() in s.lower() for s in (creator.skills or []))]
    if unmatched_skills:
        missing_items.append(f"Uncertain experience in style keywords: {', '.join(unmatched_skills[:2])}")

    # Commercial rights summary
    if commercial_granted_projects:
        commercial_summary = f"Commercial rights documented on {len(commercial_granted_projects)} portfolio project(s)."
    else:
        commercial_summary = "Commercial use status is unconfirmed for this creator's workflow."

    # Verification tier
    verified_records = [v for v in (creator.verification_records or []) if v.status == "Verified"]
    demo_records = [v for v in (creator.verification_records or []) if v.demo_only]
    
    if verified_records and not demo_records:
        verification_tier = "Verified Capabilities"
    elif demo_records:
        verification_tier = "Demo-Only Verified Sandbox"
    else:
        verification_tier = "Self-Reported Credentials"

    breakdown = MatchScoreBreakdown(
        overall_score=composite_score,
        skill_match=round(skill_score, 1),
        portfolio_relevance=round(portfolio_relevance_score, 1),
        format_compatibility=round(format_score, 1),
        tool_compatibility=round(tool_score, 1),
        mandatory_passed=mandatory_passed,
        mandatory_violations=mandatory_violations
    )

    creator_schema = CreatorProfileResponse.model_validate(creator)
    supporting_schemas = [PortfolioProjectResponse.model_validate(p) for p in (matching_projects[:3] if matching_projects else creator.portfolio_projects[:2])]

    return CreatorMatchResult(
        creator=creator_schema,
        score=composite_score,
        breakdown=breakdown,
        supporting_portfolio_items=supporting_schemas,
        match_explanations=explanations if explanations else ["Baseline portfolio and AI tool capability matched."],
        missing_or_uncertain_requirements=missing_items,
        commercial_rights_summary=commercial_summary,
        verification_tier=verification_tier
    )
