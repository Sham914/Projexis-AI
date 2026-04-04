import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from src.dataset import DataPreprocessor, load_projects
from src.model import load_model, compute_base_features

class RecommenderSystem:
    def __init__(self, preprocessor_path="model/preprocessor.pkl", model_path="model/xgboost_model.pkl"):
        self.preprocessor = DataPreprocessor.load(preprocessor_path)
        self.ml_model = load_model(model_path)
        self.projects_df = load_projects()

    def compute_similarity(self, user_skills, project_skills_list):
        """Computes pure text/skill cosine similarity."""
        u_vec = self.preprocessor.get_skill_vector(user_skills)
        if sum(u_vec) == 0:
            return np.zeros(len(project_skills_list))

        p_vecs = [self.preprocessor.get_skill_vector(ps) for ps in project_skills_list]
        similarities = cosine_similarity([u_vec], p_vecs)[0]
        return similarities

    def apply_rule_filters(self, user_dict, projects_df):
        """Removes projects that are obviously inappropriate."""
        filtered = projects_df.copy()

        user_year = user_dict.get('year', 1)
        if user_year == 1:
            filtered = filtered[filtered['difficulty_level'] != 'Advanced']

        return filtered

    def get_recommendations(self, user_dict, top_n=5, alpha=0.4):
        """
        Main pipeline:
        1. Filter invalid projects
        2. Compute similarities and ML scores
        3. Hybrid Rank
        """
        candidate_projects = self.apply_rule_filters(user_dict, self.projects_df)
        if len(candidate_projects) == 0:
            return pd.DataFrame()

        ml_features_list = []
        for _, project in candidate_projects.iterrows():
            feats, _ = compute_base_features(user_dict, project.to_dict(), self.preprocessor)
            ml_features_list.append(feats)

        X_candidates = np.array(ml_features_list)
        ml_scores = self.ml_model.predict(X_candidates)

        project_skills_list = candidate_projects['required_skills'].tolist()
        base_similarities = self.compute_similarity(user_dict.get('skills', []), project_skills_list)

        final_scores = (alpha * base_similarities) + ((1 - alpha) * ml_scores)

        candidate_projects = candidate_projects.copy()
        candidate_projects['similarity_score'] = base_similarities
        candidate_projects['ml_score'] = ml_scores
        candidate_projects['hybrid_score'] = final_scores

        ranked_projects = candidate_projects.sort_values(by='hybrid_score', ascending=False).head(top_n)

        return ranked_projects
