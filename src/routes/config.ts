import { lazy, ComponentType } from 'react';

// Lazy-loaded page components
const Index = lazy(() => import("@/pages/Index"));
const Auth = lazy(() => import("@/pages/Auth"));
const HomePage = lazy(() => import("@/pages/HomePage"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const CommunitiesPage = lazy(() => import("@/pages/CommunitiesPage"));
const CommunityPage = lazy(() => import("@/pages/CommunityPage"));
const CreateCommunityPage = lazy(() => import("@/pages/CreateCommunityPage"));
const PostsPage = lazy(() => import("@/pages/PostsPage"));
const PostPage = lazy(() => import("@/pages/PostPage"));
const MarketplacePage = lazy(() => import("@/pages/MarketplacePage"));
const CreateMarketplaceItemPage = lazy(() => import("@/pages/CreateMarketplaceItemPage"));
const EventsPage = lazy(() => import("@/pages/EventsPage"));
const EventDetailsPage = lazy(() => import("@/pages/EventDetailsPage"));
const CreateEventPage = lazy(() => import("@/pages/CreateEventPage"));
const BusinessesPage = lazy(() => import("@/pages/BusinessesPage"));
const BusinessPage = lazy(() => import("@/pages/BusinessPage"));
const RegisterBusinessPage = lazy(() => import("@/pages/RegisterBusinessPage"));
const BookServicePage = lazy(() => import("@/pages/BookServicePage"));
const BusinessSubscriptionPage = lazy(() => import("@/pages/BusinessSubscriptionPage"));
const CreateAdPage = lazy(() => import("@/pages/CreateAdPage").then(module => ({ default: module.CreateAdPage })));
const AdsDashboardPage = lazy(() => import("@/pages/AdsDashboardPage").then(module => ({ default: module.AdsDashboardPage })));
const BookmarksPage = lazy(() => import("@/pages/BookmarksPage"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));
const ProfileEditPage = lazy(() => import("@/pages/ProfileEditPage"));
const ProfileRedirect = lazy(() => import("@/components/ProfileRedirect"));
const NotFound = lazy(() => import("@/pages/NotFound"));

export interface RouteConfig {
  path: string;
  element: React.LazyExoticComponent<ComponentType<any>>;
  protected?: boolean;
  layout?: boolean;
  errorBoundary?: string;
}

export const routeGroups = {
  // Public routes (no authentication required)
  public: [
    { path: "/", element: Index, layout: false },
    { path: "/auth", element: Auth, layout: false },
    { path: "/home", element: HomePage, layout: true },
  ],

  // Community-related routes
  community: [
    { path: "/communities", element: CommunitiesPage, layout: true, errorBoundary: "community" },
    { path: "/community/:id", element: CommunityPage, layout: true, errorBoundary: "community" },
    { path: "/communities/create", element: CreateCommunityPage, layout: true, protected: true, errorBoundary: "community" },
  ],

  // Content routes (posts, feeds)
  content: [
    { path: "/posts", element: PostsPage, layout: true, errorBoundary: "content" },
    { path: "/post/:id", element: PostPage, layout: true, errorBoundary: "content" },
    { path: "/bookmarks", element: BookmarksPage, layout: true, errorBoundary: "content" },
  ],

  // Marketplace routes
  marketplace: [
    { path: "/marketplace", element: MarketplacePage, layout: true, errorBoundary: "marketplace" },
    { path: "/marketplace/create", element: CreateMarketplaceItemPage, layout: true, errorBoundary: "marketplace" },
  ],

  // Events routes
  events: [
    { path: "/events", element: EventsPage, layout: true, errorBoundary: "events" },
    { path: "/events/:id", element: EventDetailsPage, layout: true, errorBoundary: "events" },
    { path: "/events/create", element: CreateEventPage, layout: true, protected: true, errorBoundary: "events" },
  ],

  // Business-related routes
  business: [
    { path: "/businesses", element: BusinessesPage, layout: true, errorBoundary: "business" },
    { path: "/business/:id", element: BusinessPage, layout: true, errorBoundary: "business" },
    { path: "/register-business", element: RegisterBusinessPage, layout: true, protected: true, errorBoundary: "business" },
    { path: "/book-service/:serviceId", element: BookServicePage, layout: true, protected: true, errorBoundary: "business" },
    { path: "/business/:businessId/subscription", element: BusinessSubscriptionPage, layout: true, protected: true, errorBoundary: "business" },
  ],

  // Advertising routes
  advertising: [
    { path: "/ads-dashboard", element: AdsDashboardPage, layout: true, protected: true, errorBoundary: "advertising" },
    { path: "/create-ad", element: CreateAdPage, layout: true, protected: true, errorBoundary: "advertising" },
  ],

  // User profile routes
  profile: [
    { path: "/dashboard", element: Dashboard, layout: true, protected: true, errorBoundary: "profile" },
    { path: "/profile", element: ProfileRedirect, layout: true, protected: true, errorBoundary: "profile" },
    { path: "/profile/:id", element: ProfilePage, layout: true, errorBoundary: "profile" },
    { path: "/profile/edit", element: ProfileEditPage, layout: true, protected: true, errorBoundary: "profile" },
  ],

  // Fallback routes
  fallback: [
    { path: "*", element: NotFound, layout: true, errorBoundary: "general" },
  ],
};

// Flatten all routes for easy iteration
export const allRoutes = Object.values(routeGroups).flat();