import { useState, useRef } from "react";
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
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";

import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth/AuthProvider";
import { storage } from "@/lib/firebase";
import { ref, uploadString } from "firebase/storage";
import { internships } from "@/data/internships";

export default function InternshipMatching() {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [userPreferences, setUserPreferences] = useState("");
  const [matchedResults, setMatchedResults] = useState<any[]>([]);

  // Resume Upload State
  const [resumeName, setResumeName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const calculateMatches = () => {
    if (!userPreferences.trim()) return [];

    const searchTerms = userPreferences.toLowerCase().split(/\s+/).filter(word => word.length > 2);

    const scoredInternships = internships.map(internship => {
      let score = 0;
      const searchableText = [
        internship.role,
        internship.company,
        internship.description,
        ...internship.tags
      ].join(" ").toLowerCase();

      searchTerms.forEach(term => {
        if (searchableText.includes(term)) {
          score += 10;
          // Bonus points for exact tag match
          if (internship.tags.some(tag => tag.toLowerCase() === term)) {
            score += 15;
          }
        }
      });

      // Normalize score to a percentage-like feel (cap at 98, min at 60 for "matches")
      // This is a heuristic for demo purposes
      let matchPercentage = Math.min(98, 60 + (score * 2));

      // If absolutely no keywords found, drop match meaningfulness
      if (score === 0) matchPercentage = 40;

      return {
        ...internship,
        match: matchPercentage,
        reasons: [`Matched on "${searchTerms.find(t => searchableText.includes(t)) || 'skills'}"`, "Skills analysis", "Role fit"]
      };
    });

    // Filter out low scores and sort by match percentage
    return scoredInternships
      .filter(i => i.match > 50)
      .sort((a, b) => b.match - a.match)
      .slice(0, 3); // Top 3
  };

  const handleAnalyze = () => {
    if (!resumeName) {
      toast({
        title: "Resume Required",
        description: "Please upload your resume first so our AI can analyze it.",
        variant: "destructive",
      });
      return;
    }

    if (!userPreferences.trim()) {
      toast({
        title: "Preferences Required",
        description: "Please tell us what kind of internship you are looking for.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    // Simulate AI Analysis time
    setTimeout(() => {
      const results = calculateMatches();
      setMatchedResults(results);
      setIsAnalyzing(false);
      setShowResults(true);
    }, 1500);
  };

  const handleBoxClick = () => {
    if (!resumeName && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate File Type
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PDF or Word document.",
        variant: "destructive",
      });
      return;
    }

    // Validate File Size (Max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Resume must be under 5MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    toast({
      title: "Uploading Resume...",
      description: "Please wait while we secure your file.",
    });

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const dataUrl = event.target?.result as string;
        const storageRef = ref(storage, `resumes/${user.uid}/${Date.now()}_${file.name}`);

        await uploadString(storageRef, dataUrl, 'data_url');
        setResumeName(file.name);

        toast({
          title: "Resume Uploaded!",
          description: "Your resume is ready for analysis.",
          className: "bg-green-600 text-white border-none",
        });
      };

      reader.onerror = () => {
        throw new Error("Failed to read file");
      };

      reader.readAsDataURL(file);

    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload Failed",
        description: "Could not upload resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeResume = (e: React.MouseEvent) => {
    e.stopPropagation();
    setResumeName(null);
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
          Let our AI analyze your skills and preferences to find the perfect internship matches for you.
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
                Upload your resume for AI-powered analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx"
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
                    <p className="font-medium">Uploading...</p>
                    <p className="text-sm text-muted-foreground mt-1">Please wait</p>
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
                    <p className="font-medium text-success">Resume Uploaded</p>
                    <p className="text-sm text-muted-foreground mt-1 break-all px-4">{resumeName}</p>
                  </div>
                ) : (
                  <>
                    <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="font-medium">Drop your resume here</p>
                    <p className="text-sm text-muted-foreground mt-1">PDF, DOC, or DOCX (max 5MB)</p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Your Preferences
              </CardTitle>
              <CardDescription>
                Tell us what you're looking for
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="E.g., I'm interested in software engineering roles at tech companies in the Bay Area. I prefer roles that involve machine learning or backend development..."
                className="min-h-[120px] resize-none"
                value={userPreferences}
                onChange={(e) => setUserPreferences(e.target.value)}
              />
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="cursor-pointer hover:bg-primary/20" onClick={() => setUserPreferences(prev => prev + " Software Engineering")}>Software Engineering</Badge>
                <Badge variant="secondary" className="cursor-pointer hover:bg-primary/20" onClick={() => setUserPreferences(prev => prev + " Machine Learning")}>Machine Learning</Badge>
                <Badge variant="secondary" className="cursor-pointer hover:bg-primary/20" onClick={() => setUserPreferences(prev => prev + " Bay Area")}>Bay Area</Badge>
                <Badge variant="secondary" className="cursor-pointer hover:bg-primary/20" onClick={() => setUserPreferences(prev => prev + " Summer 2025")}>Summer 2025</Badge>
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
            disabled={isAnalyzing || isUploading || !resumeName || !userPreferences}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Analyzing...
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
            <h2 className="text-2xl font-bold">We found {matchedResults.length} great matches!</h2>
            <p className="text-muted-foreground mt-1">Based on your skills, experience, and preferences</p>
          </div>

          <div className="space-y-4">
            {matchedResults.map((internship, index) => (
              <Link
                key={internship.id}
                to={`/internships/${internship.id}`}
                className="block animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Card className="interactive-card border-border">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                        <img
                          src={internship.logo}
                          alt={internship.company}
                          className="w-10 h-10 object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <h3 className="font-semibold text-lg">{internship.role}</h3>
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
                          {internship.reasons && internship.reasons.map((reason: string, i: number) => (
                            <span key={i} className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                              <CheckCircle2 className="w-3 h-3 text-success" />
                              {reason}
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
