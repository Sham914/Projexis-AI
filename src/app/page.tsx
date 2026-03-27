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
import { Check, Loader2, Sparkles, ChevronRight, Terminal, BookOpen, AlertCircle } from "lucide-react";

const DOMAINS = ["AI/ML", "Web Development", "Cybersecurity", "Data Science", "Mobile App Dev", "Cloud Computing", "IoT"];
const SKILLS_POOL = ["Python", "TensorFlow", "PyTorch", "Scikit-Learn", "NLP", "Pandas", "NumPy", "HTML", "CSS", "JavaScript", "React", "Node.js", "Express", "MongoDB", "SQL", "Django", "Linux", "Networking", "Cryptography", "Ethical Hacking", "Bash", "R", "Machine Learning", "Statistics", "Flutter", "Swift", "Kotlin", "Java", "Docker", "Kubernetes", "AWS", "C++", "Raspberry Pi"];
const SUBJECTS_POOL = ["Data Structures", "Algorithms", "Operating Systems", "Computer Networks", "DBMS", "Software Engineering"];

export default function SkillooHome() {
  const [qual, setQual] = useState("B.Tech");
  const [year, setYear] = useState(3);
  const [domain, setDomain] = useState("AI/ML");
  const [selectedSkills, setSelectedSkills] = useState<string[]>(["Python"]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);

  // Simple multi-select mock for UI (Native select in shadcn doesn't do arrays natively without extra packages easily, so we use checkboxes or simple buttons)
  const toggleSkill = (sk: string) => {
    if (selectedSkills.includes(sk)) setSelectedSkills(selectedSkills.filter(s => s !== sk));
    else setSelectedSkills([...selectedSkills, sk]);
  };

  const submitProfile = async () => {
    setLoading(true);
    setProjects([]);
    
    // In a real app we'd map all fields properly. Let's send what we have.
    try {
      const res = await fetch("http://localhost:8000/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qualification: qual,
          year: year,
          preferred_domain: domain,
          skills: selectedSkills,
          skill_proficiency: {},
          subjects: selectedSubjects,
          interests: []
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
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full md:w-[400px] border-r border-neutral-800 bg-neutral-900/50 p-6 flex flex-col gap-6 overflow-y-auto z-10 sticky top-0 md:h-screen shadow-2xl"
      >
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="text-indigo-400 w-6 h-6" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Skilloo AI</h1>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-500">Education Profile</h3>
          
          <div className="space-y-2">
            <Label>Qualification</Label>
            <Select value={qual} onValueChange={setQual}>
              <SelectTrigger className="bg-neutral-800/50 border-neutral-700"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["B.Tech", "M.Tech", "BCA", "MCA", "B.Sc"].map(q => <SelectItem key={q} value={q}>{q}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between"><Label>Year of Study</Label><span className="text-xs text-neutral-400">Year {year}</span></div>
            <Slider min={1} max={4} step={1} value={[year]} onValueChange={(val) => setYear(val[0])} className="py-2" />
          </div>

          <div className="space-y-2">
            <Label>Preferred Domain</Label>
            <Select value={domain} onValueChange={setDomain}>
              <SelectTrigger className="bg-neutral-800/50 border-neutral-700"><SelectValue /></SelectTrigger>
              <SelectContent>
                {DOMAINS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4 mt-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-500">Technical Arsenal</h3>
          <Label>Select Your Top Skills</Label>
          <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto p-2 border border-neutral-800 rounded-md bg-neutral-950/30">
            {SKILLS_POOL.slice(0, 15).map(sk => (
              <Badge 
                key={sk} 
                variant={selectedSkills.includes(sk) ? "default" : "outline"}
                className={`cursor-pointer transition-all ${selectedSkills.includes(sk) ? 'bg-indigo-600 hover:bg-indigo-700' : 'hover:bg-neutral-800 border-neutral-700 text-neutral-400'}`}
                onClick={() => toggleSkill(sk)}
              >
                {sk}
              </Badge>
            ))}
          </div>
        </div>

        <Button 
          className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all flex items-center gap-2 h-12 text-md rounded-xl"
          onClick={submitProfile}
          disabled={loading || selectedSkills.length === 0}
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Terminal className="w-5 h-5" />}
          {loading ? "Aligning Matrices..." : "Generate Curriculum"}
        </Button>
      </motion.div>

      {/* Main Content Area */}
      <div className="flex-1 p-8 md:p-12 overflow-y-auto bg-[url('https://grainy-gradients.vercel.app/noise.svg')] relative">
        <div className="absolute inset-0 bg-neutral-950 opacity-90 -z-10 mix-blend-multiply"></div>
        
        <div className="max-w-4xl mx-auto">
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
                        <span className="text-indigo-400 font-semibold mb-1 flex items-center gap-2"><Sparkles className="w-4 h-4"/> AI Rationale</span>
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
