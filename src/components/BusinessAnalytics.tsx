import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, Eye, Calendar, DollarSign, Users, Star } from "lucide-react";

interface BusinessAnalyticsProps {
  businessId: string;
  isPremium: boolean;
}

export function BusinessAnalytics({ businessId, isPremium }: BusinessAnalyticsProps) {
  // Mock data - in real app, fetch from supabase
  const analyticsData = [
    { date: '2024-01-01', views: 45, bookings: 8, revenue: 320, inquiries: 12 },
    { date: '2024-01-02', views: 52, bookings: 10, revenue: 400, inquiries: 15 },
    { date: '2024-01-03', views: 38, bookings: 6, revenue: 240, inquiries: 9 },
    { date: '2024-01-04', views: 61, bookings: 12, revenue: 480, inquiries: 18 },
    { date: '2024-01-05', views: 47, bookings: 9, revenue: 360, inquiries: 14 },
    { date: '2024-01-06', views: 55, bookings: 11, revenue: 440, inquiries: 16 },
    { date: '2024-01-07', views: 43, bookings: 7, revenue: 280, inquiries: 11 },
  ];

  const totalViews = analyticsData.reduce((sum, day) => sum + day.views, 0);
  const totalBookings = analyticsData.reduce((sum, day) => sum + day.bookings, 0);
  const totalRevenue = analyticsData.reduce((sum, day) => sum + day.revenue, 0);
  const totalInquiries = analyticsData.reduce((sum, day) => sum + day.inquiries, 0);

  if (!isPremium) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart className="w-5 h-5 mr-2" />
            Business Analytics
          </CardTitle>
          <CardDescription>
            Advanced analytics available with Premium subscription
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="opacity-50 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted p-4 rounded-lg">
                <div className="h-4 bg-muted-foreground/20 rounded mb-2"></div>
                <div className="h-6 bg-muted-foreground/20 rounded"></div>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <div className="h-4 bg-muted-foreground/20 rounded mb-2"></div>
                <div className="h-6 bg-muted-foreground/20 rounded"></div>
              </div>
            </div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
          <Badge className="mt-4 bg-gradient-primary text-white">
            <Star className="w-3 h-3 mr-1" />
            Premium Feature
          </Badge>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Profile Views</p>
                <p className="text-2xl font-bold">{totalViews}</p>
              </div>
              <Eye className="w-8 h-8 text-primary/60" />
            </div>
            <div className="flex items-center mt-2 text-sm">
              <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-green-600">+12%</span>
              <span className="text-muted-foreground ml-1">vs last week</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Bookings</p>
                <p className="text-2xl font-bold">{totalBookings}</p>
              </div>
              <Calendar className="w-8 h-8 text-primary/60" />
            </div>
            <div className="flex items-center mt-2 text-sm">
              <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-green-600">+8%</span>
              <span className="text-muted-foreground ml-1">vs last week</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Revenue</p>
                <p className="text-2xl font-bold">${totalRevenue}</p>
              </div>
              <DollarSign className="w-8 h-8 text-primary/60" />
            </div>
            <div className="flex items-center mt-2 text-sm">
              <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-green-600">+15%</span>
              <span className="text-muted-foreground ml-1">vs last week</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Inquiries</p>
                <p className="text-2xl font-bold">{totalInquiries}</p>
              </div>
              <Users className="w-8 h-8 text-primary/60" />
            </div>
            <div className="flex items-center mt-2 text-sm">
              <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
              <span className="text-red-600">-3%</span>
              <span className="text-muted-foreground ml-1">vs last week</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Daily Views & Bookings</CardTitle>
            <CardDescription>Last 7 days performance</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <Bar dataKey="views" fill="hsl(var(--primary))" name="Views" />
                <Bar dataKey="bookings" fill="hsl(var(--secondary))" name="Bookings" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Daily revenue over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  formatter={(value) => [`$${value}`, 'Revenue']}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}