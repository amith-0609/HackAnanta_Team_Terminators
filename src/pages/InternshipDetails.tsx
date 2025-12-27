import { useParams, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MapPin, Clock, DollarSign, Building, Share2, Bookmark, FileText, GraduationCap, Users, Briefcase, CheckCircle2 } from "lucide-react";
import { ArrowUpRight } from "lucide-react";

export default function InternshipDetails() {
  const { id } = useParams();
  const location = useLocation();

  // Get job from state (passed from list) or fallback to mock if direct access (TODO: fetch by ID)
  const jobData = location.state?.job;

  if (!jobData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
        <h2 className="text-2xl font-bold mb-2">Job Not Found</h2>
        <p className="text-muted-foreground mb-4">We couldn't find the details for this job. It may have expired or the link is invalid.</p>
        <Link to="/internships">
          <Button>Browse Internships</Button>
        </Link>
      </div>
    );
  }

  // Normalize data structure
  const job = {
    title: jobData.title || jobData.role || "Untitled",
    company: jobData.company || "Unknown Company",
    location: jobData.location || "Remote",
    posted: jobData.datePosted ? new Date(jobData.datePosted).toLocaleDateString() : "Recently",
    type: jobData.employmentType || "Internship",
    stipend: jobData.salary || "Not disclosed",
    duration: "Flexible", // API doesn't always provide this
    start: "Immediate",
    match: jobData.match || 0,
    skills: (jobData.tags || []).map((tag: string) => ({ name: tag, match: true })),
    description: jobData.description || "No description available.",
    responsibilities: [], // API might not split this out
    requirements: [], // API might not split this out
    url: jobData.url || jobData.job_url || "#"
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-10">
      {/* Breadcrumb / Back */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <Link to="/" className="hover:text-primary">Home</Link>
        <span>›</span>
        <Link to="/internships" className="hover:text-primary">Internships</Link>
        <span>›</span>
        <span className="text-foreground font-medium">{job.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <Card className="border-border/50 shadow-sm bg-card">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl">
                  TS
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                    <Share2 className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                    <Bookmark className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <div className="mt-4">
                <h1 className="text-2xl font-bold text-foreground">{job.title}</h1>
                <div className="flex items-center gap-3 text-sm text-muted-foreground mt-2">
                  <span className="flex items-center gap-1 font-medium text-foreground/80">
                    <Building className="w-4 h-4" /> {job.company}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" /> {job.location}
                  </span>
                  <span>•</span>
                  <span>{job.posted}</span>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">{job.type}</Badge>
                  <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20">Paid Internship</Badge>
                  <Badge variant="secondary" className="bg-purple-500/10 text-purple-500 hover:bg-purple-500/20">{job.duration}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Job Description */}
          <Card className="border-border/50 shadow-sm bg-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <CardTitle className="text-xl">About the Role</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {job.description}
              </p>

              <div className="mt-8 space-y-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-primary" />
                  Key Responsibilities
                </h3>
                <ul className="space-y-2">
                  {job.responsibilities.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-muted-foreground text-sm">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 space-y-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-primary" />
                  Minimum Requirements
                </h3>
                <ul className="space-y-2">
                  {job.requirements.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-muted-foreground text-sm">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          {/* Action Card */}
          <Card className="border-border/50 shadow-sm bg-card sticky top-24">
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <DollarSign className="w-4 h-4" /> Stipend
                  </div>
                  <span className="font-medium text-foreground">{job.stipend}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Clock className="w-4 h-4" /> Duration
                  </div>
                  <span className="font-medium text-foreground">{job.duration}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <CalendarIcon className="w-4 h-4" /> Start Date
                  </div>
                  <span className="font-medium text-foreground">{job.start}</span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <Button
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-base shadow-lg shadow-primary/20"
                  onClick={() => window.open(job.url, '_blank')}
                >
                  Apply Now <ArrowUpRight className="ml-2 w-4 h-4" />
                </Button>
                <Button variant="outline" className="w-full border-primary/20 text-primary hover:bg-primary/10">
                  Save for Later
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Skill Match Card */}
          <Card className="border-border/50 shadow-sm bg-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                Skill Match
                <Badge variant={job.match > 80 ? "default" : "secondary"} className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-none">
                  {job.match}% Match
                </Badge>
              </CardTitle>
              <CardDescription>Based on your profile</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {job.skills.map((skill) => (
                  <div key={skill.name} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{skill.name}</span>
                    {skill.match ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-slate-700" />
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-border/50">
                <p className="text-xs text-muted-foreground">
                  You are missing 1 skill required for this role.
                  <span className="text-primary hover:underline cursor-pointer ml-1">View Learning Resources</span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* About Company Mini */}
          <Card className="border-border/50 shadow-sm bg-card">
            <CardContent className="p-6">
              <h3 className="font-bold text-foreground mb-2">About {job.company}</h3>
              <p className="text-xs text-muted-foreground mb-4">
                TechCorp is a leading innovator in enterprise software, serving Fortune 500 companies with AI-driven solutions.
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" /> 1000+
                </div>
                <div className="flex items-center gap-1">
                  <Building className="w-3 h-3" /> IT Services
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function CalendarIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </svg>
  )
}
