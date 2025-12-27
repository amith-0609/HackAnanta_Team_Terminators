import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Briefcase, 
  BookOpen, 
  MessageCircle, 
  User,
  ChevronLeft,
  Plus,
  Sparkles,
  GraduationCap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Internships", href: "/internships", icon: Briefcase },
  { name: "AI Matching", href: "/internship-matching", icon: Sparkles },
  { name: "Resources", href: "/resources", icon: BookOpen },
  { name: "CampusBot", href: "/chat", icon: MessageCircle },
  { name: "My Profile", href: "/profile", icon: User },
];

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const location = useLocation();

  return (
    <aside
      className={cn(
        "h-screen bg-card border-r border-border flex flex-col transition-all duration-300 ease-in-out sticky top-0",
        isOpen ? "w-64" : "w-20"
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          {isOpen && (
            <span className="text-xl font-bold text-gradient">Stitch</span>
          )}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="h-8 w-8"
        >
          <ChevronLeft
            className={cn(
              "w-4 h-4 transition-transform",
              !isOpen && "rotate-180"
            )}
          />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href || 
            (item.href !== "/" && location.pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className={cn("w-5 h-5 flex-shrink-0")} />
              {isOpen && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Quick Action */}
      {isOpen && (
        <div className="p-4 border-t border-border">
          <Link to="/resources/new">
            <Button className="w-full bg-gradient-primary hover:opacity-90 shadow-md">
              <Plus className="w-4 h-4 mr-2" />
              Post Resource
            </Button>
          </Link>
        </div>
      )}
    </aside>
  );
}
