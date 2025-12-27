import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import { FileText, Briefcase, Users, Upload, Download } from "lucide-react";
import { resources } from "@/data/resources";
import { useRecentResources } from "@/hooks/useRecentResources";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { recentResources } = useRecentResources();

  // Extract first name for the greeting
  const firstName = user?.displayName?.split(" ")[0] || "Student";

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Welcome back, {firstName}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening on your campus today.
          </p>
        </div>
        <Button
          onClick={() => navigate("/resources/new")}
          className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload Resource
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-md border-border/60 bg-card hover:border-primary/50 transition-all hover:shadow-xl hover:shadow-primary/10">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-500" />
              </div>
              <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-0">
                +12 new
              </Badge>
            </div>
            <div className="space-y-1">
              <h2 className="text-3xl font-bold text-foreground">42</h2>
              <p className="text-sm text-muted-foreground font-medium">Resources Saved</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border-border/60 bg-card hover:border-primary/50 transition-all hover:shadow-xl hover:shadow-primary/10">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-purple-500" />
              </div>
              <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-0">
                2 pending
              </Badge>
            </div>
            <div className="space-y-1">
              <h2 className="text-3xl font-bold text-foreground">8</h2>
              <p className="text-sm text-muted-foreground font-medium">Internship Applications</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border-border/60 bg-card hover:border-primary/50 transition-all hover:shadow-xl hover:shadow-primary/10">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-orange-500" />
              </div>
            </div>
            <div className="space-y-1">
              <h2 className="text-3xl font-bold text-foreground">3</h2>
              <p className="text-sm text-muted-foreground font-medium">Active Projects</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Feed - Recent Resources */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">Recent Resources</h2>
            <Button variant="ghost" className="text-primary hover:text-primary hover:bg-primary/10" onClick={() => navigate("/resources")}>
              View All
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentResources.length > 0 ? (
              recentResources.map((resource) => (
                <Card
                  key={resource.id}
                  className="group shadow-md hover:shadow-xl transition-all border-border/60 bg-card overflow-hidden cursor-pointer hover:border-primary/50 hover:shadow-primary/10"
                  onClick={() => navigate(`/resources/${resource.id}`)}
                >
                  <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500 w-full" />
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <Badge variant="outline" className="text-xs bg-muted/50 border-border">
                        {resource.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{resource.date}</span>
                    </div>
                    <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-1">
                      {resource.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4 h-10">
                      {resource.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        By {resource.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <Download className="w-3 h-3" /> {resource.downloads}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-2 text-center py-12 px-4">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Recent Resources</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Start exploring resources to see them here!
                </p>
                <Button
                  variant="outline"
                  onClick={() => navigate("/resources")}
                  className="hover:bg-primary/10"
                >
                  Browse Resources
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Internship Matches */}
        <div className="space-y-6">
          <div className="flex items-center justify-between h-10">
            <h2 className="text-xl font-bold text-foreground">Internship Matches</h2>
          </div>

          <div className="space-y-4">
            {/* Match 1 */}
            <Card className="shadow-md hover:shadow-xl transition-all border border-gray-300 dark:border-gray-700 bg-card hover:border-primary/50 cursor-pointer" onClick={() => navigate("/internships/1")}>
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded flex items-center justify-center font-bold text-slate-500 dark:text-slate-400 text-lg">T</div>
                  <Badge className="bg-emerald-500/10 text-emerald-500 border-0 hover:bg-emerald-500/20">95% Match</Badge>
                </div>
                <h3 className="font-bold text-foreground">TechCorp Inc.</h3>
                <p className="text-xs text-muted-foreground">Bangalore • Hybrid</p>
                <div className="mt-3 font-medium text-sm text-foreground">Frontend Developer Intern</div>
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary" className="text-xs font-normal">React</Badge>
                  <Badge variant="secondary" className="text-xs font-normal">Tailwind</Badge>
                </div>
                <Button className="w-full mt-3 h-8 text-xs bg-primary hover:bg-primary/90" onClick={(e) => {
                  e.stopPropagation();
                  navigate("/internships/1");
                }}>
                  Apply Now
                </Button>
              </CardContent>
            </Card>

            {/* Match 2 */}
            <Card className="shadow-md hover:shadow-xl transition-all border border-gray-300 dark:border-gray-700 bg-card hover:border-primary/50 cursor-pointer" onClick={() => navigate("/internships/2")}>
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded flex items-center justify-center font-bold text-blue-500 text-lg">I</div>
                  <Badge className="bg-emerald-500/10 text-emerald-500 border-0 hover:bg-emerald-500/20">92% Match</Badge>
                </div>
                <h3 className="font-bold text-foreground">Innovate Labs</h3>
                <p className="text-xs text-muted-foreground">Remote</p>
                <div className="mt-3 font-medium text-sm text-foreground">UX Design Intern</div>
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary" className="text-xs font-normal">Figma</Badge>
                  <Badge variant="secondary" className="text-xs font-normal">Prototyping</Badge>
                </div>
                <Button className="w-full mt-3 h-8 text-xs bg-primary hover:bg-primary/90" onClick={(e) => {
                  e.stopPropagation();
                  navigate("/internships/2");
                }}>
                  Apply Now
                </Button>
              </CardContent>
            </Card>

            {/* Match 3 */}
            <Card className="shadow-md hover:shadow-xl transition-all border border-gray-300 dark:border-gray-700 bg-card hover:border-primary/50 cursor-pointer" onClick={() => navigate("/internships/3")}>
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded flex items-center justify-center font-bold text-orange-500 text-lg">S</div>
                  <Badge className="bg-emerald-500/10 text-emerald-500 border-0 hover:bg-emerald-500/20">88% Match</Badge>
                </div>
                <h3 className="font-bold text-foreground">StartUp X</h3>
                <p className="text-xs text-muted-foreground">Mumbai • On-site</p>
                <div className="mt-3 font-medium text-sm text-foreground">Backend Trainee</div>
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary" className="text-xs font-normal">Node.js</Badge>
                  <Badge variant="secondary" className="text-xs font-normal">MongoDB</Badge>
                </div>
                <Button className="w-full mt-3 h-8 text-xs bg-primary hover:bg-primary/90" onClick={(e) => {
                  e.stopPropagation();
                  navigate("/internships/3");
                }}>
                  Apply Now
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
