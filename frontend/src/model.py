import numpy as np
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, mean_absolute_error
from sklearn.metrics.pairwise import cosine_similarity
import joblib
import os
import random

from src.dataset import DataPreprocessor

def compute_base_features(user, project, preprocessor):
    """Compute explicit matching features between a user and a project."""
    u_skills = preprocessor.get_skill_vector(user.get('skills', []))
    p_skills = preprocessor.get_skill_vector(project.get('required_skills', []))

    if np.sum(u_skills) == 0 or np.sum(p_skills) == 0:
        skill_sim = 0.0
    else:
        skill_sim = cosine_similarity([u_skills], [p_skills])[0][0]

    domain_match = 1.0 if user.get('preferred_domain') == project.get('domain') else 0.0

    user_year = user.get('year', 1)
    diff = project.get('difficulty_level', 'Beginner')
    diff_score = 0
    if diff == 'Beginner': diff_score = 1
    elif diff == 'Intermediate': diff_score = 2
    elif diff == 'Advanced': diff_score = 3

    diff_match = 0.0
    if user_year <= 2 and diff_score <= 2: diff_match = 1.0
    elif user_year > 2 and diff_score >= 2: diff_match = 1.0
    elif user_year > 2 and diff_score == 1: diff_match = 0.5
    elif user_year <= 2 and diff_score == 3: diff_match = 0.2

    u_subjects = set(user.get('subjects', []))
    p_prereqs = set(project.get('prerequisites', []))
    subj_match = 1.0
    if p_prereqs:
        overlap = u_subjects.intersection(p_prereqs)
        subj_match = len(overlap) / len(p_prereqs) if len(p_prereqs) > 0 else 1.0

    target_score = (0.5 * skill_sim) + (0.2 * domain_match) + (0.15 * diff_match) + (0.15 * subj_match)
    target_score = np.clip(target_score + random.uniform(-0.05, 0.05), 0, 1)

    features = [skill_sim, domain_match, diff_match, subj_match]
    return features, target_score

def build_training_data(users_df, projects_df, preprocessor, num_samples=5000):
    X = []
    y = []

    users_list = users_df.to_dict('records')
    projects_list = projects_df.to_dict('records')

    for _ in range(num_samples):
        user = random.choice(users_list)
        project = random.choice(projects_list)

        feats, target = compute_base_features(user, project, preprocessor)
        X.append(feats)
        y.append(target)

    return np.array(X), np.array(y)

def train_model(X, y):
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = xgb.XGBRegressor(
        n_estimators=100,
        max_depth=5,
        learning_rate=0.1,
        random_state=42
    )

    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    mse = mean_squared_error(y_test, y_pred)
    mae = mean_absolute_error(y_test, y_pred)

    print(f"Model trained. MSE: {mse:.4f}, MAE: {mae:.4f}")

    return model

def save_model(model, filepath="model/xgboost_model.pkl"):
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    joblib.dump(model, filepath)

def load_model(filepath="model/xgboost_model.pkl"):
    return joblib.load(filepath)
