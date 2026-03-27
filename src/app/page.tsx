"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Check, Loader2, Sparkles, ChevronRight, Terminal, BookOpen, AlertCircle, SlidersHorizontal, Book, Heart } from "lucide-react";

const DOMAINS = ["AI/ML", "Web Development", "Cybersecurity", "Data Science", "Mobile App Dev", "Cloud Computing", "IoT"];
const SKILLS_POOL = ["Python", "TensorFlow", "PyTorch", "Scikit-Learn", "NLP", "Computer Vision", "Pandas", "NumPy", "HTML", "CSS", "JavaScript", "React", "Node.js", "Express", "MongoDB", "SQL", "Django", "Linux", "Networking", "Cryptography", "Ethical Hacking", "Bash", "Wireshark", "R", "Tableau", "PowerBI", "Machine Learning", "Statistics", "Flutter", "Dart", "Swift", "Kotlin", "Java", "React Native", "Firebase", "AWS", "Azure", "GCP", "Docker", "Kubernetes", "Terraform", "C++", "Raspberry Pi", "Arduino", "MQTT", "Git", "GitHub", "GitLab", "Bitbucket", "C Programming", "Go", "Rust", "TypeScript", "Vue.js", "Svelte", "Tailwind CSS", "Redux", "PostgreSQL", "GraphQL", "Redis", "Spark", "Hadoop", "Jenkins", "Selenium", "Ansible", "Microservices"];
const SUBJECTS_POOL = ["Data Structures", "Algorithms", "Operating Systems", "Computer Networks", "DBMS", "Software Engineering", "Artificial Intelligence", "Machine Learning", "Data Science", "Cryptography", "Advanced Mathematics", "Distributed Systems", "Computer Graphics", "Compiler Design", "Big Data Analytics", "Cloud Computing", "UI/UX Design", "Parallel Computing", "Human-Computer Interaction", "Theory of Computation"];
const INTERESTS_POOL = ["Open Source", "Research", "Product Development", "Programming", "Competitive Programming", "Hackathons", "Entrepreneurship", "Game Development", "UI/UX Design", "Technical Writing", "Digital Marketing", "Fintech", "Sustainable Tech"];
const QUALIFICATIONS_POOL = ["B.Tech", "M.Tech", "BCA", "MCA", "B.Sc", "M.Sc", "Diploma", "B.E", "M.E", "Higher Secondary"];

export default function ProjexisHome() {
  const [qual, setQual] = useState("B.Tech");
  const [year, setYear] = useState(3);
  const [domain, setDomain] = useState("AI/ML");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [skillProficiency, setSkillProficiency] = useState<Record<string, number>>({});
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);

  const toggleSkill = (sk: string) => {
    if (selectedSkills.includes(sk)) {
      setSelectedSkills(selectedSkills.filter(s => s !== sk));
      const newProf = { ...skillProficiency };
      delete newProf[sk];
      setSkillProficiency(newProf);
    } else {
      setSelectedSkills([...selectedSkills, sk]);
      setSkillProficiency({ ...skillProficiency, [sk]: 3 });
    }
  };

  const toggleSubject = (sub: string) => {
    if (selectedSubjects.includes(sub)) setSelectedSubjects(selectedSubjects.filter(s => s !== sub));
    else setSelectedSubjects([...selectedSubjects, sub]);
  };

  const toggleInterest = (int: string) => {
    if (selectedInterests.includes(int)) setSelectedInterests(selectedInterests.filter(i => i !== int));
    else setSelectedInterests([...selectedInterests, int]);
  };

  const submitProfile = async () => {
    setLoading(true);
    setProjects([]);

    try {
      const res = await fetch("http://localhost:8000/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qualification: qual,
          year: year,
          preferred_domain: domain,
          skills: selectedSkills,
          skill_proficiency: skillProficiency,
          subjects: selectedSubjects,
          interests: selectedInterests
        })
      });
      const data = await res.json();
      setProjects(data.projects || []);
    } catch (e) {
      console.error(e);
      alert("Failed to fetch recommendations. Ensure FastAPI is running on port 8000.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col md:flex-row font-sans selection:bg-indigo-500/30">
      {/* Sidebar Form */}
      <motion.div
        initial={{ x: -200, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full md:w-[380px] border-r border-neutral-800/80 bg-neutral-900/40 p-8 flex flex-col gap-6 overflow-y-auto z-10 sticky top-0 md:h-screen shadow-[4px_0_24px_rgba(0,0,0,0.5)] backdrop-blur-xl custom-scrollbar"
      >
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="text-indigo-400 w-7 h-7" />
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">Projexis AI</h1>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500/80">Education Profile</h3>

          <div className="space-y-2">
            <Label className="text-neutral-300">Qualification</Label>
            <Select value={qual} onValueChange={setQual}>
              <SelectTrigger className="bg-neutral-950/50 border-neutral-800 hover:border-indigo-500/50 transition-colors h-11 text-md ring-offset-neutral-950 focus:ring-indigo-500"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-neutral-900 border-neutral-800 text-neutral-200">
                {QUALIFICATIONS_POOL.map(q => <SelectItem key={q} value={q} className="focus:bg-indigo-500/20">{q}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex justify-between"><Label className="text-neutral-300">Year of Study</Label><span className="text-xs text-indigo-400 font-mono">Year {year}</span></div>
            <Slider min={1} max={4} step={1} value={[year]} onValueChange={(val) => setYear(val[0])} className="py-2 cursor-pointer" />
          </div>

          <div className="space-y-2 pt-2">
            <Label className="text-neutral-300">Preferred Domain</Label>
            <Select value={domain} onValueChange={setDomain}>
              <SelectTrigger className="bg-neutral-950/50 border-neutral-800 hover:border-cyan-400/50 transition-colors h-11 text-md ring-offset-neutral-950 focus:ring-cyan-400"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-neutral-900 border-neutral-800 text-neutral-200">
                {DOMAINS.map(d => <SelectItem key={d} value={d} className="focus:bg-cyan-500/20">{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="w-full h-px bg-neutral-800/50 my-2"></div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500/80 flex items-center gap-2">
              <Terminal className="w-3 h-3" /> Technical Arsenal
            </h3>
            {selectedSkills.length > 0 && (
              <button
                onClick={() => { setSelectedSkills([]); setSkillProficiency({}); }}
                className="text-[10px] text-indigo-400/60 hover:text-indigo-400 uppercase font-bold tracking-tighter flex items-center gap-0.5 transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
          <Label className="text-neutral-300 text-sm">Select Your Top Skills</Label>
          <div className="flex flex-wrap gap-2 max-h-[160px] overflow-y-auto p-3 border border-neutral-800/80 rounded-xl bg-neutral-950/50 shadow-inner custom-scrollbar">
            {SKILLS_POOL.map(sk => (
              <Badge
                key={sk}
                variant={selectedSkills.includes(sk) ? "default" : "outline"}
                className={`cursor-pointer transition-all px-2 py-1 font-medium ${selectedSkills.includes(sk) ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'hover:bg-neutral-800 border-neutral-700 text-neutral-400'}`}
                onClick={() => toggleSkill(sk)}
              >
                {sk}
              </Badge>
            ))}
          </div>

          {selectedSkills.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="space-y-4 p-5 border border-indigo-500/30 rounded-2xl bg-indigo-950/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] backdrop-blur-sm"
            >
              <Label className="text-indigo-400 text-xs font-black uppercase tracking-widest flex items-center gap-2 mb-2"><SlidersHorizontal className="w-3.5 h-3.5" /> Adjust Proficiency</Label>
              {selectedSkills.map(sk => (
                <div key={sk} className="space-y-2 group">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-neutral-200 font-medium group-hover:text-indigo-300 transition-colors">{sk}</span>
                    <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded font-mono border border-indigo-500/20">Lvl {skillProficiency[sk] || 3}</span>
                  </div>
                  <Slider min={1} max={5} step={1} value={[skillProficiency[sk] || 3]} onValueChange={(val) => setSkillProficiency({ ...skillProficiency, [sk]: val[0] })} className="cursor-pointer" />
                </div>
              ))}
            </motion.div>
          )}
        </div>

        <div className="w-full h-px bg-neutral-800/50 my-2"></div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500/80 flex items-center gap-2">
              <Book className="w-3 h-3" /> Academic Foundations
            </h3>
            {selectedSubjects.length > 0 && (
              <button
                onClick={() => setSelectedSubjects([])}
                className="text-[10px] text-cyan-400/60 hover:text-cyan-400 uppercase font-bold tracking-tighter flex items-center gap-0.5 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {SUBJECTS_POOL.map(sub => (
              <Badge
                key={sub}
                variant={selectedSubjects.includes(sub) ? "default" : "outline"}
                className={`cursor-pointer transition-all px-2 py-1 text-xs ${selectedSubjects.includes(sub) ? 'bg-cyan-600 hover:bg-cyan-500 text-white' : 'hover:bg-neutral-800 border-neutral-700 text-neutral-400'}`}
                onClick={() => toggleSubject(sub)}
              >
                {sub}
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500/80 flex items-center gap-2">
              <Heart className="w-3 h-3" /> Core Interests
            </h3>
            {selectedInterests.length > 0 && (
              <button
                onClick={() => setSelectedInterests([])}
                className="text-[10px] text-emerald-400/60 hover:text-emerald-400 uppercase font-bold tracking-tighter flex items-center gap-0.5 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {INTERESTS_POOL.map(int => (
              <Badge
                key={int}
                variant={selectedInterests.includes(int) ? "default" : "outline"}
                className={`cursor-pointer transition-all px-2 py-1 text-xs ${selectedInterests.includes(int) ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'hover:bg-neutral-800 border-neutral-700 text-neutral-400'}`}
                onClick={() => toggleInterest(int)}
              >
                {int}
              </Badge>
            ))}
          </div>
        </div>

        <Button
          className="w-full mt-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-[0_0_30px_rgba(79,70,229,0.2)] hover:shadow-[0_0_40px_rgba(79,70,229,0.4)] transition-all flex items-center gap-2 h-14 text-lg font-semibold rounded-xl border border-indigo-500/30"
          onClick={submitProfile}
          disabled={loading || selectedSkills.length === 0}
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Terminal className="w-5 h-5" />}
          {loading ? "Aligning Matrices..." : "Generate Curriculum"}
        </Button>
      </motion.div>

      {/* Main Content Area */}
      <div className="flex-1 p-8 md:p-14 overflow-y-auto bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')] relative isolate">
        <div className="absolute inset-0 bg-neutral-950 opacity-[0.97] -z-10"></div>

        <div className="w-full max-w-6xl mx-auto">
          {!loading && projects.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center h-[60vh] text-center"
            >
              <div className="w-24 h-24 mb-6 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center shadow-inner">
                <Sparkles className="w-10 h-10 text-indigo-500 opacity-50" />
              </div>
              <h2 className="text-3xl font-light tracking-tight text-neutral-300">Ready to build your future?</h2>
              <p className="mt-4 text-neutral-500 max-w-md">Configure your profile in the sidebar and let our AI engine orchestrate the perfect project roadmap for your exact skill level.</p>
            </motion.div>
          )}

          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-[50vh] gap-4"
              >
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 border-t-2 border-indigo-500 rounded-full animate-spin"></div>
                  <div className="absolute inset-2 border-r-2 border-cyan-400 rounded-full animate-[spin_2s_linear_infinite_reverse]"></div>
                </div>
                <p className="text-indigo-400 font-mono text-sm tracking-widest uppercase animate-pulse">Running Neural Inference...</p>
              </motion.div>
            )}

            {!loading && projects.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="mb-8"
              >
                <Card className="bg-neutral-900/60 border-neutral-800 backdrop-blur-xl shadow-2xl overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 font-mono">
                        {(p.hybrid_score * 100).toFixed(1)}% Match Engine
                      </Badge>
                      <Badge variant="secondary" className="bg-neutral-800 text-neutral-300">{p.difficulty}</Badge>
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight text-neutral-100 mb-1">{p.title}</CardTitle>
                    <CardDescription className="text-neutral-400 text-base flex flex-col gap-3 mt-4">
                      <div className="bg-neutral-950/50 p-4 rounded-lg border border-neutral-800/80">
                        <span className="text-indigo-400 font-semibold mb-1 flex items-center gap-2"><Sparkles className="w-4 h-4" /> AI Rationale</span>
                        <p className="text-neutral-300">{p.explanation}</p>
                      </div>
                      <p>{p.description}</p>
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-neutral-500 mb-3 uppercase tracking-wider">Required Technical Stack</h4>
                      <div className="flex flex-wrap gap-2">
                        {p.tech_stack.map((ts: string) => {
                          const hasSkill = selectedSkills.includes(ts);
                          return (
                            <Badge key={ts} variant="outline" className={`
                              ${hasSkill ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}
                            `}>
                              {hasSkill ? <Check className="w-3 h-3 mr-1" /> : <AlertCircle className="w-3 h-3 mr-1" />}
                              {ts}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>

                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="plan" className="border-neutral-800">
                        <AccordionTrigger className="hover:no-underline text-neutral-300 hover:text-indigo-400 transition-colors">
                          <span className="flex items-center gap-2"><BookOpen className="w-4 h-4" /> Comprehensive Implementation Plan</span>
                        </AccordionTrigger>
                        <AccordionContent className="text-neutral-400 pt-4 pb-4">
                          <ol className="relative border-l border-neutral-800 ml-3 space-y-6">
                            {p.steps.map((step: string, idx: number) => (
                              <li key={idx} className="mb-4 ml-6 relative">
                                <span className="absolute flex items-center justify-center w-6 h-6 bg-neutral-900 rounded-full -left-[35px] ring-4 ring-neutral-950 text-xs font-bold text-neutral-500">
                                  {idx + 1}
                                </span>
                                <h3 className="mb-1 text-md font-semibold text-neutral-200">Phase {idx + 1}</h3>
                                <p className="text-base font-normal text-neutral-400">{step}</p>
                              </li>
                            ))}
                          </ol>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="gaps" className="border-neutral-800 border-b-0">
                        <AccordionTrigger className="hover:no-underline text-neutral-300 hover:text-rose-400 transition-colors">
                          <span className="flex items-center gap-2"><AlertCircle className="w-4 h-4" /> Required Knowledge Gaps to Bridge</span>
                        </AccordionTrigger>
                        <AccordionContent className="text-neutral-400 pt-4">
                          {p.missing_skills.length === 0 ? (
                            <p className="text-emerald-400">You already possess all required skills for this architecture.</p>
                          ) : (
                            <p>To successfully execute this project, you must acquire basic proficiency in: <strong className="text-rose-400">{p.missing_skills.join(", ")}</strong>. Review the Implementation Plan above where the AI has specifically highlighted how and where to inject these tools into your workflow.</p>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
