import { Bell, Search, LogIn, LogOut, User as UserIcon, LayoutDashboard, Briefcase, Sparkles, BookOpen, MessageCircle, Bot } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/auth/AuthProvider";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { toast } from "sonner";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { notifications } from "@/data/notifications";

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast.success("Signed out successfully");
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out");
    }
  };

  const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Internships", href: "/internships", icon: Briefcase },
    { name: "Matching", href: "/internship-matching", icon: Sparkles },
    { name: "Resources", href: "/resources", icon: BookOpen },
    { name: "AI Mock Interviewer", href: "/interview", icon: Bot },
  ];

  return (
    <header className="h-16 bg-card/80 backdrop-blur-md border-b border-border flex items-center justify-between px-6 sticky top-0 z-50">
      <div className="flex items-center gap-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-white">C</span>
          </div>
          <span className="text-foreground hidden sm:block">SparkShare</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link key={item.name} to={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  className={isActive ? "text-foreground font-medium" : "text-foreground bg-secondary/50"}
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.name}
                </Button>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden lg:block w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search resources..."
            className="pl-9 h-9 bg-secondary/50 border-transparent focus:bg-background transition-all"
          />
        </div>

        <ModeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-[300px] overflow-y-auto">
              {notifications.map((notification) => (
                <DropdownMenuItem key={notification.id} className="flex flex-col items-start p-3 focus:bg-accent cursor-pointer">
                  <div className="flex justify-between w-full items-start mb-1">
                    <span className={`font-medium text-sm ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {notification.title}
                    </span>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                      {notification.date}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {notification.description}
                  </p>
                </DropdownMenuItem>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full ring-2 ring-border hover:ring-primary transition-all">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.photoURL || ""} alt={user.displayName || ""} />
                  <AvatarFallback className="bg-primary/20 text-primary uppercase font-bold">
                    {user.displayName?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.displayName}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button onClick={() => navigate("/login")} size="sm" className="bg-primary text-white hover:bg-primary/90">
            <LogIn className="w-4 h-4 mr-2" />
            Sign In
          </Button>
        )}
      </div>
    </header>
  );
}
