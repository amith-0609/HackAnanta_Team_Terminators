import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Filter,
  Download,
  Eye,
  Plus,
  FileText,
  BookOpen,
  Code,
  Lightbulb,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// Firebase Imports
import { db } from "@/lib/firebase";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
// Static Data
import { resources as staticResourcesRaw } from "@/data/resources";

const categoryIcons: Record<string, React.ElementType> = {
  "Interview Prep": FileText,
  "Technical": Code,
  "Career": Lightbulb,
  "Learning": BookOpen,
};

// Interface for Resource Data
interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  fileUrl: string;
  fileName: string;
  userName: string;
  userAvatar?: string;
  views?: number;
  downloads?: number;
  createdAt: any;
  isStatic?: boolean; // Flag to identify dummy resources
}

export default function Resources() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  useEffect(() => {
    const fetchResources = async () => {
      try {
        // 1. Fetch Real Data
        const q = query(collection(db, "resources"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const fetchedResources: Resource[] = [];
        querySnapshot.forEach((doc) => {
          fetchedResources.push({ id: doc.id, ...doc.data() } as Resource);
        });

        // 2. Format Static Data to match Interface
        // @ts-ignore
        const formattedStaticResources: Resource[] = staticResourcesRaw.map(r => ({
          id: r.id.toString(),
          title: r.title,
          description: r.description,
          category: r.category,
          tags: r.tags,
          fileUrl: "", // Dummy resources might not have real file URLs
          fileName: "Resource.pdf",
          userName: r.author,
          userAvatar: r.avatar,
          views: r.views,
          downloads: r.downloads,
          createdAt: { toDate: () => new Date(r.date) }, // Mock Firestore timestamp
          isStatic: true
        }));

        // 3. Combine: Real first, then Static
        setResources([...fetchedResources, ...formattedStaticResources]);
      } catch (error) {
        console.error("Error fetching resources:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  const filteredResources = resources.filter((resource) => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "all" || resource.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Resources</h1>
          <p className="text-muted-foreground mt-1">
            Discover study materials, templates, and guides shared by the community
          </p>
        </div>
        <Link to="/resources/new">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md">
            <Plus className="w-4 h-4 mr-2" />
            Share Resource
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search resources..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-full md:w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Interview Prep">Interview Prep</SelectItem>
            <SelectItem value="Technical">Technical</SelectItem>
            <SelectItem value="Career">Career</SelectItem>
            <SelectItem value="Learning">Learning</SelectItem>
            {/* Add more categories as needed to match your upload options */}
            <SelectItem value="notes">Lecture Notes</SelectItem>
            <SelectItem value="lab-manual">Lab Manual</SelectItem>
            <SelectItem value="project">Project Report</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Resources</TabsTrigger>
          <TabsTrigger value="popular">Popular</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="saved">Saved</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {filteredResources.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No resources found. Be the first to share one!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((resource, index) => {
                const IconComponent = categoryIcons[resource.category] || FileText;
                return (
                  <Link
                    key={resource.id}
                    to={`/resources/${resource.id}`}
                    className="block animate-fade-in-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <Card className="h-full interactive-card border-border hover:border-primary/30">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-3 mb-4">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <IconComponent className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <Badge variant="secondary" className="mb-2 truncate max-w-full">{resource.category}</Badge>
                            <h3 className="font-semibold line-clamp-2">{resource.title}</h3>
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 h-10">
                          {resource.description}
                        </p>

                        <div className="flex flex-wrap gap-1 mb-4 h-6 overflow-hidden">
                          {resource.tags && resource.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="skill-badge text-xs px-2 py-0.5">
                              {tag}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-border">
                          <div className="flex items-center gap-2 max-w-[60%]">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={resource.userAvatar} />
                              <AvatarFallback>{resource.userName?.charAt(0) || "U"}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-muted-foreground truncate">{resource.userName || "Anonymous"}</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {resource.views ? (resource.views / 1000).toFixed(1) + 'k' : '0'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Download className="w-3 h-3" />
                              {resource.downloads ? (resource.downloads / 1000).toFixed(1) + 'k' : '0'}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="popular" className="mt-6">
          <div className="text-center text-muted-foreground py-12">
            Most downloaded resources will appear here
          </div>
        </TabsContent>

        <TabsContent value="recent" className="mt-6">
          <div className="text-center text-muted-foreground py-12">
            Recently added resources will appear here
          </div>
        </TabsContent>

        <TabsContent value="saved" className="mt-6">
          <div className="text-center text-muted-foreground py-12">
            Your saved resources will appear here
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
