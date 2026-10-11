import datetime
from sqlalchemy.orm import Session
from app.core.security import hash_password
from app.models.models import (
    User, CreatorProfile, PortfolioProject, VerificationRecord, Brief,
    Engagement, Submission, Message, Review, Brand, BriefApplication
)

def _seed_demo_users(db: Session):
    # Ensure demo brand user exists
    brand_user = db.query(User).filter(User.id == "brand_demo_user").first()
    if not brand_user:
        brand_user = db.query(User).filter(User.email == "brand@unframe.ai").first()
    if not brand_user:
        brand_user = User(
            id="brand_demo_user",
            email="brand@unframe.ai",
            display_name="Acme Mobility Studio",
            password_hash=hash_password("demopass123"),
            role="brand",
            avatar_url="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200",
            onboarding_completed=True,
            is_active=True
        )
        db.add(brand_user)
    else:
        if not brand_user.password_hash:
            brand_user.password_hash = hash_password("demopass123")

    # Ensure demo creator user exists
    creator_user = db.query(User).filter(User.email == "creator@unframe.ai").first()
    if not creator_user:
        creator_user = User(
            id="creator_demo_user",
            email="creator@unframe.ai",
            display_name="Elena Rostova",
            password_hash=hash_password("demopass123"),
            role="creator",
            avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
            onboarding_completed=True,
            is_active=True
        )
        db.add(creator_user)
        if not creator_user.password_hash:
            creator_user.password_hash = hash_password("demopass123")

    db.flush()

    # Link Elena Rostova to creator_user if not linked
    elena = db.query(CreatorProfile).filter(CreatorProfile.display_name == "Elena Rostova").first()
    if elena and not elena.user_id:
        elena.user_id = creator_user.id

    # Link Acme Mobility to brand_user if not linked
    acme = db.query(Brand).filter(Brand.company_name == "Acme Mobility Studio").first()
    if acme and not acme.owner_user_id:
        acme.owner_user_id = brand_user.id

    db.commit()

def seed_database(db: Session):
    _seed_demo_users(db)
    _seed_organizations_and_briefs(db)
    # Check if already seeded
    if db.query(CreatorProfile).count() > 0:
        _seed_reviews_and_engagements(db)
        return

    print("[SeedData] Seeding 12 diverse sample creators with full workflow recipes and evidence records...")

    creators_data = [
        {
            "display_name": "Elena Rostova",
            "title": "Cinematic AI Director & Spec Ad Creator",
            "bio": "Specializing in high-end automotive, luxury fashion, and narrative commercials using diffusion video models and DaVinci color pipelines.",
            "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
            "location": "Berlin, Germany (Remote)",
            "specializations": ["AI Filmmaking", "AI Ad Creative", "Automotive Spec Ads"],
            "skills": ["Cinematic Camera Motion", "Prompt Engineering", "Color Grading", "DaVinci Resolve", "Upscaling"],
            "tools": ["Runway Gen-3 Alpha", "Midjourney v6", "Topaz Video AI 4", "DaVinci Resolve Studio"],
            "rate_min": 1800,
            "rate_max": 4500,
            "availability_status": "Available",
            "featured": True,
            "projects": [
                {
                    "title": "Aura Electric: 2026 Hypercar Reveal",
                    "description": "30-second speculative luxury EV commercial. Photorealistic motion, dynamic rolling camera angles, and atmospheric rain reflection.",
                    "media_url": "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80",
                    "content_type": "video",
                    "specialization": "AI Filmmaking",
                    "tools_used": ["Runway Gen-3", "Midjourney v6", "Topaz Video AI 4"],
                    "model_versions": {"Runway": "Gen-3 Alpha Turbo", "Midjourney": "v6.0 base", "Upscaler": "Topaz Video AI 4.2"},
                    "skills_demonstrated": ["Cinematic Camera Motion", "Prompt Engineering", "Color Grading"],
                    "aspect_ratios": ["16:9", "9:16"],
                    "commercial_use_status": "Commercial Rights Granted",
                    "evidence_status": "Verified",
                    "prompt_summary": "Anamorphic 35mm pan shot of obsidian futuristic hypercar speeding through neon rain-drenched Munich streets, cinematic reflections, depth of field, 8k photorealism.",
                    "workflow_steps": [
                        {"step": 1, "name": "Ideation & Storyboard", "tool": "Claude 3.5 Sonnet", "description": "Shot list breakdown with lens specifications and beat sheet."},
                        {"step": 2, "name": "Keyframe Generation", "tool": "Midjourney v6", "description": "Generating 40+ reference vehicle frames with consistent car geometry."},
                        {"step": 3, "name": "Video Motion Synthesis", "tool": "Runway Gen-3 Alpha", "description": "Camera pan and motion control with customized motion brush parameters."},
                        {"step": 4, "name": "Super-Resolution Upscaling", "tool": "Topaz Video AI 4", "description": "Interpolating to 60fps and upscaling to pristine 4K resolution."},
                        {"step": 5, "name": "Editorial & Grade", "tool": "DaVinci Resolve", "description": "ACES color space grading, motion blur matching, and audio synchronization."}
                    ]
                },
                {
                    "title": "Solstice Haute Couture Fragrance",
                    "description": "Dreamy editorial perfume campaign featuring liquid silk simulations and surreal golden-hour light.",
                    "media_url": "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1200&q=80",
                    "content_type": "video",
                    "specialization": "AI Ad Creative",
                    "tools_used": ["Luma Dream Machine", "Midjourney v6", "Premiere Pro"],
                    "model_versions": {"Luma": "Dream Machine 1.5", "Midjourney": "v6.1"},
                    "skills_demonstrated": ["Lighting Design", "Editorial Aesthetics", "Audio Sync"],
                    "aspect_ratios": ["9:16", "1:1"],
                    "commercial_use_status": "Commercial Rights Granted",
                    "evidence_status": "Verified",
                    "workflow_steps": [
                        {"step": 1, "name": "Style Boarding", "tool": "Midjourney", "description": "Moodboards based on 90s vintage French Vogue editorials."},
                        {"step": 2, "name": "Motion In-Betweening", "tool": "Luma Dream Machine", "description": "Generating continuous fluid motion from keyframe plates."},
                        {"step": 3, "name": "Final Composite", "tool": "After Effects", "description": "Adding typography and brand logo lockup."}
                    ]
                }
            ],
            "verifications": [
                {"evidence_type": "tool_usage", "status": "Verified", "evidence_reference": "Runway Gen-3 Enterprise API logs authenticated", "demo_only": True},
                {"evidence_type": "workflow_provenance", "status": "Verified", "evidence_reference": "Project .drp DaVinci project archive inspected", "demo_only": True},
                {"evidence_type": "portfolio_review", "status": "Verified", "evidence_reference": "Automotive ad review passed peer benchmark", "demo_only": True}
            ]
        },
        {
            "display_name": "Marcus Vance",
            "title": "3D Product CGI & Synthetic Hard-Surface Artist",
            "bio": "Bridging Blender/Unreal geometry with ComfyUI ControlNet for pixel-perfect commercial product visualizations and consumer electronics.",
            "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
            "location": "San Francisco, USA (Remote)",
            "specializations": ["Product CGI", "Synthetic 3D", "Commercial Lighting"],
            "skills": ["ControlNet Depth/Normal", "Blender 3D", "ComfyUI Node Graphs", "Product Lighting", "Photorealism"],
            "tools": ["ComfyUI", "Blender 4.1", "Stable Diffusion XL", "Magnific AI"],
            "rate_min": 1500,
            "rate_max": 3800,
            "availability_status": "Available",
            "featured": True,
            "projects": [
                {
                    "title": "Kinetix Chronograph: Luxury Watch CGI",
                    "description": "Exploded gear assembly and macro dial detail combining 3D CAD models with neural lighting textures.",
                    "media_url": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80",
                    "content_type": "cgi",
                    "specialization": "Product CGI",
                    "tools_used": ["Blender", "ComfyUI", "SDXL", "Magnific AI"],
                    "model_versions": {"ComfyUI": "v0.2.2", "SDXL": "Juggernaut XL v9", "Magnific": "Precision 2.1"},
                    "skills_demonstrated": ["ControlNet Depth/Normal", "Blender 3D", "Photorealism"],
                    "aspect_ratios": ["1:1", "16:9", "4:5"],
                    "commercial_use_status": "Commercial Rights Granted",
                    "evidence_status": "Verified",
                    "workflow_steps": [
                        {"step": 1, "name": "CAD Clean & Depth Map", "tool": "Blender 4.1", "description": "Extracting normal and Z-depth passes from solid 3D mesh."},
                        {"step": 2, "name": "Neural Texture Pass", "tool": "ComfyUI SDXL", "description": "Applying brushed titanium textures via ControlNet Depth."},
                        {"step": 3, "name": "Macro Enhancement", "tool": "Magnific AI", "description": "Resolving microscopic sapphire crystal scratches and dial engraving."}
                    ]
                }
            ],
            "verifications": [
                {"evidence_type": "workflow_provenance", "status": "Verified", "evidence_reference": "ComfyUI JSON pipeline export verified with seed reproducibility", "demo_only": True},
                {"evidence_type": "tool_usage", "status": "Verified", "evidence_reference": "Blender source .blend file and depth renders submitted", "demo_only": True}
            ]
        },
        {
            "display_name": "Aoi Takahashi",
            "title": "Anime & Stylized Character Animation Lead",
            "bio": "Master of consistent character keyframes, 2D/3D anime aesthetics, and dynamic action choreography for streaming titles and gaming trailers.",
            "avatar_url": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
            "location": "Tokyo, Japan (Remote)",
            "specializations": ["Animation", "Character Design", "Anime Aesthetics"],
            "skills": ["Character Consistency", "LoRA Fine-tuning", "AnimateDiff", "Line Art Inking", "After Effects"],
            "tools": ["AnimateDiff", "ComfyUI", "Niji Journey v6", "Adobe After Effects"],
            "rate_min": 1200,
            "rate_max": 3000,
            "availability_status": "Available",
            "featured": True,
            "projects": [
                {
                    "title": "ChronoSprint: Cyberpunk Anime Teaser",
                    "description": "15-second high-octane mecha chase sequence featuring custom trained LoRAs for frame-to-frame character consistency.",
                    "media_url": "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80",
                    "content_type": "animation",
                    "specialization": "Animation",
                    "tools_used": ["Niji Journey v6", "AnimateDiff", "After Effects"],
                    "model_versions": {"Niji": "Niji 6 Expressive", "AnimateDiff": "v3 Motion Adapter"},
                    "skills_demonstrated": ["Character Consistency", "LoRA Fine-tuning", "AnimateDiff"],
                    "aspect_ratios": ["16:9", "9:16"],
                    "commercial_use_status": "Commercial Rights Granted",
                    "evidence_status": "Verified",
                    "workflow_steps": [
                        {"step": 1, "name": "Character Model Sheet", "tool": "Niji Journey", "description": "Generating 8-angle character turnaround sheets."},
                        {"step": 2, "name": "Motion Keyframing", "tool": "AnimateDiff", "description": "Generating 24fps motion vectors with prompt scheduling."},
                        {"step": 3, "name": "VFX & Compositing", "tool": "After Effects", "description": "Glow pass, particle effects, and cel-shading cleanup."}
                    ]
                }
            ],
            "verifications": [
                {"evidence_type": "tool_usage", "status": "Verified", "evidence_reference": "HuggingFace LoRA weight checkpoints validated", "demo_only": True}
            ]
        },
        {
            "display_name": "Devon Miller",
            "title": "Motion Design & Generative Kinetic Typography",
            "bio": "Crafting kinetic typography, brand identity motion, and UI visual loops for modern fintech and Web3 brands.",
            "avatar_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
            "location": "London, UK (Remote)",
            "specializations": ["Motion Design", "Kinetic Typography", "Brand Systems"],
            "skills": ["Kinetic Typography", "Abstract 3D", "After Effects", "Cinema 4D", "Audio-Reactive VFX"],
            "tools": ["After Effects", "Midjourney v6", "Cinema 4D", "TouchDesigner"],
            "rate_min": 1400,
            "rate_max": 3200,
            "availability_status": "Available",
            "featured": False,
            "projects": [
                {
                    "title": "Apex Financial: Kinetic Brand Identity",
                    "description": "Seamless visual loops communicating speed and security through generative particle typography.",
                    "media_url": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
                    "content_type": "motion",
                    "specialization": "Motion Design",
                    "tools_used": ["Cinema 4D", "Midjourney v6", "After Effects"],
                    "model_versions": {"Cinema4D": "2024.2", "Midjourney": "v6.0"},
                    "skills_demonstrated": ["Kinetic Typography", "Abstract 3D", "Audio-Reactive VFX"],
                    "aspect_ratios": ["1:1", "16:9", "9:16"],
                    "commercial_use_status": "Commercial Rights Granted",
                    "evidence_status": "Verified",
                    "workflow_steps": [
                        {"step": 1, "name": "Typography Layout", "tool": "Illustrator", "description": "Vector brand layout."},
                        {"step": 2, "name": "Neural Texture Maps", "tool": "Midjourney", "description": "Generating iridescent displacement textures."},
                        {"step": 3, "name": "Motion Execution", "tool": "After Effects", "description": "Keyframed easing curves and speed ramps."}
                    ]
                }
            ],
            "verifications": [
                {"evidence_type": "workflow_provenance", "status": "Verified", "evidence_reference": "AEP project file review passed", "demo_only": True}
            ]
        },
        {
            "display_name": "Zara Chen",
            "title": "Viral Social & TikTok 9:16 AI Content Strategist",
            "bio": "Fast-turnaround vertical video ads designed for TikTok, Instagram Reels, and YouTube Shorts. Hook-driven pacing with high conversion track record.",
            "avatar_url": "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
            "location": "Toronto, Canada (Remote)",
            "specializations": ["AI Ad Creative", "AI Filmmaking", "Social-First 9:16"],
            "skills": ["Vertical Framing (9:16)", "Hook Retention", "UGC Simulation", "CapCut Pro", "Lip Sync AI"],
            "tools": ["Runway Gen-3", "Hedra AI", "ElevenLabs", "CapCut Pro"],
            "rate_min": 900,
            "rate_max": 2200,
            "availability_status": "Available",
            "featured": True,
            "projects": [
                {
                    "title": "GlowDrop: Viral 9:16 Skincare Launch",
                    "description": "3 hook variations tested for TikTok Spark Ads. Generated realistic customer reactions and micro-drama scenario.",
                    "media_url": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80",
                    "content_type": "video",
                    "specialization": "AI Ad Creative",
                    "tools_used": ["Runway Gen-3", "Hedra", "ElevenLabs"],
                    "model_versions": {"Runway": "Gen-3 Alpha Turbo", "Hedra": "Character-1", "ElevenLabs": "v2 Multilingual"},
                    "skills_demonstrated": ["Vertical Framing (9:16)", "Hook Retention", "Lip Sync AI"],
                    "aspect_ratios": ["9:16"],
                    "commercial_use_status": "Commercial Rights Granted",
                    "evidence_status": "Verified",
                    "workflow_steps": [
                        {"step": 1, "name": "Script & Hook Matrix", "tool": "ChatGPT", "description": "5 distinct first-3-second retention hooks."},
                        {"step": 2, "name": "Voice Synthesis", "tool": "ElevenLabs", "description": "Natural cadence voiceover with subtle breaths."},
                        {"step": 3, "name": "Video Generation", "tool": "Hedra & Runway", "description": "Generating realistic reaction clips in native 9:16."}
                    ]
                }
            ],
            "verifications": [
                {"evidence_type": "tool_usage", "status": "Verified", "evidence_reference": "ElevenLabs and Runway commercial enterprise licenses confirmed", "demo_only": True}
            ]
        },
        {
            "display_name": "Mateo Morales",
            "title": "Surrealist Fashion & Generative Art Director",
            "bio": "Pushing boundary aesthetics at the intersection of haute couture and speculative biology. Exhibition and high-concept brand campaigns.",
            "avatar_url": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80",
            "location": "Madrid, Spain (Remote)",
            "specializations": ["AI Filmmaking", "Motion Design", "Luxury/Editorial"],
            "skills": ["Surreal Lighting", "Costume Design", "Midjourney v6", "Kling AI", "Prompt Engineering"],
            "tools": ["Kling AI 1.5", "Midjourney v6", "Photoshop Beta", "Premiere Pro"],
            "rate_min": 2200,
            "rate_max": 5000,
            "availability_status": "Available",
            "featured": False,
            "projects": [
                {
                    "title": "Flora Obscura: Botanical Runway",
                    "description": "Models morphing into exotic carnivorous orchid silhouettes. High contrast museum exhibition film.",
                    "media_url": "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80",
                    "content_type": "video",
                    "specialization": "AI Filmmaking",
                    "tools_used": ["Kling AI", "Midjourney v6"],
                    "model_versions": {"Kling": "v1.5 Pro", "Midjourney": "v6.0"},
                    "skills_demonstrated": ["Surreal Lighting", "Prompt Engineering"],
                    "aspect_ratios": ["16:9"],
                    "commercial_use_status": "Commercial Rights Granted",
                    "evidence_status": "Verified",
                    "workflow_steps": [
                        {"step": 1, "name": "Flora Conceptualization", "tool": "Midjourney", "description": "Combining Victorian botany sketches with modern high fashion."},
                        {"step": 2, "name": "Fluid Transformation", "tool": "Kling AI", "description": "High frame-rate motion simulation."}
                    ]
                }
            ],
            "verifications": [
                {"evidence_type": "portfolio_review", "status": "Verified", "evidence_reference": "Featured in Milan AI Fashion Showcase 2026", "demo_only": True}
            ]
        },
        {
            "display_name": "Chloe Dupont",
            "title": "Beverage & Food Macro CGI Specialist",
            "bio": "Photorealistic liquid splashes, condensation simulation, and macro food cinematography. Zero physical waste, hyper-appetizing outputs.",
            "avatar_url": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
            "location": "Paris, France (Remote)",
            "specializations": ["Product CGI", "AI Ad Creative", "Liquid Simulation"],
            "skills": ["Macro Cinematography", "Liquid Viscosity", "Color Grading", "ComfyUI", "Magnific AI"],
            "tools": ["ComfyUI", "Magnific AI", "Premiere Pro", "Luma Dream Machine"],
            "rate_min": 1600,
            "rate_max": 3600,
            "availability_status": "Available",
            "featured": False,
            "projects": [
                {
                    "title": "Glacier Zero: Artisan Sparkling Water",
                    "description": "Extreme close-up of effervescent bubbles rising through lime-infused sparkling water with condensation pearls.",
                    "media_url": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=1200&q=80",
                    "content_type": "cgi",
                    "specialization": "Product CGI",
                    "tools_used": ["ComfyUI", "Luma Dream Machine", "Magnific AI"],
                    "model_versions": {"ComfyUI": "v0.2.1", "Luma": "1.5", "Magnific": "2.0"},
                    "skills_demonstrated": ["Macro Cinematography", "Liquid Viscosity", "Photorealism"],
                    "aspect_ratios": ["16:9", "1:1"],
                    "commercial_use_status": "Commercial Rights Granted",
                    "evidence_status": "Verified",
                    "workflow_steps": [
                        {"step": 1, "name": "Ice & Bottle Model", "tool": "Blender", "description": "Basic lighting and reflection cage."},
                        {"step": 2, "name": "Diffusion Enhancement", "tool": "ComfyUI", "description": "Applying high-refraction glass shaders."},
                        {"step": 3, "name": "Bubble Motion", "tool": "Luma Dream Machine", "description": "Slow-motion physics generation."}
                    ]
                }
            ],
            "verifications": [
                {"evidence_type": "workflow_provenance", "status": "Verified", "evidence_reference": "Workflow nodes and intermediate EXR passes submitted", "demo_only": True}
            ]
        },
        {
            "display_name": "Liam Thorne",
            "title": "Experimental AI Audio & Sound Designer",
            "bio": "Soundscapes, cinematic foley, generative score, and voiceover design engineered specifically to elevate AI visual narratives.",
            "avatar_url": "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80",
            "location": "Austin, USA (Remote)",
            "specializations": ["Audio & Sound Design", "AI Filmmaking"],
            "skills": ["Cinematic Foley", "Stem Mastering", "ElevenLabs", "Suno AI v3", "Pro Tools"],
            "tools": ["ElevenLabs", "Suno AI", "Ableton Live", "Pro Tools"],
            "rate_min": 800,
            "rate_max": 1800,
            "availability_status": "Available",
            "featured": False,
            "projects": [
                {
                    "title": "Cosmic Drift: Full Sci-Fi Audio Suite",
                    "description": "Complete audio landscape: sub-bass rumbles, spaceship engines, synthetic vocal chatter, and orchestral crescendo.",
                    "media_url": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80",
                    "content_type": "audio",
                    "specialization": "Audio & Sound Design",
                    "tools_used": ["ElevenLabs", "Suno AI", "Ableton Live"],
                    "model_versions": {"ElevenLabs": "Voice Design v2", "Suno": "v3.5"},
                    "skills_demonstrated": ["Cinematic Foley", "Stem Mastering"],
                    "aspect_ratios": ["16:9"],
                    "commercial_use_status": "Commercial Rights Granted",
                    "evidence_status": "Verified",
                    "workflow_steps": [
                        {"step": 1, "name": "Cue Sheet Analysis", "tool": "Pro Tools", "description": "Mapping visual cuts to audio transients."},
                        {"step": 2, "name": "Foley Synthesis", "tool": "ElevenLabs SFX", "description": "Generating mechanical and futuristic effects."},
                        {"step": 3, "name": "Stem Mixing", "tool": "Ableton Live", "description": "-14 LUFS commercial broadcast mastering."}
                    ]
                }
            ],
            "verifications": [
                {"evidence_type": "tool_usage", "status": "Verified", "evidence_reference": "Ableton project archive and commercial audio stem release confirmed", "demo_only": True}
            ]
        },
        {
            "display_name": "Siddharth Rao",
            "title": "Generative Key Art & Print Campaign Designer",
            "bio": "Ultra high-resolution static posters, billboard campaigns, and packaging visuals with lossless 16K print-ready vector/raster pipelines.",
            "avatar_url": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
            "location": "Bengaluru, India (Remote)",
            "specializations": ["AI Image/Brand Creative", "Print Key Art", "Packaging"],
            "skills": ["16K Print Upscaling", "Typography Integration", "Midjourney v6", "Photoshop Retouching"],
            "tools": ["Midjourney v6", "Adobe Photoshop 2026", "Gigapixel AI"],
            "rate_min": 1100,
            "rate_max": 2400,
            "availability_status": "Available",
            "featured": False,
            "projects": [
                {
                    "title": "Terra Incognita: National Geographic Spec Poster",
                    "description": "Award-winning wildlife portrait combining synthetic camera depth with intricate bioluminescent flora detail.",
                    "media_url": "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80",
                    "content_type": "image",
                    "specialization": "AI Image/Brand Creative",
                    "tools_used": ["Midjourney v6", "Photoshop", "Gigapixel AI"],
                    "model_versions": {"Midjourney": "v6.1", "Gigapixel": "v7.0"},
                    "skills_demonstrated": ["16K Print Upscaling", "Photoshop Retouching"],
                    "aspect_ratios": ["4:5", "1:1"],
                    "commercial_use_status": "Commercial Rights Granted",
                    "evidence_status": "Verified",
                    "workflow_steps": [
                        {"step": 1, "name": "Prompt Exploration", "tool": "Midjourney", "description": "Iterating 150+ seeds for ideal subject anatomy."},
                        {"step": 2, "name": "Retouching", "tool": "Photoshop", "description": "Manual eye reflection and hair refinement."},
                        {"step": 3, "name": "Vector Upscale", "tool": "Gigapixel AI", "description": "Lossless 300 DPI CMYK export."}
                    ]
                }
            ],
            "verifications": [
                {"evidence_type": "portfolio_review", "status": "Verified", "evidence_reference": "Print production proof approved by agency review", "demo_only": True}
            ]
        },
        # Partial match case (Self-reported evidence, missing commercial confirmation)
        {
            "display_name": "Kai Lindqvist",
            "title": "Experimental AI Visualist (Self-Reported)",
            "bio": "Exploring abstract generative visuals and retro-futuristic synthwave aesthetics. Portfolio submitted for initial community review.",
            "avatar_url": "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80",
            "location": "Stockholm, Sweden (Remote)",
            "specializations": ["AI Filmmaking", "Motion Design"],
            "skills": ["Synthwave Aesthetics", "Prompt Engineering", "Color Grading"],
            "tools": ["Runway Gen-2", "Stable Diffusion 1.5", "Premiere Pro"],
            "rate_min": 700,
            "rate_max": 1400,
            "availability_status": "Available",
            "featured": False,
            "projects": [
                {
                    "title": "Neon Grid 1984: Synthwave Loop",
                    "description": "Retro wireframe city visualizer with glowing horizon lines and chromatic aberration.",
                    "media_url": "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80",
                    "content_type": "video",
                    "specialization": "Motion Design",
                    "tools_used": ["Runway Gen-2", "Premiere Pro"],
                    "model_versions": {"Runway": "Gen-2 legacy"},
                    "skills_demonstrated": ["Synthwave Aesthetics"],
                    "aspect_ratios": ["16:9"],
                    "commercial_use_status": "Requires Confirmation",
                    "evidence_status": "Self-reported",
                    "workflow_steps": [
                        {"step": 1, "name": "Concept Prompting", "tool": "SD 1.5", "description": "Generating synthwave grid plates."},
                        {"step": 2, "name": "Video Loop", "tool": "Runway Gen-2", "description": "Interpolating motion loop."}
                    ]
                }
            ],
            "verifications": [
                {"evidence_type": "tool_usage", "status": "Self-reported", "evidence_reference": "Self-reported subscription receipt", "demo_only": True}
            ]
        },
        # Missing Requirements / Booked case (To test mandatory filtering and clear warnings)
        {
            "display_name": "Valerie Sterling",
            "title": "High-Budget Commercial AI Director (Currently Booked)",
            "bio": "Super Bowl spec ads and tier-1 brand creative. Currently under exclusive studio retainer through Q4.",
            "avatar_url": "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80",
            "location": "New York, USA (Remote)",
            "specializations": ["AI Filmmaking", "AI Ad Creative"],
            "skills": ["High-End Commercials", "Virtual Production", "DaVinci Resolve"],
            "tools": ["Runway Gen-3", "Midjourney v6", "DaVinci Resolve Studio"],
            "rate_min": 5000,
            "rate_max": 12000,
            "availability_status": "Booked",
            "featured": False,
            "projects": [
                {
                    "title": "Quantum Leap: Super Bowl Spec",
                    "description": "Epic 60s broadcast spec featuring holographic stadium visuals.",
                    "media_url": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
                    "content_type": "video",
                    "specialization": "AI Filmmaking",
                    "tools_used": ["Runway Gen-3", "DaVinci Resolve"],
                    "model_versions": {"Runway": "Gen-3 Alpha"},
                    "skills_demonstrated": ["High-End Commercials", "Virtual Production"],
                    "aspect_ratios": ["16:9"],
                    "commercial_use_status": "Commercial Rights Granted",
                    "evidence_status": "Verified",
                    "workflow_steps": [
                        {"step": 1, "name": "Storyboard", "tool": "Midjourney", "description": "Studio storyboards."}
                    ]
                }
            ],
            "verifications": [
                {"evidence_type": "track_record", "status": "Verified", "evidence_reference": "Verified $50k+ commercial portfolio history", "demo_only": True}
            ]
        },
        # Niche specialized case (Only 9:16 vertical shorts, no 16:9)
        {
            "display_name": "Kofi Mensah",
            "title": "Afrofuturism & High-Speed Mobile Video Designer",
            "bio": "Infusing vibrant African textile motifs and speculative architecture into mobile-first commercial video clips.",
            "avatar_url": "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=400&q=80",
            "location": "Accra, Ghana (Remote)",
            "specializations": ["AI Filmmaking", "Animation", "Afrofuturism"],
            "skills": ["Afrofuturist Aesthetics", "Dynamic Color Palettes", "Prompt Architecture", "CapCut Pro"],
            "tools": ["Midjourney v6", "Pika 2.0", "CapCut Pro"],
            "rate_min": 1000,
            "rate_max": 2500,
            "availability_status": "Available",
            "featured": True,
            "projects": [
                {
                    "title": "Sankofa 3000: Textile Architecture",
                    "description": "Vibrant soaring towers woven from glowing Kente patterns in an eco-futuristic metropolis.",
                    "media_url": "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80",
                    "content_type": "video",
                    "specialization": "AI Filmmaking",
                    "tools_used": ["Midjourney v6", "Pika 2.0"],
                    "model_versions": {"Midjourney": "v6.0", "Pika": "2.0"},
                    "skills_demonstrated": ["Afrofuturist Aesthetics", "Dynamic Color Palettes"],
                    "aspect_ratios": ["9:16"],
                    "commercial_use_status": "Commercial Rights Granted",
                    "evidence_status": "Verified",
                    "workflow_steps": [
                        {"step": 1, "name": "Textile Sampling", "tool": "Midjourney", "description": "High-resolution pattern studies."},
                        {"step": 2, "name": "Camera Motion", "tool": "Pika 2.0", "description": "Smooth soaring pan generation."}
                    ]
                }
            ],
            "verifications": [
                {"evidence_type": "tool_usage", "status": "Verified", "evidence_reference": "Verified Pika Pro commercial usage license", "demo_only": True}
            ]
        }
    ]

    for c_data in creators_data:
        projects = c_data.pop("projects")
        verifications = c_data.pop("verifications")

        creator = CreatorProfile(**c_data)
        db.add(creator)
        db.flush()

        for p_data in projects:
            p_data["creator_id"] = creator.id
            proj = PortfolioProject(**p_data)
            db.add(proj)
            db.flush()

            for v_data in verifications:
                v_data["creator_id"] = creator.id
                v_data["portfolio_project_id"] = proj.id
                ver = VerificationRecord(**v_data)
                db.add(ver)

    # Seed 2 realistic sample Brand Briefs for instantaneous testing and demo flow
    sample_brief_1 = Brief(
        title="Zenith Quantum EV: Global Digital Reveal",
        objective="Generate a hyper-cinematic 30s teaser ad for an all-electric sports car launch targeting affluent tech-forward consumers.",
        raw_idea="Need a sleek, ultra-modern video ad for a new electric hypercar gliding through futuristic city streets at night with rain reflections and sharp camera motion.",
        description="A 30-second commercial video emphasizing precision vehicle curves, dramatic headlight illumination in dark rain, and high-energy motion. Formats needed: 16:9 for YouTube preroll and 9:16 for Reels.",
        content_type="video",
        style_tags=["cinematic", "photorealistic", "automotive spec ads", "color grading"],
        aspect_ratio="16:9",
        duration="30s",
        resolution="4K",
        commercial_use_scope="Full Commercial (Digital & Broadcast)",
        license_duration_months=12,
        exclusivity_required=True,
        revision_limit=2,
        budget_min=2000,
        budget_max=4500,
        deadline="2026-11-15",
        status="open",
        visibility="public",
        brand_user_id="brand_demo_user"
    )

    sample_brief_2 = Brief(
        title="LuxeGlow Skincare: Viral 9:16 TikTok Campaign",
        objective="Create 3 high-converting 9:16 vertical short video hooks demonstrating glowing skin transformation with macro texture fidelity.",
        raw_idea="Viral TikTok vertical ads for an organic serum bottle with water droplets and realistic morning sunlight.",
        description="Mobile-first 9:16 video ads with strong first-3-second retention hooks, clean product lighting, and upbeat commercial rhythm.",
        content_type="video",
        style_tags=["vertical framing (9:16)", "commercial/vibrant", "hook retention"],
        aspect_ratio="9:16",
        duration="15s",
        resolution="1080p",
        commercial_use_scope="Digital Social Advertising Only",
        license_duration_months=6,
        exclusivity_required=False,
        revision_limit=3,
        budget_min=1000,
        budget_max=2500,
        deadline="2026-10-30",
        status="open",
        visibility="public",
        brand_user_id="brand_demo_user"
    )

    db.add(sample_brief_1)
    db.add(sample_brief_2)
    db.commit()
    print("[SeedData] Successfully seeded 12 creators and 2 sample briefs.")
    _seed_reviews_and_engagements(db)


def _seed_reviews_and_engagements(db: Session):
    # Check if reviews already exist
    if db.query(Review).count() == 0:
        print("[SeedData] Seeding verified client reviews for creators...")
        creators_by_name = {c.display_name: c for c in db.query(CreatorProfile).all()}

        # Elena Rostova
        elena = creators_by_name.get("Elena Rostova")
        if elena:
            r1 = Review(
                creator_id=elena.id,
                brand_name="Hyperion Mobility",
                brand_avatar="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100",
                rating=5.0,
                delivery_speed_rating=5.0,
                workflow_transparency_rating=5.0,
                communication_rating=4.9,
                comment="Delivered an extraordinary commercial spec on time. ACES color grading and motion stability were flawless. Highly recommended!",
                project_title="Aura Electric EV Teaser",
                created_at=datetime.datetime.utcnow() - datetime.timedelta(days=12)
            )
            r2 = Review(
                creator_id=elena.id,
                brand_name="Verve Haute Studio",
                brand_avatar="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
                rating=4.9,
                delivery_speed_rating=4.8,
                workflow_transparency_rating=5.0,
                communication_rating=5.0,
                comment="Top-tier prompt craft and workflow transparency. Provided clean DaVinci timelines and custom motion brush setups.",
                project_title="Solstice Haute Couture",
                created_at=datetime.datetime.utcnow() - datetime.timedelta(days=5)
            )
            db.add_all([r1, r2])
            elena.rating_avg = 5.0
            elena.reviews_count = 2

        # Ananya Roy
        ananya = creators_by_name.get("Ananya Roy")
        if ananya:
            r = Review(
                creator_id=ananya.id,
                brand_name="Volt Athletics Global",
                brand_avatar="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100",
                rating=5.0,
                delivery_speed_rating=5.0,
                workflow_transparency_rating=5.0,
                communication_rating=4.8,
                comment="The kinetic water splash and sneaker CGI exceeded expectations. 9:16 vertical cuts performed 3.2x higher on Meta ads.",
                project_title="Apex Surge Zero-Gravity Sneaker",
                created_at=datetime.datetime.utcnow() - datetime.timedelta(days=8)
            )
            db.add(r)
            ananya.rating_avg = 5.0
            ananya.reviews_count = 1

        # Dev Malhotra
        dev = creators_by_name.get("Dev Malhotra")
        if dev:
            r = Review(
                creator_id=dev.id,
                brand_name="Maison Florale",
                brand_avatar="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100",
                rating=4.9,
                delivery_speed_rating=4.9,
                workflow_transparency_rating=5.0,
                communication_rating=4.9,
                comment="Hyper-realistic skin textures and organic petals without AI plastic distortion. Remarkable attention to detail.",
                project_title="Botanica Scent Campaign",
                created_at=datetime.datetime.utcnow() - datetime.timedelta(days=15)
            )
            db.add(r)
            dev.rating_avg = 4.9
            dev.reviews_count = 1

        # Mira Shah
        mira = creators_by_name.get("Mira Shah")
        if mira:
            r = Review(
                creator_id=mira.id,
                brand_name="Nexus Gaming Universe",
                brand_avatar="https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100",
                rating=4.8,
                delivery_speed_rating=4.7,
                workflow_transparency_rating=5.0,
                communication_rating=4.8,
                comment="Sci-fi portal VFX with seamless camera track. Delivered ComfyUI recipe with complete LoRA weights and workflow JSON.",
                project_title="Singularity Portal VFX",
                created_at=datetime.datetime.utcnow() - datetime.timedelta(days=20)
            )
            db.add(r)
            mira.rating_avg = 4.8
            mira.reviews_count = 1

        db.commit()

    # Check if sample engagement already exists
    if db.query(Engagement).count() == 0:
        brief = db.query(Brief).first()
        elena = db.query(CreatorProfile).filter(CreatorProfile.display_name == "Elena Rostova").first()

        if brief and elena:
            print("[SeedData] Seeding active demo engagement with submissions and chat history...")
            eng = Engagement(
                brief_id=brief.id,
                creator_id=elena.id,
                status="in_progress",
                agreed_terms={
                    "budget": 3500,
                    "deadline": "2026-11-15",
                    "commercial_scope": "Full Commercial (Digital & Broadcast)",
                    "revision_limit": 2
                },
                created_at=datetime.datetime.utcnow() - datetime.timedelta(days=3)
            )
            db.add(eng)
            db.flush()

            # Seed submissions v1 and v2
            sub1 = Submission(
                engagement_id=eng.id,
                version_number=1,
                media_url="https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80",
                creator_note="Draft v1 with rough audio sync and ACES base pass.",
                brand_feedback="Camera motion is awesome. Please brighten the rim lights on the front headlights in the rain sequence.",
                status="revision_requested",
                created_at=datetime.datetime.utcnow() - datetime.timedelta(days=2)
            )
            sub2 = Submission(
                engagement_id=eng.id,
                version_number=2,
                media_url="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
                creator_note="v2 revision with enhanced headlight rim glow, 4K Topaz super-sampling, and final synth audio master.",
                brand_feedback=None,
                status="pending",
                created_at=datetime.datetime.utcnow() - datetime.timedelta(hours=6)
            )
            db.add_all([sub1, sub2])

            # Seed chat messages
            m1 = Message(
                engagement_id=eng.id,
                sender_id="brand_demo_user",
                sender_name="Acme Mobility Brand Lead",
                sender_role="brand",
                recipient_id=elena.id,
                recipient_name=elena.display_name,
                content="Hi Elena! Thrilled to kick off the Zenith Quantum EV reveal campaign. Your automotive reel was stunning.",
                created_at=datetime.datetime.utcnow() - datetime.timedelta(days=3)
            )
            m2 = Message(
                engagement_id=eng.id,
                sender_id=elena.id,
                sender_name=elena.display_name,
                sender_role="creator",
                recipient_id="brand_demo_user",
                recipient_name="Acme Mobility Brand Lead",
                content="Thanks so much! I've started the Midjourney v6 keyframe sequence and Runway Gen-3 motion passes. Target aspect ratio is 16:9 with 9:16 cuts.",
                created_at=datetime.datetime.utcnow() - datetime.timedelta(days=2, hours=18)
            )
            m3 = Message(
                engagement_id=eng.id,
                sender_id=elena.id,
                sender_name=elena.display_name,
                sender_role="creator",
                recipient_id="brand_demo_user",
                recipient_name="Acme Mobility Brand Lead",
                content="Submitted v1 draft for review! Let me know your thoughts on the headlight glow and rain reflections.",
                created_at=datetime.datetime.utcnow() - datetime.timedelta(days=2)
            )
            m4 = Message(
                engagement_id=eng.id,
                sender_id="brand_demo_user",
                sender_name="Acme Mobility Brand Lead",
                sender_role="brand",
                recipient_id=elena.id,
                recipient_name=elena.display_name,
                content="Looking incredible! Added feedback to slightly lift the rim lighting in the 0:15 mark.",
                created_at=datetime.datetime.utcnow() - datetime.timedelta(days=1)
            )
            m5 = Message(
                engagement_id=eng.id,
                sender_id=elena.id,
                sender_name=elena.display_name,
                sender_role="creator",
                recipient_id="brand_demo_user",
                recipient_name="Acme Mobility Brand Lead",
                content="Done! Just submitted v2 with the rim lighting boosted and 4K super-sampling.",
                created_at=datetime.datetime.utcnow() - datetime.timedelta(hours=5)
            )
            db.add_all([m1, m2, m3, m4, m5])
            db.commit()


def _seed_organizations_and_briefs(db: Session):
    # Ensure brand organizations exist
    if db.query(Brand).count() == 0:
        print("[SeedData] Seeding organization profiles (brands & agencies)...")
        b1 = Brand(
            id="brand_acme_mobility",
            owner_user_id="brand_demo_user",
            company_name="Acme Mobility Studio",
            type="brand",
            industry="Automotive & Clean Tech",
            website="https://acmemobility.design",
            logo_url="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80",
            description="Pioneering high-performance electric mobility through cutting-edge generative video, virtual production, and real-time CGI reveals.",
            verified=True
        )
        b2 = Brand(
            id="agency_verve_collective",
            owner_user_id="agency_demo_user",
            company_name="Verve Creative Collective",
            type="agency",
            industry="Luxury Fashion & Lifestyle",
            website="https://vervecreative.agency",
            logo_url="https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=200&auto=format&fit=crop&q=80",
            description="Global creative agency partnering with high-fashion ateliers and emerging luxury brands to produce viral diffusion-first digital campaigns.",
            verified=True
        )
        b3 = Brand(
            id="agency_hyperion_media",
            owner_user_id="hyperion_lead",
            company_name="Hyperion Media Works",
            type="agency",
            industry="Entertainment & Virtual Production",
            website="https://hyperion.media",
            logo_url="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=200&auto=format&fit=crop&q=80",
            description="Boutique creative agency specializing in sci-fi cinematic teasers, generative game trailers, and dynamic commercial 3D VFX.",
            verified=True
        )
        b4 = Brand(
            id="brand_luxeglow",
            owner_user_id="luxeglow_brand",
            company_name="LuxeGlow Skincare",
            type="brand",
            industry="Beauty & Wellness",
            website="https://luxeglow.bio",
            logo_url="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=200&auto=format&fit=crop&q=80",
            description="Organic clinical skincare scaling viral vertical-video performance ad campaigns on TikTok and Instagram Reels.",
            verified=True
        )
        db.add_all([b1, b2, b3, b4])
        db.commit()

    # Link existing briefs to organizations if unassigned, and seed additional open/draft briefs
    org_acme = db.query(Brand).filter(Brand.company_name == "Acme Mobility Studio").first()
    org_verve = db.query(Brand).filter(Brand.company_name == "Verve Creative Collective").first()
    org_hyperion = db.query(Brand).filter(Brand.company_name == "Hyperion Media Works").first()
    org_luxeglow = db.query(Brand).filter(Brand.company_name == "LuxeGlow Skincare").first()

    for brief in db.query(Brief).all():
        if "Zenith" in brief.title or "EV" in brief.title:
            if org_acme:
                brief.organization_id = org_acme.id
            brief.brand_user_id = "brand_demo_user"
            brief.status = "open"
            brief.visibility = "public"
        elif "LuxeGlow" in brief.title or "Skincare" in brief.title:
            if org_luxeglow:
                brief.organization_id = org_luxeglow.id
            brief.brand_user_id = "brand_demo_user"
            brief.status = "open"
            brief.visibility = "public"

    # Seed 2 additional open briefs and 1 draft brief if total briefs <= 2
    if db.query(Brief).count() <= 2:
        if org_verve:
            b3 = Brief(
                organization_id=org_verve.id,
                brand_user_id="agency_demo_user",
                title="AeroSynth 2026: Spatial Audio & Holographic Spec Ad",
                objective="Create an ethereal, surreal CGI commercial video showcasing next-gen spatial headphones floating in zero gravity with soundwave simulations.",
                raw_idea="Futuristic headphones with pulsating neon cymatics and water droplet physics in a minimal white studio.",
                description="Hyper-detailed 16:9 CGI campaign video demonstrating tactile material shaders, brushed aluminum geometry, and generative iridescent fluid patterns.",
                content_type="cgi",
                style_tags=["cgi", "photorealistic", "surreal", "spatial audio"],
                aspect_ratio="16:9",
                duration="20s",
                resolution="4K",
                commercial_use_scope="Full Commercial (Digital & Broadcast)",
                license_duration_months=12,
                exclusivity_required=True,
                revision_limit=2,
                budget_min=2500,
                budget_max=5000,
                deadline="2026-11-20",
                status="open",
                visibility="public"
            )
            db.add(b3)

        if org_hyperion:
            b4 = Brief(
                organization_id=org_hyperion.id,
                brand_user_id="hyperion_lead",
                title="CyberKicks Urban Drift: Kinetic Streetwear Video",
                objective="Deliver a punchy, 9:16 vertical video ad showing futuristic sneakers splashing through puddles in Tokyo at night.",
                raw_idea="Cyberpunk Tokyo streetwear vertical ad with speed ramps and neon lighting.",
                description="High-energy 9:16 commercial video with aggressive cuts, camera motion blur, and cinematic neon grading for TikTok and Reels.",
                content_type="video",
                style_tags=["vertical framing (9:16)", "cinematic", "neon", "cyberpunk"],
                aspect_ratio="9:16",
                duration="15s",
                resolution="1080p",
                commercial_use_scope="Digital Social Advertising Only",
                license_duration_months=6,
                exclusivity_required=False,
                revision_limit=2,
                budget_min=1200,
                budget_max=2800,
                deadline="2026-11-05",
                status="open",
                visibility="public"
            )
            db.add(b4)

        if org_acme:
            # Confidential draft brief
            b5 = Brief(
                organization_id=org_acme.id,
                brand_user_id="brand_demo_user",
                title="Project Chronos: Stealth Luxury Timepiece (Internal Concept)",
                objective="Internal exploratory concept for luxury watch launch.",
                raw_idea="Exploded watch dial with sapphire crystal reflection.",
                description="Confidential unreleased brand draft brief.",
                content_type="cgi",
                style_tags=["luxury", "speculative"],
                aspect_ratio="16:9",
                duration="15s",
                resolution="4K",
                budget_min=3000,
                budget_max=6000,
                status="draft",
                visibility="private"
            )
            db.add(b5)

    db.commit()

    # Seed sample brief application if none exist
    if db.query(BriefApplication).count() == 0:
        zenith_brief = db.query(Brief).filter(Brief.title.ilike("%Zenith%")).first()
        elena = db.query(CreatorProfile).filter(CreatorProfile.display_name == "Elena Rostova").first()
        if zenith_brief and elena:
            app1 = BriefApplication(
                brief_id=zenith_brief.id,
                creator_id=elena.id,
                pitch="I have already built automotive diffusion workflows with ACES color consistency and custom motion brush camera angles. I can deliver 4K masters within 7 days.",
                proposed_rate=3200,
                portfolio_sample_urls=[
                    "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80"
                ],
                status="pending"
            )
            db.add(app1)
            db.commit()

