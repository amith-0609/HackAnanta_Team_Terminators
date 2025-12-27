import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Filter,
  MapPin,
  Clock,
  DollarSign,
  Building,
  ArrowRight,
  Sparkles
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

import { internships } from "@/data/internships";

export default function Internships() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");

  const filteredInternships = internships.filter((internship) => {
    const matchesSearch = internship.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      internship.role.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

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
          <Button
            className="bg-primary text-primary-foreground shadow-md hover:bg-primary hover:text-primary-foreground"
            style={{
              transition: 'none',
              opacity: 1,
              backgroundColor: 'hsl(var(--primary))', // Enforce background color
              color: 'hsl(var(--primary-foreground))' // Enforce text color
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '1';
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.backgroundColor = 'hsl(var(--primary))';
            }}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            AI Matching
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by company, role, or skills..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
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
      <p className="text-sm text-muted-foreground">
        Showing {filteredInternships.length} internships
      </p>

      {/* Internship Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredInternships.map((internship, index) => (
          <div
            key={internship.id}
            className="block animate-fade-in-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <Card
              className="h-full interactive-card border-border hover:border-primary/30 cursor-pointer group"
              onClick={() => window.location.href = `/internships/${internship.id}`}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                    <img
                      src={internship.logo}
                      alt={internship.company}
                      className="w-10 h-10 object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">{internship.role}</h3>
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
                      <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 flex-shrink-0 border-emerald-500/20">
                        {internship.match}% match
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                      {internship.description}
                    </p>

                    <div className="flex flex-wrap gap-2 mt-3">
                      {internship.tags.map((tag) => (
                        <span
                          key={tag}
                          className="skill-badge"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {internship.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          {internship.salary}
                        </span>
                      </div>
                      <Button size="sm" className="bg-primary hover:bg-primary/90" onClick={(e) => {
                        e.stopPropagation();
                        // Handle apply logic or just navigate
                        window.location.href = `/internships/${internship.id}`;
                      }}>
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
    </div>
  );
}
