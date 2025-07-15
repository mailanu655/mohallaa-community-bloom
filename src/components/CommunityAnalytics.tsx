import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Users, MessageSquare, Calendar, Activity, Crown } from "lucide-react";

interface CommunityAnalyticsProps {
  communityId: string;
  isModerator: boolean;
}

export default function CommunityAnalytics({ communityId, isModerator }: CommunityAnalyticsProps) {
  // Mock data - in real app, fetch from supabase
  const analyticsData = [
    { date: '2024-01-01', newMembers: 12, activeMembers: 45, posts: 8, events: 2 },
    { date: '2024-01-02', newMembers: 15, activeMembers: 52, posts: 12, events: 1 },
    { date: '2024-01-03', newMembers: 8, activeMembers: 38, posts: 6, events: 3 },
    { date: '2024-01-04', newMembers: 18, activeMembers: 61, posts: 15, events: 2 },
    { date: '2024-01-05', newMembers: 14, activeMembers: 47, posts: 9, events: 1 },
    { date: '2024-01-06', newMembers: 16, activeMembers: 55, posts: 11, events: 4 },
    { date: '2024-01-07', newMembers: 11, activeMembers: 43, posts: 7, events: 2 },
  ];

  const totalNewMembers = analyticsData.reduce((sum, day) => sum + day.newMembers, 0);
  const totalPosts = analyticsData.reduce((sum, day) => sum + day.posts, 0);
  const totalEvents = analyticsData.reduce((sum, day) => sum + day.events, 0);
  const avgActiveMembers = Math.round(analyticsData.reduce((sum, day) => sum + day.activeMembers, 0) / analyticsData.length);

  if (!isModerator) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart className="w-5 h-5 mr-2" />
            Community Analytics
          </CardTitle>
          <CardDescription>
            Advanced analytics available for community moderators
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Badge className="mt-4 bg-gradient-primary text-white">
            <Crown className="w-3 h-3 mr-1" />
            Moderator Feature
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
                <p className="text-sm font-medium text-muted-foreground">New Members</p>
                <p className="text-2xl font-bold">{totalNewMembers}</p>
              </div>
              <Users className="w-8 h-8 text-primary/60" />
            </div>
            <div className="flex items-center mt-2 text-sm">
              <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-green-600">+22%</span>
              <span className="text-muted-foreground ml-1">vs last week</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Members</p>
                <p className="text-2xl font-bold">{avgActiveMembers}</p>
              </div>
              <Activity className="w-8 h-8 text-primary/60" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Posts Created</p>
                <p className="text-2xl font-bold">{totalPosts}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-primary/60" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Events Created</p>
                <p className="text-2xl font-bold">{totalEvents}</p>
              </div>
              <Calendar className="w-8 h-8 text-primary/60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Card>
        <CardHeader>
          <CardTitle>Community Growth</CardTitle>
          <CardDescription>Daily new members and activity</CardDescription>
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
              <Bar dataKey="newMembers" fill="hsl(var(--primary))" name="New Members" />
              <Bar dataKey="activeMembers" fill="hsl(var(--secondary))" name="Active Members" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}