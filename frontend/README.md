# 🎓 Projexis AI — Project Recommender

Projexis is a machine learning-powered recommendation system that helps students find the best projects to work on based on their current skills, interests, and academic background.

## Features

- **Hybrid Recommendation Engine**: Combines content-based filtering (cosine similarity on encoded skills/subjects) with a machine learning model (XGBoost) trained to optimize for difficulty, domain relevance, and learning potential.
- **AI-Powered Narratives**: Uses Groq LLaMA 3.3 70B to generate rich project descriptions, personalized explanations, and full development narratives.
- **Skill Gap Analysis**: Identifies required skills the user doesn't have and weaves them into the AI-generated project narrative.
- **Premium UI**: Next.js frontend with Tailwind CSS, Framer Motion animations, and shadcn/ui components.

## Architecture

1. **Backend (FastAPI)**: `api.py` — serves `POST /api/recommend` on port 8000.
2. **Frontend (Next.js)**: `frontend/` — React 19, Tailwind CSS, Framer Motion, shadcn/ui.
3. **ML Pipeline**: `src/dataset.py`, `src/model.py`, `src/recommender.py` — XGBoost + Cosine Similarity hybrid ranking.
4. **AI Layer**: `src/llm_generator.py` — single bulk Groq API call for narrative generation.
- **Human-Readable Explanations**: A custom Explanation Engine that explicitly tells the user *why* a project was recommended based on feature matching heuristics.
- **Skill Gap Analysis & Learning Paths**: Identifies required skills the user doesn't have, and generates a step-by-step learning path to bridge the gap.
- **Rich Aesthetic UI**: Built with Next.js, TailwindCSS, and Shadcn/UI components with a full Glassmorphism design.
- **Synthetic Data Generation**: Embedded pipeline to generate realistic candidate datasets for both Users and Projects on the fly for experimentation.

## Architecture

1. **Backend Layer (FastAPI)**: Serves the REST endpoint `POST /api/recommend` running on port 8000. It delegates JSON parsing to the underlying ML components natively.
2. **Frontend Layer (Next.js & Shadcn/UI)**: Runs on React 18, utilizing TailwindCSS and absolute component control for premium animations.
3. **ML Pipeline (`dataset.py`, `model.py`, `recommender.py`)**: Uses XGBoost Regression combined with native Cosine Similarity math to weight and hybridize top-curriculums.
4. **AI Generative Layer (`llm_generator.py`)**: Asynchronously streams project definitions using `gemini-2.5-flash` natively to bridge missing UI components.

## Setup

1. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Generate data & train model** (if `model/` is empty)
   ```bash
   python src/data_generator.py
   python train.py
   ```

3. **Configure API key**
   ```bash
   cp .env.example .env
   # Edit .env and add your GROQ_API_KEY
   ```

4. **Start the FastAPI backend**
   ```bash
   python api.py
   # Runs on http://localhost:8000
   ```

5. **Start the Next.js frontend**
   ```bash
   npm install
   npm run dev
   # Runs on http://localhost:3000
   ```
