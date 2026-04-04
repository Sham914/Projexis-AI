import pandas as pd
import json
import numpy as np
import os
from sklearn.preprocessing import MultiLabelBinarizer, OneHotEncoder
import joblib

def load_projects(filepath="data/projects.json"):
    with open(filepath, 'r') as f:
        projects = json.load(f)
    return pd.DataFrame(projects)

def load_users(filepath="data/users.csv"):
    df = pd.read_csv(filepath)
    for col in ['skills', 'subjects', 'interests']:
        df[col] = df[col].astype(str).apply(lambda x: x.split('|') if x != 'nan' else [])
    df['skill_proficiency'] = df['skill_proficiency'].apply(lambda x: json.loads(x) if isinstance(x, str) else x)
    return df

class DataPreprocessor:
    def __init__(self):
        self.mlb_skills = MultiLabelBinarizer()
        self.mlb_subjects = MultiLabelBinarizer()
        self.mlb_interests = MultiLabelBinarizer()
        self.domain_encoder = OneHotEncoder(handle_unknown='ignore', sparse_output=False)
        self.difficulty_encoder = OneHotEncoder(handle_unknown='ignore', sparse_output=False)
        self.is_fitted = False

    def fit(self, users_df, projects_df):
        unique_skills = set()
        for skills in projects_df['required_skills']: unique_skills.update(skills)
        for skills in users_df['skills']: unique_skills.update(skills)
        self.mlb_skills.fit([list(unique_skills)])

        unique_subjects = set()
        for subjects in users_df['subjects']: unique_subjects.update(subjects)
        self.mlb_subjects.fit([list(unique_subjects)])

        unique_interests = set()
        for interests in users_df['interests']: unique_interests.update(interests)
        self.mlb_interests.fit([list(unique_interests)])

        all_domains = pd.concat([users_df['preferred_domain'], projects_df['domain']]).unique().reshape(-1, 1)
        self.domain_encoder.fit(all_domains)

        self.difficulty_encoder.fit(projects_df['difficulty_level'].unique().reshape(-1, 1))

        self.is_fitted = True

    def get_skill_vector(self, skills_list):
        return self.mlb_skills.transform([skills_list])[0]

    def save(self, filepath="model/preprocessor.pkl"):
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        joblib.dump(self, filepath)

    @classmethod
    def load(cls, filepath="model/preprocessor.pkl"):
        return joblib.load(filepath)
