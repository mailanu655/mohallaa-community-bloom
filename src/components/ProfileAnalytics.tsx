import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  Eye, 
  Users, 
  TrendingUp, 
  Calendar,
  MoreHorizontal,
  RefreshCw
} from 'lucide-react';
import { useProfileViews } from '@/hooks/useProfileViews';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

const ProfileAnalytics = () => {
  const { stats, isLoading, refreshStats } = useProfileViews();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-12 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Eye className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold mb-2">No Profile Views Yet</h3>
          <p className="text-muted-foreground">
            Share your profile to start tracking views and analytics.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Profile Analytics</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={refreshStats}
          className="gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold">{stats.totalViews}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Eye className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Unique Viewers</p>
                <p className="text-2xl font-bold">{stats.uniqueViewers}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Views/Viewer</p>
                <p className="text-2xl font-bold">
                  {stats.uniqueViewers > 0 ? (stats.totalViews / stats.uniqueViewers).toFixed(1) : '0'}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Profile Views */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Recent Profile Views
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentViews.length > 0 ? (
            <div className="space-y-3">
              {stats.recentViews.map((view) => (
                <div key={view.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={view.viewer?.avatar_url} />
                      <AvatarFallback>
                        {view.viewer?.first_name?.[0]}{view.viewer?.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <Link 
                          to={`/profile/${view.viewer_id}`}
                          className="font-medium hover:text-primary transition-colors"
                        >
                          {view.viewer?.first_name} {view.viewer?.last_name}
                        </Link>
                      </div>
                      {view.viewer?.profession && (
                        <p className="text-sm text-muted-foreground">
                          {view.viewer.profession}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(view.viewed_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <Eye className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No recent profile views</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Viewers */}
      {stats.topViewers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Top Viewers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topViewers.map((item, index) => (
                <div key={item.viewer?.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Badge variant={index === 0 ? 'default' : 'secondary'}>
                      #{index + 1}
                    </Badge>
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={item.viewer?.avatar_url} />
                      <AvatarFallback>
                        {item.viewer?.first_name?.[0]}{item.viewer?.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <Link 
                        to={`/profile/${item.viewer?.id}`}
                        className="font-medium hover:text-primary transition-colors"
                      >
                        {item.viewer?.first_name} {item.viewer?.last_name}
                      </Link>
                      {item.viewer?.profession && (
                        <p className="text-sm text-muted-foreground">
                          {item.viewer.profession}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline">
                      {item.viewCount} view{item.viewCount !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProfileAnalytics;