import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import CommunitiesPage from "./pages/CommunitiesPage";
import CommunityPage from "./pages/CommunityPage";
import PostsPage from "./pages/PostsPage";
import PostPage from "./pages/PostPage";
import ProfilePage from "./pages/ProfilePage";
import ProfileEditPage from "./pages/ProfileEditPage";
import NetworkPage from "./pages/NetworkPage";
import ConnectionsPage from "./pages/ConnectionsPage";
import HomePage from "./pages/HomePage";
import MarketplacePage from "./pages/MarketplacePage";
import EventsPage from "./pages/EventsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<Layout><HomePage /></Layout>} />
            <Route path="/dashboard" element={
              <Layout>
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              </Layout>
            } />
            <Route path="/communities" element={<Layout><CommunitiesPage /></Layout>} />
            <Route path="/community/:id" element={<Layout><CommunityPage /></Layout>} />
            <Route path="/posts" element={<Layout><PostsPage /></Layout>} />
            <Route path="/post/:id" element={<Layout><PostPage /></Layout>} />
            <Route path="/marketplace" element={<Layout><MarketplacePage /></Layout>} />
            <Route path="/events" element={<Layout><EventsPage /></Layout>} />
            <Route path="/profile/:id" element={<Layout><ProfilePage /></Layout>} />
            <Route path="/profile/edit" element={
              <Layout>
                <ProtectedRoute>
                  <ProfileEditPage />
                </ProtectedRoute>
              </Layout>
            } />
            <Route path="/network" element={
              <Layout>
                <ProtectedRoute>
                  <NetworkPage />
                </ProtectedRoute>
              </Layout>
            } />
            <Route path="/connections" element={
              <Layout>
                <ProtectedRoute>
                  <ConnectionsPage />
                </ProtectedRoute>
              </Layout>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<Layout><NotFound /></Layout>} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
