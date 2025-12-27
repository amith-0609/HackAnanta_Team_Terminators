import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { AuthProvider } from "./components/auth/AuthProvider";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { app } from "./lib/firebase";
import { useEffect } from "react";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Internships from "./pages/Internships";
import InternshipDetails from "./pages/InternshipDetails";
import InternshipMatching from "./pages/InternshipMatching";
import Resources from "./pages/Resources";
import ResourceDetails from "./pages/ResourceDetails";
import PostResource from "./pages/PostResource";
import CampusBotChat from "./pages/CampusBotChat";
import SkillProfile from "./pages/SkillProfile";
import NotFound from "./pages/NotFound";
import RoadmapGenerator from "./pages/RoadmapGenerator";


const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    if (app) {
      console.log("Firebase initialized");
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme" attribute="class">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public Route */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/landing" element={<Landing />} />

                {/* Protected Routes */}
                <Route path="/" element={<ProtectedRoute><DashboardLayout><Dashboard /></DashboardLayout></ProtectedRoute>} />
                <Route path="/internships" element={<ProtectedRoute><DashboardLayout><Internships /></DashboardLayout></ProtectedRoute>} />
                <Route path="/internships/:id" element={<ProtectedRoute><DashboardLayout><InternshipDetails /></DashboardLayout></ProtectedRoute>} />
                <Route path="/internship-matching" element={<ProtectedRoute><DashboardLayout><InternshipMatching /></DashboardLayout></ProtectedRoute>} />
                <Route path="/resources" element={<ProtectedRoute><DashboardLayout><Resources /></DashboardLayout></ProtectedRoute>} />
                <Route path="/resources/new" element={<ProtectedRoute><DashboardLayout><PostResource /></DashboardLayout></ProtectedRoute>} />
                <Route path="/resources/:id" element={<ProtectedRoute><DashboardLayout><ResourceDetails /></DashboardLayout></ProtectedRoute>} />
                <Route path="/chat" element={<ProtectedRoute><DashboardLayout><CampusBotChat /></DashboardLayout></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><DashboardLayout><SkillProfile /></DashboardLayout></ProtectedRoute>} />
                <Route path="/roadmap/:resourceId" element={<ProtectedRoute><DashboardLayout><RoadmapGenerator /></DashboardLayout></ProtectedRoute>} />


                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
