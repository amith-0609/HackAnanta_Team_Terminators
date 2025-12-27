import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Upload,
  FileText,
  CheckCircle2,
  ArrowRight,
  Loader2,
  Briefcase,
  Target,
  X,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";

import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth/AuthProvider";
import { fetchJobs, parseResume, JobListing } from "@/services/jobsApi";

export default function InternshipMatching() {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Load state from localStorage if available
  const [userPreferences, setUserPreferences] = useState(() => localStorage.getItem('match_preferences') || "");
  const [extractedSkills, setExtractedSkills] = useState<string[]>(() => {
    const saved = localStorage.getItem('match_skills');
    return saved ? JSON.parse(saved) : [];
  });
  const [matchedResults, setMatchedResults] = useState<JobListing[]>(() => {
    const saved = localStorage.getItem('match_results');
    return saved ? JSON.parse(saved) : [];
  });

  // Resume Upload State
  const [resumeName, setResumeName] = useState<string | null>(() => localStorage.getItem('match_resume_name'));
  const [isUploading, setIsUploading] = useState(false);

  // Effect to save state changes
  useEffect(() => {
    localStorage.setItem('match_preferences', userPreferences);
    localStorage.setItem('match_skills', JSON.stringify(extractedSkills));
    if (resumeName) localStorage.setItem('match_resume_name', resumeName);
    else localStorage.removeItem('match_resume_name');

    if (matchedResults.length > 0) {
      localStorage.setItem('match_results', JSON.stringify(matchedResults));
      setShowResults(true); // Auto-show results if we have them
    }
  }, [userPreferences, extractedSkills, resumeName, matchedResults]);

  const handleAnalyze = async () => {
    if (!userPreferences.trim() && extractedSkills.length === 0) {
      toast({
        title: "Input Required",
        description: "Please upload a resume or enter your preferences.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      // 1. Construct search query based on skills and preferences
      const preferenceKeywords = userPreferences.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      const allKeywords = [...extractedSkills, ...preferenceKeywords];

      // Prioritize top skills for the search query
      const mainQuery = allKeywords.slice(0, 3).join(" ") || "internship";

      console.log("Searching for:", mainQuery);

      // 2. Fetch real jobs
      const jobs = await fetchJobs({
        query: `${mainQuery} internship`,
        location: 'Remote', // Default to remote for better matches
        experienceLevels: 'intern;entry',
      });

      // 3. Calculate Match Scores locally
      const scoredJobs = jobs.map(job => {
        let score = 0;
        const jobText = `${job.title} ${job.description} ${job.company}`.toLowerCase();

        // Check for skill matches
        const matchedSkills = allKeywords.filter(skill => jobText.includes(skill.toLowerCase()));

        // Base score calculation
        score += matchedSkills.length * 15; // 15 points per skill match

        if (job.title.toLowerCase().includes('intern')) score += 20;
        if (job.location.toLowerCase().includes('remote')) score += 10;

        // Cap at 98, min 60
        let matchPercentage = Math.min(98, Math.max(60, 50 + score));

        return {
          ...job,
          match: matchPercentage,
          // Add matched skills as "reasons"
          tags: matchedSkills.slice(0, 3) // Show matched skills as tags
        };
      });

      // Sort by match score
      scoredJobs.sort((a, b) => (b.match || 0) - (a.match || 0));

      setMatchedResults(scoredJobs.slice(0, 5)); // Show top 5
      setShowResults(true);

    } catch (error) {
      console.error("Analysis failed:", error);
      toast({
        title: "Analysis Failed",
        description: "Could not fetch matches. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleBoxClick = () => {
    if (!resumeName && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast({
        title: "Invalid File",
        description: "Please upload a PDF resume.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setResumeName(file.name);

    try {
      // Call backend to parse resume
      const { skills } = await parseResume(file);

      setExtractedSkills(prev => Array.from(new Set([...prev, ...skills])));

      toast({
        title: "Resume Analyzed!",
        description: `Found ${skills.length} skills: ${skills.slice(0, 3).join(", ")}...`,
        className: "bg-green-600 text-white border-none",
      });

    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Parsing Failed",
        description: "Could not extract text from resume.",
        variant: "destructive",
      });
      setResumeName(null);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeResume = (e: React.MouseEvent) => {
    e.stopPropagation();
    setResumeName(null);
    setExtractedSkills([]);
    setMatchedResults([]);
    setShowResults(false);
    // Clear from storage
    localStorage.removeItem('match_resume_name');
    localStorage.removeItem('match_skills');
    localStorage.removeItem('match_results');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-primary mb-4 shadow-glow">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold">AI Internship Matching</h1>
        <p className="text-muted-foreground mt-2">
          Upload your resume to extract skills and find your perfect internship match.
        </p>
      </div>

      {!showResults ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Upload Resume */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Upload Resume
              </CardTitle>
              <CardDescription>
                We'll extract your skills automatically (PDF only)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf"
              />
              <div
                className={`flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-xl p-6 text-center transition-all ${isUploading
                  ? "border-primary/50 bg-primary/5 cursor-wait"
                  : resumeName
                    ? "border-success bg-success/5 cursor-default"
                    : "border-border hover:border-primary/50 cursor-pointer"
                  }`}
                onClick={handleBoxClick}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                    <p className="font-medium">Analyzing Resume...</p>
                  </>
                ) : resumeName ? (
                  <div className="relative w-full">
                    <button
                      onClick={removeResume}
                      className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:opacity-90 transition-opacity"
                      title="Remove resume"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-4" />
                    <p className="font-medium text-success">Resume Analyzed</p>
                    <p className="text-sm text-muted-foreground mt-1 break-all px-4">{resumeName}</p>
                  </div>
                ) : (
                  <>
                    <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="font-medium">Drop your resume here</p>
                    <p className="text-sm text-muted-foreground mt-1">PDF (max 5MB)</p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Preferences & Skills */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Skills & Preferences
              </CardTitle>
              <CardDescription>
                Add skills or describe your dream role
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Extracted Skills Chips */}
              {extractedSkills.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {extractedSkills.map((skill, i) => (
                    <Badge key={i} variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                      {skill}
                    </Badge>
                  ))}
                </div>
              )}

              <Textarea
                placeholder="E.g., I want a remote backend internship using Python and Django..."
                className="min-h-[100px] resize-none"
                value={userPreferences}
                onChange={(e) => setUserPreferences(e.target.value)}
              />
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="cursor-pointer hover:bg-accent" onClick={() => setExtractedSkills(prev => [...prev, "React"])}>+ React</Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-accent" onClick={() => setExtractedSkills(prev => [...prev, "Python"])}>+ Python</Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-accent" onClick={() => setExtractedSkills(prev => [...prev, "Node.js"])}>+ Node.js</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Analyze Button */}
      {!showResults && (
        <div className="flex justify-center">
          <Button
            size="lg"
            className="bg-gradient-primary hover:opacity-90 shadow-lg px-8"
            onClick={handleAnalyze}
            disabled={isAnalyzing || isUploading}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Finding Matches...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Find My Matches
              </>
            )}
          </Button>
        </div>
      )}

      {/* Results */}
      {showResults && (
        <div className="space-y-6 max-w-4xl mx-auto animate-fade-in-up">
          <div className="text-center">
            <Badge className="bg-success text-success-foreground mb-2">Analysis Complete</Badge>
            <h2 className="text-2xl font-bold">We found {matchedResults.length} matches!</h2>
            <p className="text-muted-foreground mt-1">Based on your resume skills and preferences</p>
          </div>

          <div className="space-y-4">
            {matchedResults.map((internship, index) => (
              <Link
                key={internship.id}
                to={`/internships/${internship.id}`}
                state={{ job: internship }}
                className="block animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Card className="interactive-card border-border">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                        <img
                          src={internship.companyLogo || "https://via.placeholder.com/50"}
                          alt={internship.company}
                          className="w-10 h-10 object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <h3 className="font-semibold text-lg">{internship.title}</h3>
                            <p className="text-muted-foreground">{internship.company}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-success">{internship.match}%</div>
                            <p className="text-sm text-muted-foreground">Match</p>
                          </div>
                        </div>
                        <div className="mt-3">
                          <Progress value={internship.match} className="h-2" />
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {internship.tags && internship.tags.map((tag: string, i: number) => (
                            <span key={i} className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                              <CheckCircle2 className="w-3 h-3 text-success" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={() => setShowResults(false)}>
              Refine Preferences
            </Button>
            <Link to="/internships">
              <Button className="bg-gradient-primary hover:opacity-90">
                <Briefcase className="w-4 h-4 mr-2" />
                View All Internships
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
