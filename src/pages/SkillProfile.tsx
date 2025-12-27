import { useState, useEffect, useRef } from "react";
import {
  User,
  Mail,
  MapPin,
  GraduationCap,
  Briefcase,
  Github,
  Linkedin,
  Globe,
  Edit2,
  Plus,
  X,
  Save,
  Camera,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/AuthProvider";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, uploadString } from "firebase/storage";
import { updateProfile } from "firebase/auth";
import { db, storage } from "@/lib/firebase";

interface Experience {
  id: number;
  title: string;
  company: string;
  location: string;
  duration: string;
  description: string;
}

interface Project {
  id: number;
  name: string;
  description: string;
  tags: string[];
}

interface UserProfileData {
  bio: string;
  currYear: string;
  major: string;
  school: string;
  location: string;
  skills: string[];
  links: {
    github: string;
    linkedin: string;
    website: string;
  };
  experiences: Experience[];
  projects: Project[];
}

const defaultProfile: UserProfileData = {
  bio: "Passionate B.Tech student looking to make an impact through technology.",
  currYear: "3rd Year",
  major: "Computer Science",
  school: "University Institute of Technology",
  location: "New Delhi, India",
  skills: ["Python", "Java", "React"],
  links: {
    github: "github.com/",
    linkedin: "linkedin.com/in/",
    website: "portfolio.dev",
  },
  experiences: [],
  projects: []
};

export default function SkillProfile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [profileData, setProfileData] = useState<UserProfileData>(defaultProfile);
  const [newSkill, setNewSkill] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch Profile Data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProfileData({ ...defaultProfile, ...docSnap.data() as UserProfileData });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile data.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  // Handle Save
  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await setDoc(doc(db, "users", user.uid), profileData, { merge: true });
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  // Handle Avatar Upload
  const handleAvatarClick = () => {
    if (isEditing && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File is too large. Please choose an image under 5MB.");
      return;
    }

    if (isUploading) return; // Prevent concurrent uploads
    setIsUploading(true);
    const toastId = toast.loading("Uploading image...", { id: "upload-toast" }); // Use fixed ID to prevent stacking

    try {
      console.log("Starting upload to users/" + user.uid);
      const storageRef = ref(storage, `avatars/${user.uid}`);

      // Create a timeout promise that rejects after 15 seconds
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Upload timed out. Check your internet connection or firewall.")), 15000);
      });

      // Race the upload against the timeout
      await Promise.race([
        uploadBytes(storageRef, file),
        timeoutPromise
      ]);

      console.log("Upload done, getting URL");
      const downloadURL = await getDownloadURL(storageRef);

      console.log("Updating profile with URL:", downloadURL);
      await updateProfile(user, { photoURL: downloadURL });

      console.log("Success");
      toast.dismiss(toastId);
      toast.success("Profile picture updated!");

      // Clear file input so same file can be selected again if needed
      if (fileInputRef.current) fileInputRef.current.value = "";

    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      toast.dismiss(toastId);

      let msg = "Failed to upload image.";
      if (error.code === "storage/unauthorized") {
        msg = "Permission denied: Check Storage Rules.";
      } else if (error.message) {
        msg = error.message;
      }
      toast.error(msg);
    } finally {
      setIsUploading(false);
      // Ensure specific toast is definitely gone
      setTimeout(() => toast.dismiss("upload-toast"), 100);
    }
  };

  // Skill Handlers
  const addSkill = () => {
    if (newSkill && !profileData.skills.includes(newSkill)) {
      setProfileData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill]
      }));
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setProfileData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skillToRemove)
    }));
  };

  if (loading) {
    return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <Button
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          disabled={saving}
          className={isEditing ? "bg-primary hover:bg-primary/90 min-w-[140px]" : "min-w-[140px]"}
          variant={isEditing ? "default" : "outline"}
        >
          {saving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : isEditing ? (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </>
          ) : (
            <>
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Profile
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Personal Info */}
        <Card className="shadow-lg border-border/50 h-fit lg:sticky lg:top-24">
          <CardContent className="p-6">
            <div className="text-center relative">
              <div className="relative inline-block group">
                <Avatar
                  className={`h-28 w-28 mx-auto mb-4 border-4 border-background shadow-md ${isEditing ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                  onClick={handleAvatarClick}
                >
                  <AvatarImage src={user?.photoURL || ""} className="object-cover" />
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                    {user?.displayName?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <Camera className="text-white w-8 h-8" />
                  </div>
                )}
                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full z-10">
                    <Loader2 className="text-white w-8 h-8 animate-spin" />
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>

              <h2 className="text-2xl font-bold text-foreground">{user?.displayName || "Student"}</h2>

              {isEditing ? (
                <div className="space-y-2 mt-2">
                  <Input
                    value={profileData.major}
                    onChange={(e) => setProfileData({ ...profileData, major: e.target.value })}
                    placeholder="Major (e.g. CS)"
                    className="text-center text-sm h-8"
                  />
                  <Input
                    value={profileData.school}
                    onChange={(e) => setProfileData({ ...profileData, school: e.target.value })}
                    placeholder="University"
                    className="text-center text-sm h-8"
                  />
                  <Input
                    value={profileData.currYear}
                    onChange={(e) => setProfileData({ ...profileData, currYear: e.target.value })}
                    placeholder="Year"
                    className="text-center text-sm h-8 w-24 mx-auto"
                  />
                </div>
              ) : (
                <>
                  <p className="text-muted-foreground flex items-center justify-center gap-1 mt-1 font-medium">
                    <GraduationCap className="w-4 h-4 text-primary" />
                    {profileData.major}
                  </p>
                  <p className="text-sm text-muted-foreground opacity-80">{profileData.school} • {profileData.currYear}</p>
                </>
              )}
            </div>

            <Separator className="my-6" />

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="truncate" title={user?.email || ""}>{user?.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                {isEditing ? (
                  <Input
                    value={profileData.location}
                    onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                    placeholder="Location"
                    className="h-8"
                  />
                ) : (
                  <span>{profileData.location}</span>
                )}
              </div>
            </div>

            <Separator className="my-6" />

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Github className="w-4 h-4 text-muted-foreground" />
                {isEditing ? (
                  <Input value={profileData.links.github} onChange={e => setProfileData({ ...profileData, links: { ...profileData.links, github: e.target.value } })} className="h-8 text-xs" placeholder="Github URL" />
                ) : (
                  <a href={`https://${profileData.links.github}`} target="_blank" className="text-sm hover:text-primary transition-colors truncate">{profileData.links.github}</a>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Linkedin className="w-4 h-4 text-muted-foreground" />
                {isEditing ? (
                  <Input value={profileData.links.linkedin} onChange={e => setProfileData({ ...profileData, links: { ...profileData.links, linkedin: e.target.value } })} className="h-8 text-xs" placeholder="LinkedIn URL" />
                ) : (
                  <a href={`https://${profileData.links.linkedin}`} target="_blank" className="text-sm hover:text-primary transition-colors truncate">{profileData.links.linkedin}</a>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-muted-foreground" />
                {isEditing ? (
                  <Input value={profileData.links.website} onChange={e => setProfileData({ ...profileData, links: { ...profileData.links, website: e.target.value } })} className="h-8 text-xs" placeholder="Portfolio URL" />
                ) : (
                  <a href={`https://${profileData.links.website}`} target="_blank" className="text-sm hover:text-primary transition-colors truncate">{profileData.links.website}</a>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-6">

          {/* About Me */}
          <Card className="shadow-sm border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="w-5 h-5 text-primary" />
                About Me
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  className="min-h-[120px] resize-none"
                  placeholder="Tell us about yourself..."
                />
              ) : (
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{profileData.bio}</p>
              )}
            </CardContent>
          </Card>

          {/* Skills (Tag Based) */}
          <Card className="shadow-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Badge variant="outline" className="h-6 w-6 rounded-full p-0 flex items-center justify-center border-primary text-primary">⚡</Badge>
                Skills & Technologies
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Skills List */}
              <div className="flex flex-wrap gap-2 mb-4">
                {profileData.skills.length === 0 && <span className="text-muted-foreground text-sm italic">No skills added yet.</span>}

                {profileData.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="px-3 py-1 text-sm bg-secondary/50 hover:bg-secondary border border-border/50">
                    {skill}
                    {isEditing && (
                      <button
                        onClick={() => removeSkill(skill)}
                        className="ml-2 hover:text-destructive transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </Badge>
                ))}
              </div>

              {/* Add Skill Input */}
              {isEditing && (
                <div className="flex gap-2 max-w-sm">
                  <Input
                    placeholder="Add a skill (e.g. Python)"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                    className="flex-1"
                  />
                  <Button size="icon" variant="outline" onClick={addSkill} disabled={!newSkill}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Experience Placeholder - Simplified for now */}
          <Card className="shadow-sm border-border/50 opacity-80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Briefcase className="w-5 h-5 text-primary" />
                Experience
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm italic">Experience section coming soon...</p>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
