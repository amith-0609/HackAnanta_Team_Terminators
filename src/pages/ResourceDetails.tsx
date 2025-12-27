
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  Eye,
  Bookmark,
  Share2,
  Calendar,
  FileText,
  ThumbsUp,
  Loader2,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// Static Data Import
import { resources as staticResources } from "@/data/resources";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth/AuthProvider";
import { useRecentResources } from "@/hooks/useRecentResources";

// Firebase Imports
import { db } from "@/lib/firebase";
import { doc, getDoc, deleteDoc } from "firebase/firestore";

interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  fileUrl: string;
  fileName: string;
  fileType: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  views?: number;
  downloads?: number;
  likes?: number;
  createdAt: any;
  authorBio?: string; // Optional, might not exist in current schema
}

export default function ResourceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { addRecentResource } = useRecentResources();
  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchResource = async () => {
      if (!id) return;

      setLoading(true);

      // 1. Check Static Data first (fastest)
      // @ts-ignore
      const staticMatch = staticResources.find(r => r.id.toString() === id);
      if (staticMatch) {
        setResource({
          id: staticMatch.id.toString(),
          title: staticMatch.title,
          description: staticMatch.description,
          category: staticMatch.category,
          tags: staticMatch.tags,
          fileUrl: "", // Static ones don't have real download links usually
          fileName: "Resource.pdf",
          fileType: staticMatch.type,
          userId: "static", // No real owner
          userName: staticMatch.author,
          userAvatar: staticMatch.avatar,
          views: staticMatch.views,
          downloads: staticMatch.downloads,
          likes: staticMatch.likes,
          createdAt: { toDate: () => new Date(staticMatch.date) },
          authorBio: staticMatch.authorBio
        });

        // Track this resource as recently viewed
        addRecentResource({
          id: staticMatch.id.toString(),
          title: staticMatch.title,
          description: staticMatch.description,
          category: staticMatch.category,
          author: staticMatch.author,
          downloads: staticMatch.downloads,
          date: staticMatch.date,
          tags: staticMatch.tags,
        });

        setLoading(false);
        return;
      }

      // 2. If not static, fetch from Firestore
      try {
        const docRef = doc(db, "resources", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const resourceData = { id: docSnap.id, ...docSnap.data() } as Resource;
          setResource(resourceData);

          // Track this resource as recently viewed
          addRecentResource({
            id: resourceData.id,
            title: resourceData.title,
            description: resourceData.description,
            category: resourceData.category,
            author: resourceData.userName || "Anonymous",
            downloads: resourceData.downloads || 0,
            date: resourceData.createdAt?.toDate ? resourceData.createdAt.toDate().toLocaleDateString() : "Recently",
            tags: resourceData.tags || [],
          });
        } else {
          toast({
            title: "Resource not found",
            description: "The resource you are looking for does not exist.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Error fetching resource:", error);
        toast({
          title: "Error",
          description: "Failed to load resource details.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchResource();
  }, [id, toast]);

  const handleDownload = () => {
    if (resource?.fileUrl) {
      window.open(resource.fileUrl, "_blank");
    }
  };

  const handleDelete = async () => {
    if (!resource || !user || user.uid !== resource.userId) return;

    if (!window.confirm("Are you sure you want to delete this resource? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, "resources", resource.id));
      toast({
        title: "Resource Deleted",
        description: "Your resource has been removed successfully.",
      });
      navigate("/resources");
    } catch (error) {
      console.error("Error deleting resource:", error);
      toast({
        title: "Error",
        description: "Failed to delete resource. Please try again.",
        variant: "destructive",
      });
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Resource Not Found</h2>
        <Link to="/resources">
          <Button className="mt-4">Back to Resources</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back Button */}
      <Link to="/resources">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Resources
        </Button>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <Badge className="mb-4">{resource.category}</Badge>
                {user?.uid === resource.userId && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="h-8"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {isDeleting ? "Deleting..." : "Delete"}
                  </Button>
                )}
              </div>

              <h1 className="text-2xl font-bold">{resource.title}</h1>
              <p className="text-muted-foreground mt-3 leading-relaxed">
                {resource.description}
              </p>

              <div className="flex flex-wrap gap-2 mt-4">
                {resource.tags && resource.tags.map((tag) => (
                  <span key={tag} className="skill-badge">{tag}</span>
                ))}
              </div>

              <div className="flex items-center gap-6 mt-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {resource.views ? resource.views.toLocaleString() : 0} views
                </span>
                <span className="flex items-center gap-1">
                  <Download className="w-4 h-4" />
                  {resource.downloads ? resource.downloads.toLocaleString() : 0} downloads
                </span>
                <span className="flex items-center gap-1">
                  <ThumbsUp className="w-4 h-4" />
                  {resource.likes ? resource.likes.toLocaleString() : 0} likes
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {resource.createdAt?.toDate ? resource.createdAt.toDate().toLocaleDateString() : 'Recently'}
                </span>
              </div>

              <div className="flex gap-3 mt-6">
                <Button className="flex-1 bg-gradient-primary hover:opacity-90" onClick={handleDownload}>
                  <Download className="w-4 h-4 mr-2" />
                  Download File
                </Button>
                <Button variant="outline" size="icon">
                  <Bookmark className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Content Preview (Placeholder for PDF viewer or text extract) */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>File Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center p-4 bg-muted/30 rounded-lg border border-border/50">
                <FileText className="w-8 h-8 text-primary mr-4" />
                <div>
                  <p className="font-medium">{resource.fileName}</p>
                  <p className="text-sm text-muted-foreground">{resource.fileType || "Document"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Author Card */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>About the Author</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarImage src={resource.userAvatar} />
                  <AvatarFallback>{resource.userName?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{resource.userName || "Anonymous"}</p>
                  <p className="text-sm text-muted-foreground">Student at CampusShare</p>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4">
                View Profile
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
