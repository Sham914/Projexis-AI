import os

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

    user_input = profile.model_dump()

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
        llm_results = [build_fallback_project_details(task["project_dict"], task["missing_skills"]) for task in tasks]

    final_output = []

    for _, ((_, row), (match_pct, missing_skills), llm_data) in enumerate(zip(recs.iterrows(), missing_skills_list, llm_results)):

        obj = {
            "id": row.get("project_id", "P000"),
            "original_title": row["title"],
            "title": llm_data.get("title", row["title"]),
            "domain": row["domain"],
            "difficulty": row["difficulty_level"],
            "duration": row["estimated_duration"],
            "hybrid_score": float(row["hybrid_score"]),
            "tech_stack": row["tech_stack"],
            "description": llm_data.get("description", row["description"]),
            "explanation": llm_data.get("explanation", "Fallback: Good project."),
            "steps": llm_data.get("steps", row.get("step_by_step_implementation", [])),
            "narrative_plan": llm_data.get("narrative_plan", ""),
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
