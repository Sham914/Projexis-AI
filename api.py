from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict

from src.recommender import RecommenderSystem
from src.explainer import ExplanationEngine
from src.llm_generator import GeminiGenerator

app = FastAPI(title="Projexis Recommendation API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

try:
    recommender = RecommenderSystem()
    explainer = ExplanationEngine()
    llm = GeminiGenerator()
except Exception as e:
    recommender = None
    explainer = None
    llm = None
    print(f"Warning: Models failed to load upon startup: {str(e)}")


class UserProfile(BaseModel):
    qualification: str
    year: int
    preferred_domain: str
    skills: List[str]
    skill_proficiency: Dict[str, int]
    subjects: List[str]
    interests: List[str]

@app.get("/")
def read_root():
    return {"message": "Projexis API is running. Endpoints at /api/recommend."}

@app.get("/health")
def health_check():
    return {"status": "healthy", "models_loaded": recommender is not None}

@app.post("/api/recommend")
def get_recommendations(profile: UserProfile):
    if not recommender:
        raise HTTPException(status_code=500, detail="Recommendation models not loaded. Run `python train.py` first.")

    user_input = profile.dict()

    recs = recommender.get_recommendations(user_input, top_n=5)

    if recs.empty:
        return {"projects": []}

    tasks = []
    missing_skills_list = []

    for _, row in recs.iterrows():
        match_pct, missing_skills = explainer.skill_match_analysis(
            user_input.get('skills', []),
            row['required_skills']
        )
        missing_skills_list.append((match_pct, missing_skills))

        tasks.append({
            "project_dict": row.to_dict(),
            "missing_skills": missing_skills
        })

    llm_results = llm.generate_batch_project_details(user_input, tasks)

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
