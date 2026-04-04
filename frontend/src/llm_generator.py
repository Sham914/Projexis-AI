import os
import json
from groq import Groq
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

class GeminiGenerator:
    def __init__(self, api_key=None):
        self.api_key = api_key or os.getenv("GROQ_API_KEY")

        if self.api_key and len(self.api_key) > 5:
            self.client = Groq(api_key=self.api_key)
            self.model = 'llama-3.3-70b-versatile'
        else:
            self.client = None
            self.model = None

    def is_configured(self):
        return self.client is not None

    def _safe_generate(self, prompt, is_json=False):
        if not self.is_configured():
            return "Projexis AI Error: GROQ_API_KEY missing in .env or not detected."

        try:
            params = {
                "messages": [
                    {"role": "system", "content": "You are a World-Class Senior Software Architect and Career Mentor writing for a student career platform. You write in vivid, intelligent, flowing prose. You NEVER use bullet points or numbered lists inside any string value. You respond ONLY in the exact JSON structure requested — no extra keys, no markdown, no code fences around the JSON."},
                    {"role": "user", "content": prompt}
                ],
                "model": self.model,
                "temperature": 0.72,
                "max_tokens": 8192,
            }
            if is_json:
                params["response_format"] = {"type": "json_object"}

            response = self.client.chat.completions.create(**params)
            content = response.choices[0].message.content

            if is_json:
                try:
                    return json.loads(content)
                except Exception:
                    return {"result": content}
            return content
        except Exception as e:
            err_msg = str(e)
            if "rate limit" in err_msg.lower() or "429" in err_msg:
                return "Groq API limits reached! Please slow down or upgrade your key."
            return f"Error connecting to Groq AI Cluster: {err_msg}"

    def generate_project_details(self, user_dict, project_dict, missing_skills):
        """Singular generation fallback."""
        prompt = f"Project: {project_dict.get('title')}. User Context: {user_dict}. Return JSON with title, description, explanation, narrative_plan."
        result = self._safe_generate(prompt, is_json=True)
        if isinstance(result, str):
            return {"title": project_dict.get('title'), "description": "AI Offline", "explanation": result, "narrative_plan": "Check .env"}
        return result

    def generate_batch_project_details(self, user_dict, projects_list):
        """Generates rich narrative-style project briefings in a single bulk API call."""

        project_strings = []
        for i, proj in enumerate(projects_list):
            gaps = ', '.join(proj['missing_skills']) if proj['missing_skills'] else 'None — student already has all required skills!'
            project_strings.append(f"""
            [PROJECT {i}]
            - Name: {proj['project_dict'].get('title')}
            - Domain: {proj['project_dict'].get('domain')}
            - Full Required Tech Stack: {', '.join(proj['project_dict'].get('required_skills', []))}
            - Skills to Bridge (the student does NOT yet have these): {gaps}
            """)

        projects_block = "\n".join(project_strings)

        prompt = f"""
        You are a World-Class Senior Engineer and Career Mentor generating content for Projexis AI, a student project recommendation platform.

        STUDENT PROFILE:
        - Qualification: {user_dict.get('qualification')}, Year {user_dict.get('year')}
        - Skills the student CURRENTLY HAS: {', '.join(user_dict.get('skills', []))}

        PROJECT BATCH:
        {projects_block}

        YOUR TASK: Return a JSON object with a 'projects' array of exactly {len(projects_list)} items.
        Each item MUST have EXACTLY these 4 string keys:

        KEY 1 — "title":
        A creative, memorable, industry-standard product name. Think of how a startup would name it. Not generic.

        KEY 2 — "description":
        A single rich paragraph (5–7 sentences). Describe the full system: what it builds, the architecture pattern used (e.g., microservices, MVC, event-driven), the key libraries and APIs involved, the data flow, and its real-world impact. Be specific — name actual packages (e.g., Pandas, FastAPI, PyTorch, Socket.IO). Make a student genuinely understand what they will be creating.

        KEY 3 — "explanation":
        A single rich paragraph (4–5 sentences) written directly TO the student in second person ("You..."). Start by affirming how their existing skills give them a real head start. Then, for EACH skill listed under "Skills to Bridge", explicitly name that skill and describe its exact role in this project — what it does, where it plugs in, and why it matters. If there are no gaps, write a celebration of their full readiness. Close with a motivating sentence about the career value of completing this project.

        KEY 4 — "narrative_plan":
        A SINGLE STRING consisting of 4–6 full flowing paragraphs separated by the literal characters \\n\\n (double newline). This is NOT a list, NOT a numbered set of phases, and NOT bullets. It is a continuous narrative story of the project's development lifecycle — told as if a senior engineer is narrating the journey. Begin with the ideation and environment setup stage, move through architecture design and core feature development, describe the integration and testing phases, and conclude with deployment and future scope. Naturally weave in the exact tech stack throughout. At the precise moment in the narrative when a "Skills to Bridge" gap skill first becomes essential to the project, explicitly call it out (e.g., "This is the exact point where your new understanding of Redis becomes indispensable — it is the caching layer that..."). Use flowing, intelligent prose. Each paragraph should be meaty and detailed — at least 3–4 sentences each. Avoid vague language; be concrete about tools, steps, and decisions.

        CRITICAL RULES:
        - ALL four keys must be present for every project.
        - Do NOT use bullet points, dash lists, numbered lists, or markdown headers ANYWHERE inside any value string.
        - The "narrative_plan" is a SINGLE string — NOT an array. Use \\n\\n for paragraph breaks within it.
        - Be deeply technical. Name real libraries, design patterns, and deployment targets.
        - Write in a tone that is intelligent, warm, and encouraging — like a brilliant mentor.

        Return STRICTLY as: {{"projects": [...]}}
        """

        result = self._safe_generate(prompt, is_json=True)

        if isinstance(result, str):
            reason = result
            return [{"title": p['project_dict'].get('title'), "description": "AI Limit Reached", "explanation": reason, "narrative_plan": "Please retry in a moment."} for p in projects_list]

        arr = result.get('projects', []) if isinstance(result, dict) else []

        if not arr or not isinstance(arr, list) or len(arr) != len(projects_list):
            return [{"title": p['project_dict'].get('title'), "description": "Parse Error", "explanation": "Malformed AI Response — please retry.", "narrative_plan": "Retry generation."} for p in projects_list]

        for item in arr:
            if 'narrative_plan' in item:
                if isinstance(item['narrative_plan'], list):
                    item['narrative_plan'] = "\n\n".join([str(s) for s in item['narrative_plan']])
                elif not isinstance(item['narrative_plan'], str):
                    item['narrative_plan'] = str(item['narrative_plan'])
            else:
                item['narrative_plan'] = "Detailed narrative unavailable — please retry generation."

            if 'steps' not in item:
                item['steps'] = []

        return arr
