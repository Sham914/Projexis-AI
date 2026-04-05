"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Check, Loader2, Sparkles, Terminal, BookOpen, AlertCircle, SlidersHorizontal, Book, Heart } from "lucide-react";

const DOMAINS = ["AI/ML", "Web Development", "DBMS", "Cybersecurity", "Data Science", "Mobile App Dev", "Cloud Computing", "IoT"];
const SKILLS_POOL = ["Python", "TensorFlow", "PyTorch", "Scikit-Learn", "NLP", "Computer Vision", "Pandas", "NumPy", "HTML", "CSS", "JavaScript", "React", "Node.js", "Express", "MongoDB", "SQL", "Django", "Linux", "Networking", "Cryptography", "Ethical Hacking", "Bash", "Wireshark", "R", "Tableau", "PowerBI", "Machine Learning", "Statistics", "Flutter", "Dart", "Swift", "Kotlin", "Java", "React Native", "Firebase", "AWS", "Azure", "GCP", "Docker", "Kubernetes", "Terraform", "C++", "Raspberry Pi", "Arduino", "MQTT", "Git", "GitHub", "GitLab", "Bitbucket", "C Programming", "Go", "Rust", "TypeScript", "Vue.js", "Svelte", "Tailwind CSS", "Redux", "PostgreSQL", "GraphQL", "Redis", "Spark", "Hadoop", "Jenkins", "Selenium", "Ansible", "Microservices"];
const SUBJECTS_POOL = ["Data Structures", "Algorithms", "Operating Systems", "Computer Networks", "DBMS", "Software Engineering", "Artificial Intelligence", "Machine Learning", "Data Science", "Cryptography", "Advanced Mathematics", "Distributed Systems", "Computer Graphics", "Compiler Design", "Big Data Analytics", "Cloud Computing", "UI/UX Design", "Parallel Computing", "Human-Computer Interaction", "Theory of Computation"];
const INTERESTS_POOL = ["Open Source", "Research", "Product Development", "Programming", "Competitive Programming", "Hackathons", "Entrepreneurship", "Game Development", "UI/UX Design", "Technical Writing", "Digital Marketing", "Fintech", "Sustainable Tech"];
const QUALIFICATIONS_POOL = ["B.Tech", "M.Tech", "BCA", "MCA", "B.Sc", "M.Sc", "Diploma", "B.E", "M.E", "Higher Secondary"];
const sliderShellClassName = "mx-auto w-full [&_[data-slot=slider-track]]:h-3 [&_[data-slot=slider-track]]:border-indigo-500/20 [&_[data-slot=slider-track]]:bg-neutral-800/90 [&_[data-slot=slider-range]]:!bg-[#4f46e5] [&_[data-slot=slider-range]]:shadow-[0_0_16px_rgba(79,70,229,0.55)] [&_[data-slot=slider-thumb]]:size-6 [&_[data-slot=slider-thumb]]:border-indigo-200 [&_[data-slot=slider-thumb]]:bg-neutral-50";

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
      const res = await fetch("/api/recommend", {
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

      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }

      const data = await res.json();
      setProjects(data.projects || []);
    } catch (e) {
      console.error(e);
      alert("Failed to fetch recommendations. Check that the backend API is running and reachable.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.14),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(34,211,238,0.08),_transparent_28%),linear-gradient(to_bottom,_#09090b,_#050505)] text-neutral-100 flex flex-col md:flex-row font-sans selection:bg-indigo-500/30">
      {/* Sidebar Form */}
      <motion.div
        initial={{ x: -200, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full md:w-[400px] xl:w-[430px] border-r border-white/5 bg-neutral-900/35 p-6 md:p-8 flex flex-col gap-6 overflow-y-auto z-10 sticky top-0 md:h-screen shadow-[4px_0_28px_rgba(0,0,0,0.58)] backdrop-blur-2xl custom-scrollbar"
      >
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="text-indigo-400 w-7 h-7" />
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent drop-shadow-[0_0_24px_rgba(79,70,229,0.18)]">Projexis AI</h1>
        </div>

        <div className="space-y-4 rounded-2xl border border-white/5 bg-white/[0.02] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
          <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500/80">Education Profile</h3>

          <div className="space-y-2">
            <Label className="text-neutral-300">Qualification</Label>
            <Select value={qual} onValueChange={setQual}>
              <SelectTrigger className="h-11 w-full rounded-xl border-neutral-800 bg-neutral-950/70 text-md ring-offset-neutral-950 transition-colors hover:border-indigo-500/50 focus:ring-indigo-500"><SelectValue /></SelectTrigger>
              <SelectContent className="border-neutral-800 bg-neutral-900 text-neutral-200 shadow-2xl">
                {QUALIFICATIONS_POOL.map(q => <SelectItem key={q} value={q} className="focus:bg-indigo-500/20">{q}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex justify-between"><Label className="text-neutral-300">Year of Study</Label><span className="text-xs text-indigo-400 font-mono">Year {year}</span></div>
            <Slider min={1} max={4} step={1} value={[year]} onValueChange={(val) => setYear(val[0])} className={`cursor-pointer py-2 ${sliderShellClassName}`} />
          </div>

          <div className="space-y-2 pt-2">
            <Label className="text-neutral-300">Preferred Domain</Label>
            <Select value={domain} onValueChange={setDomain}>
              <SelectTrigger className="h-11 w-full rounded-xl border-neutral-800 bg-neutral-950/70 text-md ring-offset-neutral-950 transition-colors hover:border-cyan-400/50 focus:ring-cyan-400"><SelectValue /></SelectTrigger>
              <SelectContent className="border-neutral-800 bg-neutral-900 text-neutral-200 shadow-2xl">
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
          <div className="flex flex-wrap gap-2 max-h-[170px] overflow-y-auto rounded-2xl border border-neutral-800/80 bg-neutral-950/55 p-3 shadow-inner custom-scrollbar">
            {SKILLS_POOL.map(sk => (
              <Badge
                key={sk}
                variant={selectedSkills.includes(sk) ? "default" : "outline"}
                className={`cursor-pointer px-2.5 py-1 font-medium transition-all ${selectedSkills.includes(sk) ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-[0_0_18px_rgba(79,70,229,0.18)]' : 'border-neutral-700 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'}`}
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
              className="space-y-4 rounded-2xl border border-indigo-500/25 bg-indigo-950/18 p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] backdrop-blur-sm"
            >
              <Label className="text-indigo-400 text-xs font-black uppercase tracking-widest flex items-center gap-2 mb-2"><SlidersHorizontal className="w-3.5 h-3.5" /> Adjust Proficiency</Label>
              {selectedSkills.map(sk => (
                <div key={sk} className="space-y-2 group">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-neutral-200 font-medium group-hover:text-indigo-300 transition-colors">{sk}</span>
                    <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded font-mono border border-indigo-500/20">Lvl {skillProficiency[sk] || 3}</span>
                  </div>
                  <Slider min={1} max={5} step={1} value={[skillProficiency[sk] || 3]} onValueChange={(val) => setSkillProficiency({ ...skillProficiency, [sk]: val[0] })} className={`cursor-pointer py-2 ${sliderShellClassName}`} />
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
                className={`cursor-pointer px-2.5 py-1 text-xs transition-all ${selectedSubjects.includes(sub) ? 'bg-cyan-600 text-white hover:bg-cyan-500 shadow-[0_0_18px_rgba(34,211,238,0.14)]' : 'border-neutral-700 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'}`}
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
                className={`cursor-pointer px-2.5 py-1 text-xs transition-all ${selectedInterests.includes(int) ? 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-[0_0_18px_rgba(16,185,129,0.14)]' : 'border-neutral-700 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'}`}
                onClick={() => toggleInterest(int)}
              >
                {int}
              </Badge>
            ))}
          </div>
        </div>

        <Button
          className="mt-4 flex h-14 w-full items-center gap-2 rounded-xl border border-indigo-500/30 bg-gradient-to-r from-indigo-600 to-indigo-500 text-lg font-semibold text-white shadow-[0_0_30px_rgba(79,70,229,0.2)] transition-all hover:from-indigo-500 hover:to-indigo-400 hover:shadow-[0_0_40px_rgba(79,70,229,0.36)]"
          onClick={submitProfile}
          disabled={loading || selectedSkills.length === 0}
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Terminal className="w-5 h-5" />}
          {loading ? "Aligning Matrices..." : "Generate Projects"}
        </Button>
      </motion.div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 md:p-10 xl:p-14 relative isolate bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')]">
        <div className="absolute inset-0 -z-10 bg-neutral-950/96"></div>

        <div className="mx-auto w-full max-w-6xl">
          {!loading && projects.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="flex h-[62vh] flex-col items-center justify-center text-center"
            >
              <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full border border-indigo-500/15 bg-gradient-to-b from-indigo-500/10 to-transparent shadow-[0_0_44px_rgba(79,70,229,0.12)]">
                <Sparkles className="h-10 w-10 text-indigo-400 opacity-80" />
              </div>
              <h2 className="text-3xl font-light tracking-tight text-neutral-200 md:text-4xl">Ready to build your future?</h2>
              <p className="mt-4 max-w-md text-neutral-500">Configure your profile in the sidebar and let the recommendation engine assemble a project roadmap for your current level.</p>
            </motion.div>
          )}

          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex h-[50vh] flex-col items-center justify-center gap-4"
              >
                <div className="rounded-full border border-indigo-500/30 bg-gradient-to-b from-indigo-500/15 to-transparent p-4 shadow-[0_0_26px_rgba(79,70,229,0.28)]">
                  <Loader2 className="h-10 w-10 animate-spin text-indigo-300" />
                </div>
                <p className="animate-pulse font-mono text-sm uppercase tracking-widest text-indigo-300">Running Neural Inference...</p>
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
                <Card className="group overflow-hidden border-neutral-800/80 bg-neutral-900/65 shadow-[0_24px_90px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                  <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 opacity-0 transition-opacity group-hover:opacity-100"></div>

                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 font-mono">
                        {p.match_percentage.toFixed(1)}% Skill Match
                      </Badge>
                      <Badge variant="secondary" className="bg-neutral-800 text-neutral-300">{p.difficulty}</Badge>
                    </div>
                    <CardTitle className="mb-1 text-2xl font-bold tracking-tight text-neutral-100">{p.title}</CardTitle>
                    <CardDescription className="text-neutral-400 text-base flex flex-col gap-3 mt-4">
                      <div className="rounded-xl border border-neutral-800/80 bg-neutral-950/55 p-4">
                        <span className="text-indigo-400 font-semibold mb-1 flex items-center gap-2"><Sparkles className="w-4 h-4" /> AI Rationale</span>
                        <p className="text-neutral-300">{p.explanation}</p>
                      </div>
                      <p>{p.description}</p>
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="mb-6">
                      <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-neutral-500">Required Technical Stack</h4>
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
                          <span className="flex items-center gap-2"><BookOpen className="w-4 h-4" /> Full Project Narrative & Roadmap</span>
                        </AccordionTrigger>
                        <AccordionContent className="text-neutral-400 pt-4 pb-4">
                          {p.narrative_plan ? (
                            <div className="space-y-4">
                              {p.narrative_plan.split('\n\n').filter((para: string) => para.trim()).map((para: string, idx: number) => (
                                <p
                                  key={idx}
                                  className={`text-sm leading-relaxed ${idx === 0
                                    ? 'text-neutral-200 font-medium border-l-2 border-indigo-500/60 pl-4'
                                    : para.toLowerCase().includes('where') && p.missing_skills.some((sk: string) => para.toLowerCase().includes(sk.toLowerCase()))
                                      ? 'text-amber-200/90 bg-amber-500/5 border border-amber-500/15 rounded-lg px-4 py-3'
                                      : 'text-neutral-400 pl-4 border-l border-neutral-800'
                                    }`}
                                >
                                  {para.trim()}
                                </p>
                              ))}
                            </div>
                          ) : (
                            <p className="text-neutral-500 italic">Narrative unavailable — please regenerate.</p>
                          )}
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="gaps" className="border-neutral-800 border-b-0">
                        <AccordionTrigger className="hover:no-underline text-neutral-300 hover:text-rose-400 transition-colors">
                          <span className="flex items-center gap-2"><AlertCircle className="w-4 h-4" /> Skills to Bridge for This Project</span>
                        </AccordionTrigger>
                        <AccordionContent className="pt-4">
                          {p.missing_skills.length === 0 ? (
                            <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
                              <Check className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                              <div>
                                <p className="text-emerald-400 font-semibold text-sm mb-1">Complete Skill Coverage</p>
                                <p className="text-neutral-400 text-sm leading-relaxed">You already possess every skill required to build this project from scratch. Your existing toolkit maps perfectly to the technical demands of this architecture — you can begin immediately.</p>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <p className="text-neutral-400 text-sm leading-relaxed">
                                To confidently build this project, you will need to develop working knowledge in <strong className="text-rose-400">{p.missing_skills.length} area{p.missing_skills.length > 1 ? 's' : ''}</strong>. Read the project narrative above — the AI has called out precisely where each of these gaps becomes relevant in the development workflow.
                              </p>
                              <div className="flex flex-wrap gap-2 pt-1">
                                {p.missing_skills.map((sk: string) => (
                                  <span key={sk} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-medium">
                                    <AlertCircle className="w-3 h-3" />{sk}
                                  </span>
                                ))}
                              </div>
                            </div>
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
