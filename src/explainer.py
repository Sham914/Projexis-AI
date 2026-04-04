class ExplanationEngine:
    def __init__(self):
        pass

    def skill_match_analysis(self, user_skills, project_skills):
        """Calculates percentage of required skills the user has and what's missing."""
        user_set = set(user_skills)
        project_set = set(project_skills)

        if not project_set:
            return 100.0, []

        overlap = user_set.intersection(project_set)
        missing = list(project_set - user_set)

        match_percentage = (len(overlap) / len(project_set)) * 100
        return round(match_percentage, 1), missing
