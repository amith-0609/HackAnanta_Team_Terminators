import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Upload, X, FileText, Plus } from "lucide-react";
import { db, storage } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, uploadString } from "firebase/storage";
import { useAuth } from "@/components/auth/AuthProvider";
import { Badge } from "@/components/ui/badge";

export default function PostResource() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addTag = () => {
    if (tagInput && !tags.includes(tagInput) && tags.length < 5) {
      setTags([...tags, tagInput]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to share a resource.",
        variant: "destructive",
      });
      return;
    }

    if (!file) {
      toast({
        title: "File Required",
        description: "Please upload a document to share.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please ensure file is under 10MB.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Convert File to DataURL (Base64) - Solves network timeout issues
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // 2. Upload to Firebase Storage
      const fileRef = ref(storage, `resources/${Date.now()}_${file.name}`);
      await uploadString(fileRef, dataUrl, 'data_url');
      const downloadUrl = await getDownloadURL(fileRef);

      // 3. Save Metadata to Firestore
      await addDoc(collection(db, "resources"), {
        title,
        description,
        category,
        tags,
        fileUrl: downloadUrl,
        fileName: file.name,
        fileType: file.type,
        userId: user.uid,
        userName: user.displayName || "Anonymous",
        userAvatar: user.photoURL || null,
        createdAt: serverTimestamp(),
        likes: 0,
        downloads: 0
      });

      toast({
        title: "Resource shared!",
        description: "Your resource has been successfully posted.",
      });
      navigate("/resources");
    } catch (error: any) {
      console.error("Error adding document: ", error);
      let errorMsg = error.message || "Failed to post resource. Please try again.";
      if (error.code === 'storage/unauthorized') {
        errorMsg = "Permission denied. Please check Firebase Storage Rules.";
      } else if (error.code === 'permission-denied') {
        errorMsg = "Firestore Permission Denied. Check Database Rules.";
      }
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in pb-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Share a Resource</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* File Upload Section */}
          <Card className="border-border/50 shadow-sm bg-card">
            <CardHeader>
              <CardTitle>Upload Document</CardTitle>
              <CardDescription>
                Share notes, past papers, or lab manuals.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="file">Resource File</Label>
                <div className="border-2 border-dashed border-border/50 rounded-lg p-8 text-center hover:bg-muted/30 transition-colors relative bg-background/50">
                  <Input
                    id="file"
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.ppt,.pptx"
                  />
                  <div className="flex flex-col items-center justify-center gap-2 pointer-events-none">
                    {file ? (
                      <>
                        <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary">
                          <FileText className="w-6 h-6" />
                        </div>
                        <div className="text-sm font-medium text-foreground">{file.name}</div>
                        <div className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                      </>
                    ) : (
                      <>
                        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center text-muted-foreground">
                          <Upload className="w-6 h-6" />
                        </div>
                        <div className="text-sm font-medium text-foreground">Click to upload or drag and drop</div>
                        <div className="text-xs text-muted-foreground">PDF, PPT, DOC up to 10MB</div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Details Section */}
          <Card className="border-border/50 shadow-sm bg-card">
            <CardHeader>
              <CardTitle>Resource Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="E.g., LeetCode Patterns Cheat Sheet"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-background"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what's included in this resource..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[120px] bg-background"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Using values that match your potential requirements */}
                    <SelectItem value="interview-prep">Interview Prep</SelectItem>
                    <SelectItem value="notes">Lecture Notes</SelectItem>
                    <SelectItem value="lab-manual">Lab Manual</SelectItem>
                    <SelectItem value="project">Project Report</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tags (up to 5)</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a tag and press Enter"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                    className="bg-background"
                  />
                  <Button type="button" variant="outline" onClick={addTag}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="px-3 py-1 bg-muted text-muted-foreground hover:bg-muted/80">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-2 hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSubmitting}>
            {isSubmitting ? "Uploading..." : "Publish Resource"}
          </Button>
        </div>
      </form>
    </div>
  );
}
