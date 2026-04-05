import os
import json
import re
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

    def _as_list(self, value):
        if isinstance(value, list):
            return [str(item).strip() for item in value if str(item).strip()]
        if isinstance(value, str):
            return [part.strip() for part in re.split(r"[|,]", value) if part.strip()]
        return []

    def _sorted_skill_names(self, user_dict):
        skill_proficiency = user_dict.get("skill_proficiency", {}) or {}
        if isinstance(skill_proficiency, dict) and skill_proficiency:
            def _score(item):
                try:
                    return int(item[1])
                except Exception:
                    return 0

            ordered = sorted(skill_proficiency.items(), key=lambda item: (-_score(item), str(item[0]).lower()))
            return [str(skill).strip() for skill, _ in ordered if str(skill).strip()]

        return self._as_list(user_dict.get("skills", []))

    def _format_profile_block(self, user_dict):
        skill_entries = []
        skill_proficiency = user_dict.get("skill_proficiency", {}) or {}
        if isinstance(skill_proficiency, dict) and skill_proficiency:
            for skill, level in sorted(skill_proficiency.items(), key=lambda item: (-int(item[1]) if str(item[1]).isdigit() else 0, str(item[0]).lower())):
                skill_entries.append(f"{skill} (level {level})")
        else:
            skill_entries = self._as_list(user_dict.get("skills", []))

        strongest_skills = self._sorted_skill_names(user_dict)[:4]
        subjects = self._as_list(user_dict.get("subjects", []))
        interests = self._as_list(user_dict.get("interests", []))

        return f"""
Qualification: {user_dict.get('qualification', 'N/A')}
Year of study: {user_dict.get('year', 'N/A')}
Preferred domain: {user_dict.get('preferred_domain', 'N/A')}
Current skills with proficiency: {', '.join(skill_entries) if skill_entries else 'None provided'}
Strongest skills: {', '.join(strongest_skills) if strongest_skills else 'None provided'}
Academic foundations: {', '.join(subjects) if subjects else 'None provided'}
Core interests: {', '.join(interests) if interests else 'None provided'}
""".strip()

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
        prompt = f"""
        STUDENT PROFILE:
        {self._format_profile_block(user_dict)}

        PROJECT:
        - Domain: {project_dict.get('domain')}
        - Current title: {project_dict.get('title')}
        - Required skills: {', '.join(self._as_list(project_dict.get('required_skills', [])))}
        - Skills to bridge: {', '.join(missing_skills) if missing_skills else 'None'}

        Return a JSON object with exactly four keys: title, description, explanation, narrative_plan.

        Rules:
        - Use the full student profile, not only the preferred domain.
        - The title must be a natural project name aligned to the project domain and the student's profile.
        - Never use generic placeholders like "Project 53" or "Data Project 13".
        - The description must reflect the technologies, architecture, and user context.
        - The explanation must speak directly to the student and mention the skills to bridge by name.
        - The narrative_plan must be a single rich narrative string, not a list.
        """
        result = self._safe_generate(prompt, is_json=True)
        if isinstance(result, str):
            return {"title": project_dict.get('title'), "description": "AI Offline", "explanation": result, "narrative_plan": "Check .env"}
        return result

    def generate_batch_project_details(self, user_dict, projects_list):
        """Generates rich narrative-style project briefings in a single bulk API call."""

        project_strings = []
        for i, proj in enumerate(projects_list):
            gaps = ', '.join(proj['missing_skills']) if proj['missing_skills'] else 'None — student already has all required skills!'
            overlap = ', '.join([skill for skill in self._as_list(proj['project_dict'].get('required_skills', [])) if skill in self._as_list(user_dict.get('skills', []))]) or 'None'
            project_strings.append(f"""
            [PROJECT {i}]
            - Name: {proj['project_dict'].get('title')}
            - Domain: {proj['project_dict'].get('domain')}
            - Full Required Tech Stack: {', '.join(proj['project_dict'].get('required_skills', []))}
            - Skills already matched by the student: {overlap}
            - Skills to Bridge (the student does NOT yet have these): {gaps}
            """)

        projects_block = "\n".join(project_strings)
        profile_block = self._format_profile_block(user_dict)

        prompt = f"""
        You are a World-Class Senior Engineer and Career Mentor generating content for Projexis AI, a student project recommendation platform.

        STUDENT PROFILE:
        {profile_block}

        PROJECT BATCH:
        {projects_block}

        YOUR TASK: Return a JSON object with a 'projects' array of exactly {len(projects_list)} items.
        Each item MUST have EXACTLY these 4 string keys:

        KEY 1 — "title":
        A creative, memorable, industry-standard product name. Think of how a startup would name it. Not generic. The title must be aligned to the project domain and the student's profile. Do not use labels like "Project 53", "Data Project 13", or anything that simply echoes the domain plus a number.

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
        - Use the full student profile when deciding the title, description, explanation, and narrative flow. The preferred domain is the anchor, but the skills, proficiency levels, subjects, and interests must all influence the result.
        - Never invent unrelated words. Keep the output tightly tied to the user's inputs and the project's real topic.

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

            title = str(item.get('title', '')).strip()
            if not title or re.search(r'\bproject\s*\d+\b', title, re.IGNORECASE):
                item['title'] = self._build_title_from_context(item, user_dict)

        return arr

    def _build_title_from_context(self, item, user_dict):
        domain = str(item.get('domain') or user_dict.get('preferred_domain') or 'Project').strip()
        domain_map = {
            'AI/ML': ('Adaptive', 'Engine'),
            'Web Development': ('Interactive', 'Platform'),
            'DBMS': ('Structured', 'System'),
            'Cybersecurity': ('Secure', 'Console'),
            'Data Science': ('Predictive', 'Dashboard'),
            'Mobile App Dev': ('Smart', 'App'),
            'Cloud Computing': ('Scalable', 'Orchestrator'),
            'IoT': ('Connected', 'Hub'),
        }
        adjective, noun = domain_map.get(domain, ('Adaptive', 'Platform'))
        required_skills = self._as_list(item.get('required_skills', []))
        user_skills = self._as_list(user_dict.get('skills', []))
        overlap = [skill for skill in required_skills if skill in user_skills]

        focus = overlap[0] if overlap else ''
        if not focus:
            ranked_skills = self._sorted_skill_names(user_dict)
            focus = ranked_skills[0] if ranked_skills else ''
        if not focus:
            subjects = self._as_list(user_dict.get('subjects', []))
            focus = subjects[0] if subjects else ''
        if not focus:
            interests = self._as_list(user_dict.get('interests', []))
            focus = interests[0] if interests else ''

        if focus:
            focus = re.sub(r"\s+", " ", str(focus)).strip()
            if len(focus.split()) > 3:
                focus = ' '.join(focus.split()[:3])
            return f"{adjective} {focus} {noun}".replace('  ', ' ').strip()

        return f"{adjective} {noun}".strip()
