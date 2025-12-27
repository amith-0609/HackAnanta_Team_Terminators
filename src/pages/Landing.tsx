import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Users, Rocket, CheckCircle2, Globe, Shield, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Landing() {
    return (
        <div className="flex flex-col min-h-screen bg-background font-sans">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border/50">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xl text-foreground">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
                            <Rocket className="w-5 h-5 fill-current" />
                        </div>
                        SparkShare
                    </div>

                    <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
                        <a href="#features" className="hover:text-primary transition-colors">Features</a>
                        <a href="#about" className="hover:text-primary transition-colors">About</a>
                        <a href="#contact" className="hover:text-primary transition-colors">Contact</a>
                    </nav>

                    <div className="flex items-center gap-4">
                        <Link to="/login">
                            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">Login</Button>
                        </Link>
                        <Link to="/signup">
                            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20">Sign Up</Button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative pt-20 pb-32 overflow-hidden">
                <div className="container px-4 mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Left Content */}
                        <div className="space-y-8 animate-fade-in-up">
                            <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none px-3 py-1 text-xs font-bold tracking-wide">
                                🚀 V2.0 IS LIVE
                            </Badge>

                            <div className="space-y-2">
                                <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-tight">
                                    SparkShare
                                </h1>
                                <h2 className="text-3xl md:text-4xl font-bold text-primary">
                                    Learn • Share • Grow
                                </h2>
                            </div>

                            <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
                                The unified platform for B.Tech students. Access premium academic resources, find internships that match your skills, and collaborate across campuses with our AI-powered assistant.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link to="/signup">
                                    <Button size="lg" className="h-12 px-8 text-base bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25 w-full sm:w-auto">
                                        Get Started
                                    </Button>
                                </Link>
                                <Link to="/resources">
                                    <Button variant="outline" size="lg" className="h-12 px-8 text-base border-border text-foreground hover:bg-muted/50 w-full sm:w-auto">
                                        Explore Resources
                                    </Button>
                                </Link>
                            </div>

                            <div className="flex items-center gap-4 pt-4">
                                <div className="flex -space-x-3">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className={`w-10 h-10 rounded-full border-2 border-background overflow-hidden bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground relative z-${10 - i} shadow-sm`}>
                                            <img src={`https://i.pravatar.cc/100?img=${10 + i}`} alt="User" className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                                <div className="text-sm font-medium text-muted-foreground">
                                    Joined by <span className="text-foreground font-bold">10,000+</span> students
                                </div>
                            </div>
                        </div>

                        {/* Right Image */}
                        <div className="relative animate-fade-in delay-100">
                            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-primary/10 aspect-[4/3] group">
                                <img
                                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop"
                                    alt="Students collaborating"
                                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>

                                {/* Floating Card Overlay */}
                                <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-white/20 animate-slide-in-up">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none text-[10px] font-bold uppercase mb-2">
                                                New Internship Match
                                            </Badge>
                                            <div className="font-bold text-slate-900 text-sm md:text-base">Frontend Developer @ TechCorp</div>
                                        </div>
                                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-white stroke-[3]" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Decorative background blobs */}
                            <div className="absolute -z-10 top-10 -right-10 w-64 h-64 bg-primary/20 rounded-full blur-3xl opacity-50"></div>
                            <div className="absolute -z-10 -bottom-10 -left-10 w-64 h-64 bg-accent/20 rounded-full blur-3xl opacity-50"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 bg-muted/30 relative">
                <div className="container px-4 mx-auto">
                    <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
                            Empowering Your Growth
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Everything you need to succeed in your B.Tech journey, all in one platform.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Card 1 */}
                        <div className="group bg-card hover:bg-background p-8 rounded-3xl border border-border/50 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
                            <div className="w-14 h-14 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                                <BookOpen className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-3">Resource Hub</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                Access notes, past papers, and projects shared by top students across universities.
                            </p>
                        </div>

                        {/* Card 2 */}
                        <div className="group bg-card hover:bg-background p-8 rounded-3xl border border-border/50 shadow-sm hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300">
                            <div className="w-14 h-14 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform">
                                <BriefcaseIcon className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-3">Smart Internships</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                Get matched with internship opportunities based on your actual coding skills and interests.
                            </p>
                        </div>

                        {/* Card 3 */}
                        <div className="group bg-card hover:bg-background p-8 rounded-3xl border border-border/50 shadow-sm hover:shadow-xl hover:shadow-purple-500/5 transition-all duration-300">
                            <div className="w-14 h-14 bg-purple-500/10 rounded-full flex items-center justify-center text-purple-600 mb-6 group-hover:scale-110 transition-transform">
                                <Users className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-3">Cross-Campus Connect</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                Collaborate on projects and get instant answers from our AI-powered assistant.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 bg-background border-t border-border">
                <div className="container px-4 mx-auto text-center">
                    <div className="flex justify-center items-center gap-2 font-bold text-xl text-foreground mb-8">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
                            <Rocket className="w-5 h-5 fill-current" />
                        </div>
                        SparkShare
                    </div>

                    <div className="flex justify-center gap-8 text-sm text-muted-foreground mb-8">
                        <a href="#" className="hover:text-foreground">Privacy Policy</a>
                        <a href="#" className="hover:text-foreground">Terms of Service</a>
                        <a href="#" className="hover:text-foreground">Support</a>
                        <a href="#" className="hover:text-foreground">Careers</a>
                    </div>

                    <div className="flex justify-center gap-4 mb-8">
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted">
                            <Globe className="w-5 h-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted">
                            <Shield className="w-5 h-5" />
                        </Button>
                    </div>

                    <p className="text-xs text-muted-foreground">
                        © 2024 SparkShare. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}

function BriefcaseIcon(props: any) {
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
            <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
    )
}
