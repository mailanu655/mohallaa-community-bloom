import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, Users, MessageSquare, Calendar, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface CommunityAnalyticsProps {
  communityId: string;
  canView: boolean;
}

const CommunityAnalytics = ({ communityId, canView }: CommunityAnalyticsProps) => {
  const [analytics, setAnalytics] = useState({
    totalMembers: 0,
    newMembersThisMonth: 0,
    totalPosts: 0,
    postsThisMonth: 0,
    totalEvents: 0,
    upcomingEvents: 0,
    engagement: {
      totalComments: 0,
      totalVotes: 0,
      avgPostsPerMember: 0
    },
    memberGrowth: [],
    postActivity: [],
    topContributors: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (canView && communityId) {
      fetchAnalytics();
    }
  }, [communityId, canView]);

  const fetchAnalytics = async () => {
    try {
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Fetch basic counts
      const [
        { count: totalMembers },
        { count: newMembersThisMonth },
        { count: totalPosts },
        { count: postsThisMonth },
        { count: totalEvents },
        { count: upcomingEvents },
        { count: totalComments },
        { data: topContributors }
      ] = await Promise.all([
        // Total members
        supabase
          .from('community_members')
          .select('*', { count: 'exact', head: true })
          .eq('community_id', communityId),

        // New members this month
        supabase
          .from('community_members')
          .select('*', { count: 'exact', head: true })
          .eq('community_id', communityId)
          .gte('joined_at', firstDayOfMonth.toISOString()),

        // Total posts
        supabase
          .from('posts')
          .select('*', { count: 'exact', head: true })
          .eq('community_id', communityId),

        // Posts this month
        supabase
          .from('posts')
          .select('*', { count: 'exact', head: true })
          .eq('community_id', communityId)
          .gte('created_at', firstDayOfMonth.toISOString()),

        // Total events
        supabase
          .from('events')
          .select('*', { count: 'exact', head: true })
          .eq('community_id', communityId),

        // Upcoming events
        supabase
          .from('events')
          .select('*', { count: 'exact', head: true })
          .eq('community_id', communityId)
          .gte('start_date', now.toISOString()),

        // Total comments
        supabase
          .from('comments')
          .select('*', { count: 'exact', head: true })
          .in('post_id', 
            (await supabase
              .from('posts')
              .select('id')
              .eq('community_id', communityId)
            ).data?.map(p => p.id) || []
          ),

        // Top contributors
        supabase
          .from('posts')
          .select(`
            author_id,
            profiles!inner(first_name, last_name, avatar_url)
          `)
          .eq('community_id', communityId)
          .gte('created_at', firstDayOfMonth.toISOString())
      ]);

      // Process top contributors
      const contributorMap = new Map();
      topContributors?.forEach((post: any) => {
        const authorId = post.author_id;
        if (contributorMap.has(authorId)) {
          contributorMap.set(authorId, {
            ...contributorMap.get(authorId),
            postCount: contributorMap.get(authorId).postCount + 1
          });
        } else {
          contributorMap.set(authorId, {
            ...post.profiles,
            authorId,
            postCount: 1
          });
        }
      });

      const sortedContributors = Array.from(contributorMap.values())
        .sort((a, b) => b.postCount - a.postCount)
        .slice(0, 5);

      setAnalytics({
        totalMembers: totalMembers || 0,
        newMembersThisMonth: newMembersThisMonth || 0,
        totalPosts: totalPosts || 0,
        postsThisMonth: postsThisMonth || 0,
        totalEvents: totalEvents || 0,
        upcomingEvents: upcomingEvents || 0,
        engagement: {
          totalComments: totalComments || 0,
          totalVotes: 0, // Would need separate query
          avgPostsPerMember: totalMembers ? Number(((totalPosts || 0) / totalMembers).toFixed(1)) : 0
        },
        memberGrowth: [], // Would need time-series data
        postActivity: [], // Would need time-series data
        topContributors: sortedContributors
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!canView) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Admin Access Required</h3>
          <p className="text-muted-foreground">You need admin privileges to view community analytics.</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-8 bg-muted rounded mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Community Analytics</h2>
        <p className="text-muted-foreground">Insights and metrics for your community</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Members</p>
                <p className="text-2xl font-bold">{analytics.totalMembers}</p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
            <div className="mt-2">
              <Badge variant="secondary" className="text-xs">
                +{analytics.newMembersThisMonth} this month
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Posts</p>
                <p className="text-2xl font-bold">{analytics.totalPosts}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-green-600" />
            </div>
            <div className="mt-2">
              <Badge variant="secondary" className="text-xs">
                +{analytics.postsThisMonth} this month
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Events</p>
                <p className="text-2xl font-bold">{analytics.totalEvents}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
            <div className="mt-2">
              <Badge variant="secondary" className="text-xs">
                {analytics.upcomingEvents} upcoming
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Engagement</p>
                <p className="text-2xl font-bold">{analytics.engagement.avgPostsPerMember}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
            <div className="mt-2">
              <Badge variant="secondary" className="text-xs">
                Avg posts/member
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Contributors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Top Contributors This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.topContributors.length > 0 ? (
              <div className="space-y-4">
                {analytics.topContributors.map((contributor: any, index) => (
                  <div key={contributor.authorId} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">
                          {contributor.first_name} {contributor.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {contributor.postCount} post{contributor.postCount !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">
                      {contributor.postCount}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No posts this month yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activity Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Activity Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">Total Comments</span>
                <Badge variant="secondary">{analytics.engagement.totalComments}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">Posts Per Member</span>
                <Badge variant="secondary">{analytics.engagement.avgPostsPerMember}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">Growth Rate</span>
                <Badge variant="secondary">
                  {analytics.totalMembers > 0 
                    ? `${Math.round((analytics.newMembersThisMonth / analytics.totalMembers) * 100)}%`
                    : '0%'
                  }
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CommunityAnalytics;