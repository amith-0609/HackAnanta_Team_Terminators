import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Filter,
  MapPin,
  DollarSign,
  Building,
  Sparkles,
  Loader2,
  AlertCircle,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { fetchJobs, JobListing } from "@/services/jobsApi";
import { internships } from "@/data/internships";

export default function Internships() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useStaticData, setUseStaticData] = useState(false);

  // Load initial jobs
  useEffect(() => {
    const loadJobs = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const fetchedJobs = await fetchJobs({
          query: 'internship',
          experienceLevels: 'intern;entry',
          employmentTypes: 'intern;fulltime;parttime',
          datePosted: 'month',
        });

        if (fetchedJobs.length > 0) {
          setJobs(fetchedJobs);
          setUseStaticData(false);
        } else {
          setJobs(internships as any);
          setUseStaticData(true);
        }
      } catch (err: any) {
        console.error('Error fetching jobs:', err);
        if (err.message?.includes('429')) {
          setError('⚠️ API rate limit reached. Showing sample data. Search works with sample data!');
        } else {
          setError('Failed to load live data. Showing sample data.');
        }
        setJobs(internships as any);
        setUseStaticData(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadJobs();
  }, []);

  // Smart filtering with search
  const filteredInternships = searchQuery
    ? jobs.filter((job) => {
      const query = searchQuery.toLowerCase();
      return (
        job.company.toLowerCase().includes(query) ||
        job.title?.toLowerCase().includes(query) ||
        job.role?.toLowerCase().includes(query) ||
        job.description?.toLowerCase().includes(query) ||
        job.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    })
    : jobs;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Internships</h1>
          <p className="text-muted-foreground mt-1">
            Discover opportunities matched to your skills and interests
          </p>
        </div>
        <Link to="/internship-matching">
          <Button className="bg-primary text-primary-foreground shadow-md">
            <Sparkles className="w-4 h-4 mr-2" />
            AI Matching
          </Button>
        </Link>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert>
          <AlertCircle className="h-4 h-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading internships...</p>
        </div>
      ) : (
        <>
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex flex-1 gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search jobs (e.g., frontend developer)..."
                  className="pl-9 pr-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <Button className="bg-primary hover:bg-primary/90">
                Search
              </Button>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="summer">Summer</SelectItem>
                <SelectItem value="fall">Fall</SelectItem>
                <SelectItem value="spring">Spring</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results count */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {filteredInternships.length} {searchQuery ? `results for "${searchQuery}"` : 'internships'}
              {useStaticData && <span className="ml-2 text-xs">(Sample Data)</span>}
            </p>
          </div>

          {/* Internship Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredInternships.map((internship, index) => (
              <div
                key={internship.id}
                className="block animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <Card className="h-full interactive-card border-border hover:border-primary/30 cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                        {internship.logo || internship.companyLogo ? (
                          <img
                            src={internship.logo || internship.companyLogo}
                            alt={internship.company}
                            className="w-10 h-10 object-contain"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              // Try Google Favicon as backup if not already tried
                              if (!target.src.includes('google.com/s2/favicons')) {
                                target.src = `https://www.google.com/s2/favicons?domain=${internship.company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com&sz=64`;
                              } else {
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-semibold text-lg">${internship.company.substring(0, 2).toUpperCase()}</div>`;
                                }
                              }
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-semibold text-lg">
                            {internship.company.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                                {internship.role || internship.title}
                              </h3>
                              {internship.isNew && (
                                <Badge className="bg-primary text-primary-foreground text-xs">
                                  New
                                </Badge>
                              )}
                            </div>
                            <p className="text-muted-foreground flex items-center gap-1 mt-1">
                              <Building className="w-4 h-4" />
                              {internship.company}
                            </p>
                          </div>
                          {internship.match && (
                            <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 flex-shrink-0 border-emerald-500/20">
                              {internship.match}% match
                            </Badge>
                          )}
                        </div>

                        {/* Description */}
                        <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                          {internship.description || 'No description available'}
                        </p>

                        {internship.tags && internship.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {internship.tags.map((tag) => (
                              <span key={tag} className="skill-badge">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {internship.location}
                            </span>
                            {internship.salary && (
                              <span className="flex items-center gap-1">
                                <DollarSign className="w-4 h-4" />
                                {internship.salary}
                              </span>
                            )}
                          </div>
                          <Button
                            size="sm"
                            className="bg-primary hover:bg-primary/90"
                            onClick={() => window.open(internship.url || '#', '_blank')}
                          >
                            Apply Now
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
