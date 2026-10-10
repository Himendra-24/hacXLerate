from typing import List, Dict, Any, Tuple
from app.models.models import CreatorProfile, PortfolioProject, Brief
from app.schemas.schemas import CreatorMatchResult, MatchScoreBreakdown, CreatorProfileResponse, PortfolioProjectResponse

def calculate_overlap_ratio(required_items: List[str], documented_items: List[str]) -> float:
    if not required_items:
        return 1.0  # If no specific requirement, neutral full pass
    if not documented_items:
        return 0.0

    req_set = {item.strip().lower() for item in required_items if item.strip()}
    doc_set = {item.strip().lower() for item in documented_items if item.strip()}

    if not req_set:
        return 1.0

    intersection = req_set.intersection(doc_set)
    # Check partial substring matches as well (e.g. "Runway" matches "Runway Gen-3")
    for req in req_set:
        if req not in intersection:
            if any(req in doc or doc in req for doc in doc_set):
                intersection.add(req)

    return len(intersection) / len(req_set)

def evaluate_creator_fit(
    creator: CreatorProfile,
    brief: Brief,
    required_tools: List[str] = None
) -> CreatorMatchResult:
    """
    Computes deterministic Creative Fit Intelligence matching score and explains exact evidence.
    Score formula:
    score = 0.40 * skill_match + 0.30 * portfolio_relevance + 0.20 * format_compatibility + 0.10 * tool_compatibility
    """
    if required_tools is None:
        required_tools = []

    # 1. Skill Match (0 - 100)
    # Combine brief style tags + content type as required creative competencies
    brief_skills_needed = [tag.lower() for tag in (brief.style_tags or [])]
    if brief.content_type:
        brief_skills_needed.append(brief.content_type.lower())

    creator_skills = [s.lower() for s in (creator.skills or [])]
    skill_ratio = calculate_overlap_ratio(brief_skills_needed, creator_skills)
    skill_score = min(100.0, max(0.0, skill_ratio * 100.0))

    # 2. Portfolio Relevance (0 - 100)
    # Check if creator has projects matching brief content_type, specialization, or style tags
    matching_projects: List[PortfolioProject] = []
    total_relevance_points = 0.0

    brief_text = f"{brief.title} {brief.objective} {brief.description}".lower()
    brief_styles = {t.lower() for t in (brief.style_tags or [])}

    for proj in creator.portfolio_projects:
        proj_score = 0
        # Check content type match
        if proj.content_type.lower() == brief.content_type.lower():
            proj_score += 40
        elif brief.content_type.lower() in proj.specialization.lower():
            proj_score += 30

        # Check aspect ratio match
        proj_ratios = [r.strip() for r in (proj.aspect_ratios or [])]
        if brief.aspect_ratio in proj_ratios:
            proj_score += 30

        # Check skill/tool relevance
        proj_skills = {s.lower() for s in (proj.skills_demonstrated or [])}
        overlap = proj_skills.intersection(brief_styles)
        if overlap:
            proj_score += min(30, len(overlap) * 15)

        if proj_score >= 30:
            matching_projects.append(proj)
            total_relevance_points = max(total_relevance_points, float(proj_score))

    portfolio_relevance_score = min(100.0, total_relevance_points)

    # 3. Format Compatibility (0 - 100)
    # Check aspect ratio + content type presence across all creator projects
    has_aspect_ratio = any(
        brief.aspect_ratio in (p.aspect_ratios or [])
        for p in creator.portfolio_projects
    )
    has_content_type = any(
        p.content_type.lower() == brief.content_type.lower()
        for p in creator.portfolio_projects
    )

    format_score = 0.0
    if has_aspect_ratio and has_content_type:
        format_score = 100.0
    elif has_aspect_ratio or has_content_type:
        format_score = 60.0
    else:
        format_score = 25.0

    # 4. Tool Compatibility (0 - 100)
    creator_tools = [t.lower() for t in (creator.tools or [])]
    if required_tools:
        tool_ratio = calculate_overlap_ratio(required_tools, creator_tools)
        tool_score = tool_ratio * 100.0
    else:
        # If no specific tools required, assess based on tool count and modern AI stack presence
        tool_score = min(100.0, len(creator_tools) * 15.0)

    # Composite Score
    composite_score = round(
        (0.40 * skill_score) +
        (0.30 * portfolio_relevance_score) +
        (0.20 * format_score) +
        (0.10 * tool_score),
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
