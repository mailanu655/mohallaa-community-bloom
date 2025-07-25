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
import ProfileRedirect from "./components/ProfileRedirect";
import ProfileEditPage from "./pages/ProfileEditPage";
import ProfileCompletePage from "./pages/ProfileCompletePage";
import HomePage from "./pages/HomePage";
import MarketplacePage from "./pages/MarketplacePage";
import CreateMarketplaceItemPage from "./pages/CreateMarketplaceItemPage";
import EventsPage from "./pages/EventsPage";
import EventDetailsPage from "./pages/EventDetailsPage";
import CreateEventPage from "./pages/CreateEventPage";
import CreateCommunityPage from "./pages/CreateCommunityPage";
import BusinessesPage from "./pages/BusinessesPage";
import BusinessPage from "./pages/BusinessPage";
import RegisterBusinessPage from "./pages/RegisterBusinessPage";
import BookServicePage from "./pages/BookServicePage";
import { CreateAdPage } from "./pages/CreateAdPage";
import { AdsDashboardPage } from "./pages/AdsDashboardPage";
import BusinessSubscriptionPage from "./pages/BusinessSubscriptionPage";
import BookmarksPage from "./pages/BookmarksPage";
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
            <Route path="/" element={<Index />} />
            <Route path="/home" element={<Layout><HomePage /></Layout>} />
            <Route path="/dashboard" element={
              <Layout>
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              </Layout>
            } />
            <Route path="/communities" element={<Layout><CommunitiesPage /></Layout>} />
            <Route path="/communities/create" element={<Layout><ProtectedRoute><CreateCommunityPage /></ProtectedRoute></Layout>} />
            <Route path="/community/:id" element={<Layout><CommunityPage /></Layout>} />
            <Route path="/posts" element={<Layout><PostsPage /></Layout>} />
            <Route path="/post/:id" element={<Layout><PostPage /></Layout>} />
            <Route path="/marketplace" element={<Layout><MarketplacePage /></Layout>} />
            <Route path="/marketplace/create" element={<Layout><CreateMarketplaceItemPage /></Layout>} />
            <Route path="/events" element={<Layout><EventsPage /></Layout>} />
            <Route path="/events/:id" element={<Layout><EventDetailsPage /></Layout>} />
            <Route path="/events/create" element={<Layout><ProtectedRoute><CreateEventPage /></ProtectedRoute></Layout>} />
            <Route path="/businesses" element={<Layout><BusinessesPage /></Layout>} />
            <Route path="/business/:id" element={<Layout><BusinessPage /></Layout>} />
            <Route path="/register-business" element={<Layout><ProtectedRoute><RegisterBusinessPage /></ProtectedRoute></Layout>} />
            <Route path="/book-service/:serviceId" element={<Layout><ProtectedRoute><BookServicePage /></ProtectedRoute></Layout>} />
            <Route path="/business/:businessId/subscription" element={<Layout><ProtectedRoute><BusinessSubscriptionPage /></ProtectedRoute></Layout>} />
            <Route path="/ads-dashboard" element={<Layout><ProtectedRoute><AdsDashboardPage /></ProtectedRoute></Layout>} />
            <Route path="/create-ad" element={<Layout><ProtectedRoute><CreateAdPage /></ProtectedRoute></Layout>} />
            <Route path="/bookmarks" element={<Layout><BookmarksPage /></Layout>} />
            <Route path="/profile" element={<Layout><ProtectedRoute><ProfileRedirect /></ProtectedRoute></Layout>} />
            <Route path="/profile/:id" element={<Layout><ProfilePage /></Layout>} />
            <Route path="/profile/complete" element={<ProtectedRoute><ProfileCompletePage /></ProtectedRoute>} />
            <Route path="/profile/edit" element={
              <Layout>
                <ProtectedRoute>
                  <ProfileEditPage />
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
