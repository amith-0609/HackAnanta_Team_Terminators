import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Rocket, Upload, CheckCircle2, ChevronDown, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function Signup() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleDemoSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        toast.success("Account created successfully!");
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-muted/30 flex flex-col font-sans">
            {/* Header */}
            <header className="w-full bg-background border-b border-border/50 py-4">
                <div className="container mx-auto px-4 flex justify-between items-center">
                    <Link to="/" className="flex items-center gap-2 font-bold text-xl text-foreground">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
                            <Rocket className="w-5 h-5 fill-current" />
                        </div>
                        CampusShare
                    </Link>
                    <div className="flex items-center gap-2 text-sm">
                        <Link to="/login">
                            <Button variant="ghost" className="font-semibold text-primary hover:text-primary/80">Log In</Button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center p-4 py-10">
                <div className="w-full max-w-5xl bg-card rounded-3xl shadow-2xl shadow-primary/5 border border-border/50 overflow-hidden flex flex-col lg:flex-row min-h-[600px]">

                    {/* Left Side - Banner */}
                    <div className="lg:w-5/12 bg-gradient-to-br from-primary to-blue-600 p-10 flex flex-col justify-between relative overflow-hidden text-white">
                        <div className="relative z-10">
                            <Badge className="bg-white/20 text-white hover:bg-white/20 border-none backdrop-blur-sm mb-6">
                                <Rocket className="w-3 h-3 mr-2" /> AI-Powered Platform
                            </Badge>
                            <h2 className="text-4xl font-extrabold leading-tight mb-4">
                                Join your campus community.
                            </h2>
                            <p className="text-blue-100 text-lg leading-relaxed">
                                Connect with peers, share academic resources, and discover internships tailored to your skills.
                            </p>
                        </div>

                        {/* Testimonial Card */}
                        <div className="relative z-10 mt-10">
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                                <div className="flex gap-1 text-yellow-400 mb-3">
                                    {[1, 2, 3, 4, 5].map(i => <span key={i}>★</span>)}
                                </div>
                                <p className="text-white font-medium italic mb-4">
                                    "CampusShare helped me find my summer internship within a week!"
                                </p>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold">S</div>
                                    <div className="text-sm">
                                        <div className="font-bold">Sarah J.</div>
                                        <div className="text-blue-200 text-xs">Computer Science</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bg Decoration */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl -ml-20 -mb-20"></div>
                    </div>

                    {/* Right Side - Form */}
                    <div className="lg:w-7/12 p-8 lg:p-12 bg-card">
                        <form onSubmit={handleDemoSubmit} className="space-y-6 max-w-lg mx-auto">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input id="name" placeholder="Enter your full name" className="h-11 bg-background" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">University Email</Label>
                                <Input id="email" type="email" placeholder="student@university.edu" className="h-11 bg-background" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="college">College / University</Label>
                                <div className="relative">
                                    <GraduationCap className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                    <Input id="college" placeholder="Search for your college" className="pl-10 h-11 bg-background" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Branch / Major</Label>
                                    <Select>
                                        <SelectTrigger className="h-11 bg-background">
                                            <SelectValue placeholder="Select Branch" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="cse">CSE</SelectItem>
                                            <SelectItem value="ece">ECE</SelectItem>
                                            <SelectItem value="mech">Mechanical</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Current Year</Label>
                                    <Select>
                                        <SelectTrigger className="h-11 bg-background">
                                            <SelectValue placeholder="Select Year" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">1st Year</SelectItem>
                                            <SelectItem value="2">2nd Year</SelectItem>
                                            <SelectItem value="3">3rd Year</SelectItem>
                                            <SelectItem value="4">4th Year</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <Label>Resume / CV <span className="text-muted-foreground font-normal">(Optional)</span></Label>
                                </div>
                                <div className="border-2 border-dashed border-border/50 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-muted/30 transition-colors cursor-pointer group bg-background/50">
                                    <Upload className="w-8 h-8 text-primary/50 mb-3 group-hover:scale-110 transition-transform" />
                                    <p className="text-sm font-semibold text-primary">Upload a file <span className="text-muted-foreground font-normal">or drag and drop</span></p>
                                    <p className="text-xs text-muted-foreground mt-1">PDF, DOCX up to 10MB</p>
                                </div>
                            </div>

                            <Button type="submit" className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base shadow-lg shadow-primary/20 mt-4">
                                Create Account
                            </Button>

                            <div className="text-center text-xs text-muted-foreground mt-4">
                                Already have an account? <Link to="/login" className="text-primary font-bold hover:underline">Log In</Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
