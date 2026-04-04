import json
import csv
import random
import os

def generate_projects(num_projects=80):
    domains = ["AI/ML", "Web Development","DBMS", "Cybersecurity", "Data Science", "Mobile App Dev", "Cloud Computing", "IoT"]
    skills_pool = {
        "AI/ML": ["Python", "TensorFlow", "PyTorch", "Scikit-Learn", "NLP", "Computer Vision", "Pandas", "NumPy"],
        "Web Development": ["HTML", "CSS", "JavaScript", "React", "Node.js", "Express", "MongoDB", "SQL", "Django"],
        "DBMS": ["SQL", "MySQL", "PostgreSQL", "MongoDB", "SQLite", "DBMS", "Database Management System"],
        "Cybersecurity": ["Linux", "Networking", "Cryptography", "Ethical Hacking", "Python", "Bash", "Wireshark"],
        "Data Science": ["Python", "SQL", "R", "Tableau", "PowerBI", "Machine Learning", "Statistics"],
        "Mobile App Dev": ["Flutter", "Dart", "Swift", "Kotlin", "Java", "React Native", "Firebase"],
        "Cloud Computing": ["AWS", "Azure", "GCP", "Docker", "Kubernetes", "Linux", "Terraform"],
        "IoT": ["C++", "Python", "Raspberry Pi", "Arduino", "MQTT", "Networking"]
    }
    
    levels = ["Beginner", "Intermediate", "Advanced"]
    
    projects = []
    
    for i in range(1, num_projects + 1):
        domain = random.choice(domains)
        domain_skills = skills_pool[domain]
        req_skills = random.sample(domain_skills, k=random.randint(2, min(5, len(domain_skills))))
        level = random.choice(levels)
        
        project = {
            "project_id": f"P{i:03d}",
            "title": f"{domain} Project {i}",
            "domain": domain,
            "required_skills": req_skills,
            "difficulty_level": level,
            "estimated_duration": f"{random.randint(2, 12)} weeks",
            "tech_stack": req_skills + ["Git", "Docker"] if random.random() > 0.5 else req_skills,
            "prerequisites": random.sample(domain_skills, k=random.randint(1, 2)),
            "description": f"A comprehensive {domain} project focusing on expanding your skills in {', '.join(req_skills)}.",
            "real_world_application": f"Can be used in real-world scenarios for {domain.lower()} businesses.",
            "innovation_score": round(random.uniform(0.5, 1.0), 2),
            "industry_relevance_score": round(random.uniform(0.6, 1.0), 2),
            "step_by_step_implementation": [
                "1. Requirement Analysis",
                "2. System Design",
                "3. Core Implementation",
                "4. Testing and Validation",
                "5. Deployment"
            ],
            "expected_output": f"A fully functional {domain} application.",
            "future_enhancements": ["Add advanced features", "Improve performance", "Scale architecture"]
        }
        projects.append(project)
        
    os.makedirs("data", exist_ok=True)
    with open("data/projects.json", "w") as f:
        json.dump(projects, f, indent=4)
        
    print(f"Generated {num_projects} projects in data/projects.json")

def generate_users(num_users=60):
    qualifications = ["B.Tech", "M.Tech", "BCA", "MCA", "B.Sc", "M.Sc","Diploma","B.E","M.E"]
    years = [1, 2, 3, 4]
    
    domains = ["AI/ML", "Web Development", "Cybersecurity", "Data Science", "Mobile App Dev", "Cloud Computing", "IoT"]
    skills_pool = ["Python", "TensorFlow", "PyTorch", "Scikit-Learn", "NLP", "Computer Vision", "Pandas", "NumPy",
                  "HTML", "CSS", "JavaScript", "React", "Node.js", "Express", "MongoDB", "SQL", "Django",
                  "Linux", "Networking", "Cryptography", "Ethical Hacking", "Bash", "Wireshark",
                  "R", "Tableau", "PowerBI", "Machine Learning", "Statistics",
                  "Flutter", "Dart", "Swift", "Kotlin", "Java", "React Native", "Firebase",
                  "AWS", "Azure", "GCP", "Docker", "Kubernetes", "Terraform",
                  "C++", "Raspberry Pi", "Arduino", "MQTT"]
    
    subjects_pool = ["Data Structures", "Algorithms", "Operating Systems", "Computer Networks", "DBMS", 
                     "Software Engineering", "Artificial Intelligence", "Machine Learning", "Data Science","Cryptography","Advanced Mathematics"]
    
    interests_pool = ["Open Source", "Research", "Product Development","Programming","Competitive Programming", "Hackathons"]
    
    users = []
    
    for i in range(1, num_users + 1):
        user_skills = random.sample(skills_pool, k=random.randint(3, 8))
        skill_proficiency = {skill: random.randint(1, 5) for skill in user_skills}
        
        user = {
            "user_id": f"U{i:03d}",
            "qualification": random.choice(qualifications),
            "year": random.choice(years),
            "skills": "|".join(user_skills),
            "skill_proficiency": json.dumps(skill_proficiency),
            "subjects": "|".join(random.sample(subjects_pool, k=random.randint(2, 5))),
            "certifications": f"Cert_{random.randint(1, 10)}",
            "interests": "|".join(random.sample(interests_pool, k=random.randint(1, 4))),
            "preferred_domain": random.choice(domains),
            "past_projects": "None" if random.random() > 0.5 else f"Project_{random.randint(1, 20)}"
        }
        users.append(user)
        
    with open("data/users.csv", "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=users[0].keys())
        writer.writeheader()
        writer.writerows(users)
        
    print(f"Generated {num_users} users in data/users.csv")

if __name__ == "__main__":
    generate_projects(80)
    generate_users(60)
