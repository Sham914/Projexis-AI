import os
import re

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict

startup_error = None

try:
    from src.recommender import RecommenderSystem
    from src.explainer import ExplanationEngine
    from src.llm_generator import GeminiGenerator
except Exception as e:
    RecommenderSystem = None
    ExplanationEngine = None
    GeminiGenerator = None
    startup_error = f"Import failure: {str(e)}"

app = FastAPI(title="Projexis Recommendation API")

allowed_origins = [
    origin.strip()
    for origin in os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
    if origin.strip()
]

allowed_origin_regex = os.getenv("ALLOWED_ORIGIN_REGEX", r"^https://.*\.vercel\.app$")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=allowed_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

recommender = None
explainer = None
llm = None

DOMAIN_TITLE_TEMPLATES = {
    "AI/ML": ("Adaptive", "Engine"),
    "Web Development": ("Interactive", "Platform"),
    "DBMS": ("Structured", "System"),
    "Cybersecurity": ("Secure", "Console"),
    "Data Science": ("Predictive", "Dashboard"),
    "Mobile App Dev": ("Smart", "App"),
    "Cloud Computing": ("Scalable", "Orchestrator"),
    "IoT": ("Connected", "Hub"),
}

GENERIC_TITLE_PATTERNS = (
    r"\bproject\s*\d+\b",
    r"^\s*(ai/ml|web development|dbms|cybersecurity|data science|mobile app dev|cloud computing|iot)\s+project\b",
    r"^\s*project\s*\d+\b",
    r"^\s*(recommended|generic)\s+project\b",
)

if RecommenderSystem and ExplanationEngine and GeminiGenerator:
    try:
        recommender = RecommenderSystem()
        explainer = ExplanationEngine()
        llm = GeminiGenerator()
    except Exception as e:
        startup_error = f"Model init failure: {str(e)}"
        print(f"Warning: Models failed to load upon startup: {str(e)}")
elif startup_error:
    print(f"Warning: {startup_error}")


class UserProfile(BaseModel):
    qualification: str
    year: int
    preferred_domain: str
    skills: List[str]
    skill_proficiency: Dict[str, int]
    subjects: List[str]
    interests: List[str]


def _as_list(value):
    if isinstance(value, list):
        return [str(item).strip() for item in value if str(item).strip()]
    if isinstance(value, str):
        return [part.strip() for part in re.split(r"[|,]", value) if part.strip()]
    return []


def _sorted_skill_names(user_dict):
    skill_proficiency = user_dict.get("skill_proficiency", {}) or {}
    if isinstance(skill_proficiency, dict) and skill_proficiency:
        def _score(item):
            try:
                return int(item[1])
            except Exception:
                return 0

        ordered = sorted(skill_proficiency.items(), key=lambda item: (-_score(item), str(item[0]).lower()))
        return [str(skill).strip() for skill, _ in ordered if str(skill).strip()]

    return _as_list(user_dict.get("skills", []))


def _title_needs_rewrite(title):
    normalized = str(title or "").strip().lower()
    if not normalized:
        return True
    return any(re.search(pattern, normalized, re.IGNORECASE) for pattern in GENERIC_TITLE_PATTERNS)


def _pick_focus_term(project_row, user_dict):
    project_skills = _as_list(project_row.get("required_skills", []))
    user_skills = _as_list(user_dict.get("skills", []))
    overlap = [skill for skill in project_skills if skill in user_skills]
    if overlap:
        return overlap[0]

    ranked_skills = _sorted_skill_names(user_dict)
    if ranked_skills:
        return ranked_skills[0]

    subjects = _as_list(user_dict.get("subjects", []))
    if subjects:
        return subjects[0]

    interests = _as_list(user_dict.get("interests", []))
    if interests:
        return interests[0]

    return ""


def _build_aligned_title(project_row, user_dict):
    existing_title = str(project_row.get("title", "")).strip()
    if existing_title and not _title_needs_rewrite(existing_title):
        return existing_title

    domain = str(project_row.get("domain") or user_dict.get("preferred_domain") or "Project").strip()
    adjective, noun = DOMAIN_TITLE_TEMPLATES.get(domain, ("Adaptive", "Platform"))
    focus = _pick_focus_term(project_row, user_dict)

    if focus:
        focus = re.sub(r"\s+", " ", str(focus)).strip()
        if len(focus.split()) > 3:
            focus = " ".join(focus.split()[:3])
        return f"{adjective} {focus} {noun}".replace("  ", " ").strip()

    return f"{adjective} {noun}".strip()


def _profile_to_dict(profile):
    if hasattr(profile, "model_dump"):
        return profile.model_dump()
    return profile.dict()


def _build_fallback_project_details(project_row, missing_skills, user_dict):
    skill_text = ", ".join(missing_skills) if missing_skills else "all of the required technical skills"
    domain = project_row.get("domain", user_dict.get("preferred_domain", "project"))
    tech_stack = ", ".join(_as_list(project_row.get("tech_stack", [])) or _as_list(project_row.get("required_skills", [])))
    return {
        "title": _build_aligned_title(project_row, user_dict),
        "description": f"A {domain} project shaped around {tech_stack or domain}. It is selected from your full profile so the final build reflects your preferred domain, strongest skills, academic foundations, and interests while still stretching the missing skills that matter most.",
        "explanation": f"You already have a strong base from your qualification, year of study, skills, academic foundations, and interests. This project is intentionally aligned to your profile and highlights {skill_text}, so the work is practical, focused, and directly tied to your growth.",
        "narrative_plan": f"Begin by framing the problem around your {project_row.get('domain', 'chosen')} track and the technologies in {tech_stack or domain}. Then shape the architecture so it uses your current strengths first, while the missing skills become the exact learning checkpoints that let the project evolve from an idea into a polished, portfolio-ready product.",
    }


def _normalize_output_title(title, project_row, user_dict):
    title = str(title or "").strip()
    if _title_needs_rewrite(title):
        return _build_aligned_title(project_row, user_dict)
    return title


def build_fallback_project_details(project_row, missing_skills):
    skill_text = ", ".join(missing_skills) if missing_skills else "all of the required technical skills"
    return {
        "title": project_row.get("title", "Recommended Project"),
        "description": project_row.get("description", "A practical project aligned to your profile."),
        "explanation": f"This project is a strong fit because it matches your current background and highlights {skill_text}.",
        "narrative_plan": "Project details are available, but AI narration is currently unavailable. The project can still be started using the recommended stack and gap analysis provided.",
    }

@app.get("/")
def read_root():
    return {"message": "Projexis API is running. Endpoints at /api/recommend."}

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "models_loaded": recommender is not None,
        "startup_error": startup_error,
    }

@app.post("/api/recommend")
def get_recommendations(profile: UserProfile):
    if not recommender:
        raise HTTPException(status_code=500, detail="Recommendation models not loaded. Run `python train.py` first.")

    user_input = _profile_to_dict(profile)

    recs = recommender.get_recommendations(user_input, top_n=5)

    if recs.empty:
        return {"projects": []}

    tasks = []
    missing_skills_list = []

    for _, row in recs.iterrows():
        if explainer:
            match_pct, missing_skills = explainer.skill_match_analysis(
                user_input.get('skills', []),
                row['required_skills']
            )
        else:
            project_skills = set(row.get("required_skills", []))
            user_skills = set(user_input.get("skills", []))
            overlap = user_skills.intersection(project_skills)
            missing_skills = list(project_skills - user_skills)
            match_pct = round((len(overlap) / len(project_skills)) * 100, 1) if project_skills else 100.0

        missing_skills_list.append((match_pct, missing_skills))

        tasks.append({
            "project_dict": row.to_dict(),
            "missing_skills": missing_skills
        })

    if llm and llm.is_configured():
        llm_results = llm.generate_batch_project_details(user_input, tasks)
    else:
        llm_results = [build_fallback_project_details(task["project_dict"], task["missing_skills"], user_input) for task in tasks]

    final_output = []

    for _, ((_, row), (match_pct, missing_skills), llm_data) in enumerate(zip(recs.iterrows(), missing_skills_list, llm_results)):

        title = _normalize_output_title(llm_data.get("title", row["title"]), row, user_input)
        description = llm_data.get("description", row["description"])
        if not isinstance(description, str) or not description.strip():
            description = _build_fallback_project_details(row, missing_skills, user_input)["description"]

        explanation = llm_data.get("explanation", "Fallback: Good project.")
        if not isinstance(explanation, str) or not explanation.strip():
            explanation = _build_fallback_project_details(row, missing_skills, user_input)["explanation"]

        narrative_plan = llm_data.get("narrative_plan", "")
        if not isinstance(narrative_plan, str) or not narrative_plan.strip():
            narrative_plan = _build_fallback_project_details(row, missing_skills, user_input)["narrative_plan"]

        obj = {
            "id": row.get("project_id", "P000"),
            "original_title": row["title"],
            "title": title,
            "domain": row["domain"],
            "difficulty": row["difficulty_level"],
            "duration": row["estimated_duration"],
            "hybrid_score": float(row["hybrid_score"]),
            "tech_stack": row["tech_stack"],
            "description": description,
            "explanation": explanation,
            "steps": llm_data.get("steps", row.get("step_by_step_implementation", [])),
            "narrative_plan": narrative_plan,
            "real_world_use": row["real_world_application"],
            "expected_output": row["expected_output"],
            "future_enhancements": row["future_enhancements"],
            "match_percentage": match_pct,
            "missing_skills": missing_skills
        }
        final_output.append(obj)

    return {"projects": final_output}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
