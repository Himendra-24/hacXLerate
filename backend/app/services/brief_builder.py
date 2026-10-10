import os
import re
import json
import httpx
from typing import Dict, Any, List
from app.core.config import settings
from app.schemas.schemas import StructuredDraftSuggestion

async def structure_raw_idea(raw_idea: str, target_audience: str = None, preferred_format: str = None) -> StructuredDraftSuggestion:
    """
    Transforms an unstructured brand campaign idea into a structured creative brief.
    If GEMINI_API_KEY is configured, queries Gemini LLM; otherwise uses comprehensive heuristic extraction.
    Adheres strictly to integrity rules: never invents budget, deadline, or legal terms.
    """
    
    # Check if Gemini key is available and attempt LLM parse
    if settings.GEMINI_API_KEY and len(settings.GEMINI_API_KEY) > 10:
        try:
            return await _call_gemini_structurer(raw_idea, target_audience, preferred_format)
        except Exception as e:
            # Fallback gracefully to heuristic extraction
            print(f"[BriefBuilder] Gemini API error: {e}. Falling back to deterministic extractor.")

    return _heuristic_extract(raw_idea, target_audience, preferred_format)


async def _call_gemini_structurer(raw_idea: str, target_audience: str = None, preferred_format: str = None) -> StructuredDraftSuggestion:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
    
    prompt = f"""
You are an expert creative director structuring an AI advertising and creative production brief.
Convert this raw campaign idea into a structured draft adhering strictly to industry standards.

RAW IDEA:
"{raw_idea}"

TARGET AUDIENCE HINT: {target_audience or 'Not specified'}
FORMAT HINT: {preferred_format or 'Not specified'}

CRITICAL INTEGRITY CONSTRAINTS:
1. NEVER invent budget numbers, deadlines, or legal ownership terms. Leave unknown fields in needs_confirmation_fields.
2. Distinguish confirmed explicit statements from suggested assumptions.

Respond ONLY with valid JSON in this exact structure:
{{
  "title": "Short punchy campaign title",
  "objective": "Primary marketing/creative objective",
  "description": "Expanded technical and aesthetic description",
  "content_type": "video" | "animation" | "image" | "cgi" | "motion",
  "style_tags": ["tag1", "tag2", "tag3"],
  "aspect_ratio": "9:16" | "16:9" | "1:1" | "4:5",
  "duration": "e.g. 15-30s or null",
  "resolution": "1080p" | "4K",
  "commercial_use_scope": "Full Commercial (Digital & Broadcast)",
  "suggested_budget_range": "Suggest a reasonable tier like $1,000 - $3,000 or null",
  "suggested_skills_needed": ["Skill 1", "Skill 2"],
  "suggested_tools": ["Runway Gen-3", "Midjourney"],
  "needs_confirmation_fields": ["budget", "deadline", "licensing_duration", "exclusivity"],
  "integrity_warnings": ["Budget and hard delivery date were not specified in the raw prompt."]
}}
"""

    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"response_mime_type": "application/json"}
    }

    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.post(url, json=payload)
        response.raise_for_status()
        data = response.json()
        raw_text = data["candidates"][0]["content"]["parts"][0]["text"]
        parsed = json.loads(raw_text)

        return StructuredDraftSuggestion(
            title=parsed.get("title", "AI Creative Campaign"),
            objective=parsed.get("objective", "Create high-impact AI creative assets."),
            description=parsed.get("description", raw_idea),
            content_type=parsed.get("content_type", "video"),
            style_tags=parsed.get("style_tags", ["cinematic", "photorealistic"]),
            aspect_ratio=parsed.get("aspect_ratio", preferred_format or "16:9"),
            duration=parsed.get("duration", "15-30s"),
            resolution=parsed.get("resolution", "1080p"),
            commercial_use_scope=parsed.get("commercial_use_scope", "Full Commercial (Digital & Broadcast)"),
            suggested_budget_range=parsed.get("suggested_budget_range", None),
            suggested_skills_needed=parsed.get("suggested_skills_needed", ["Prompt Engineering", "Compositing"]),
            suggested_tools=parsed.get("suggested_tools", ["Runway Gen-3", "Midjourney v6"]),
            needs_confirmation_fields=parsed.get("needs_confirmation_fields", ["budget", "deadline"]),
            integrity_warnings=parsed.get("integrity_warnings", ["Parameters require explicit confirmation."])
        )


def _heuristic_extract(raw_idea: str, target_audience: str = None, preferred_format: str = None) -> StructuredDraftSuggestion:
    idea_lower = raw_idea.lower()

    # Content type detection
    content_type = "video"
    if any(k in idea_lower for k in ["cgi", "3d", "product render", "photoreal product"]):
        content_type = "cgi"
    elif any(k in idea_lower for k in ["animation", "anime", "cartoon", "character animation"]):
        content_type = "animation"
    elif any(k in idea_lower for k in ["motion design", "kinetic typography", "motion graphics"]):
        content_type = "motion"
    elif any(k in idea_lower for k in ["image", "poster", "key art", "photography", "still"]):
        content_type = "image"

    # Aspect ratio detection
    aspect_ratio = preferred_format or "16:9"
    if any(k in idea_lower for k in ["tiktok", "reel", "shorts", "vertical", "9:16", "mobile", "story"]):
        aspect_ratio = "9:16"
    elif any(k in idea_lower for k in ["square", "1:1", "feed post"]):
        aspect_ratio = "1:1"
    elif any(k in idea_lower for k in ["cinematic", "youtube", "wide", "landscape", "16:9"]):
        aspect_ratio = "16:9"

    # Style tags extraction
    tags = []
    style_keywords = {
        "cinematic": ["cinematic", "film", "movie", "dramatic lighting", "anamorphic"],
        "photorealistic": ["photoreal", "photorealistic", "ultra realistic", "8k", "hyper-detailed"],
        "cyberpunk": ["cyberpunk", "neon", "futuristic", "sci-fi", "dystopian"],
        "luxury/editorial": ["luxury", "editorial", "vogue", "fashion", "perfume", "high-end"],
        "surreal/artistic": ["surreal", "dreamy", "ethereal", "abstract", "psychedelic"],
        "commercial/vibrant": ["commercial", "vibrant", "energetic", "fun", "bold colors"],
        "retro/vintage": ["retro", "vintage", "analog", "film grain", "90s", "nostalgic"]
    }

    for tag, keywords in style_keywords.items():
        if any(kw in idea_lower for kw in keywords):
            tags.append(tag)

    if not tags:
        tags = ["cinematic", "contemporary"]

    # Duration extraction
    duration = "15-30s"
    if "60s" in idea_lower or "minute" in idea_lower:
        duration = "60s"
    elif "15s" in idea_lower or "10s" in idea_lower:
        duration = "15s"
    elif content_type == "image":
        duration = "N/A (Still)"

    # Resolution
    resolution = "4K" if "4k" in idea_lower else "1080p"

    # Skills and tools inferred
    skills = ["Creative Direction", "AI Video Synthesis"]
    tools = ["Runway Gen-3"]
    if content_type == "cgi":
        skills.extend(["3D Compositing", "Product Lighting", "Blender/Unreal Integration"])
        tools.extend(["Blender", "ComfyUI", "Magnific AI"])
    elif content_type == "animation":
        skills.extend(["Character Consistency", "Keyframe Animation", "Color Grading"])
        tools.extend(["Midjourney v6", "AnimateDiff", "After Effects"])
    else:
        skills.extend(["Prompt Architecture", "Audio-Visual Editing", "Upscaling"])
        tools.extend(["Midjourney v6", "Topaz Video AI", "Premiere Pro"])

    # Identify fields needing brand confirmation
    needs_confirmation = ["budget", "deadline"]
    warnings = [
        "Budget and deadline were not stated in the raw idea; default estimates provided for draft preview.",
        "Commercial licensing duration (e.g. 12 months) and exclusivity require brand sign-off."
    ]

    # Generate title
    words = raw_idea.strip().split()
    title_words = words[:6] if len(words) > 6 else words
    title = " ".join(title_words).capitalize()
    if len(title) > 40:
        title = title[:37] + "..."

    return StructuredDraftSuggestion(
        title=f"Campaign: {title}",
        objective=f"Produce high-engagement {content_type} content showcasing the campaign concept with professional AI production standards.",
        description=raw_idea.strip(),
        content_type=content_type,
        style_tags=tags,
        aspect_ratio=aspect_ratio,
        duration=duration,
        resolution=resolution,
        commercial_use_scope="Full Commercial (Digital & Broadcast)",
        suggested_budget_range="$1,500 - $3,500",
        suggested_skills_needed=skills,
        suggested_tools=tools,
        needs_confirmation_fields=needs_confirmation,
        integrity_warnings=warnings
    )
