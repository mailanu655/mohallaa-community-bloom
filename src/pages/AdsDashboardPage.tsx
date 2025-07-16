import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Eye, 
  MousePointer, 
  DollarSign, 
  TrendingUp, 
  Pause, 
  Play, 
  Edit,
  BarChart3,
  Calendar,
  MapPin,
  Building
} from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Advertisement {
  id: string;
  title: string;
  description: string;
  ad_type: string;
  placement_type: string;
  status: string;
  budget_total: number;
  budget_daily: number;
  cost_per_click: number;
  impressions: number;
  clicks: number;
  spend_total: number;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
  image_url?: string;
  target_location?: string;
}

export const AdsDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasBusinessAccess, setHasBusinessAccess] = useState<boolean | null>(null);
  const [stats, setStats] = useState({
    totalSpend: 0,
    totalImpressions: 0,
    totalClicks: 0,
    averageCTR: 0,
    activeAds: 0
  });

  useEffect(() => {
    if (user) {
      checkBusinessAccess();
    }
  }, [user]);

  const checkBusinessAccess = async () => {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('id')
        .eq('owner_id', user?.id)
        .limit(1);

      if (error) throw error;

      const hasAccess = data && data.length > 0;
      setHasBusinessAccess(hasAccess);
      
      if (hasAccess) {
        fetchAds();
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error checking business access:', error);
      setHasBusinessAccess(false);
      setLoading(false);
    }
  };

  const fetchAds = async () => {
    try {
      const { data, error } = await supabase
        .from('advertisements')
        .select('*')
        .eq('advertiser_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setAds(data || []);
      calculateStats(data || []);
    } catch (error) {
      console.error('Error fetching ads:', error);
      toast({
        title: "Error",
        description: "Failed to load advertisements.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (adsData: Advertisement[]) => {
    const totalSpend = adsData.reduce((sum, ad) => sum + (ad.spend_total || 0), 0);
    const totalImpressions = adsData.reduce((sum, ad) => sum + (ad.impressions || 0), 0);
    const totalClicks = adsData.reduce((sum, ad) => sum + (ad.clicks || 0), 0);
    const averageCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const activeAds = adsData.filter(ad => ad.status === 'active').length;

    setStats({
      totalSpend,
      totalImpressions,
      totalClicks,
      averageCTR,
      activeAds
    });
  };

  const updateAdStatus = async (adId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('advertisements')
        .update({ status: newStatus })
        .eq('id', adId);

      if (error) throw error;

      setAds(prev => prev.map(ad => 
        ad.id === adId ? { ...ad, status: newStatus } : ad
      ));

      toast({
        title: "Status updated",
        description: `Advertisement ${newStatus === 'active' ? 'activated' : 'paused'} successfully.`,
      });
    } catch (error) {
      console.error('Error updating ad status:', error);
      toast({
        title: "Error",
        description: "Failed to update advertisement status.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'Active', variant: 'default' as const, className: 'bg-green-100 text-green-800' },
      paused: { label: 'Paused', variant: 'secondary' as const, className: 'bg-yellow-100 text-yellow-800' },
      pending: { label: 'Pending', variant: 'outline' as const, className: 'bg-blue-100 text-blue-800' },
      completed: { label: 'Completed', variant: 'secondary' as const, className: 'bg-gray-100 text-gray-800' },
      rejected: { label: 'Rejected', variant: 'destructive' as const, className: 'bg-red-100 text-red-800' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getTypeLabel = (type: string) => {
    const typeLabels = {
      sponsored_post: 'Sponsored Post',
      banner: 'Banner Ad',
      local_business: 'Local Business'
    };
    return typeLabels[type as keyof typeof typeLabels] || type;
  };

  const getPlacementLabel = (placement: string) => {
    const placementLabels = {
      community_feed: 'Community Feed',
      marketplace: 'Marketplace',
      business_directory: 'Business Directory',
      sidebar: 'Sidebar'
    };
    return placementLabels[placement as keyof typeof placementLabels] || placement;
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to access advertising dashboard</h1>
          <Button onClick={() => navigate('/auth')}>Sign In</Button>
        </div>
      </div>
    );
  }

  if (hasBusinessAccess === false) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Building className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-4">Business Registration Required</h1>
          <p className="text-muted-foreground mb-6">
            You need to register a business to access the advertising dashboard.
          </p>
          <Button onClick={() => navigate('/register-business')}>
            Register Your Business
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Advertising Dashboard</h1>
          <p className="text-muted-foreground">Manage your advertisements and track performance</p>
        </div>
        <Button onClick={() => navigate('/create-ad')}>
          <Plus className="w-4 h-4 mr-2" />
          Create Ad
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Spend</p>
                <p className="text-xl font-bold">${stats.totalSpend.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Impressions</p>
                <p className="text-xl font-bold">{stats.totalImpressions.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MousePointer className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Clicks</p>
                <p className="text-xl font-bold">{stats.totalClicks.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Avg CTR</p>
                <p className="text-xl font-bold">{stats.averageCTR.toFixed(2)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              <div>
                <p className="text-sm text-muted-foreground">Active Ads</p>
                <p className="text-xl font-bold">{stats.activeAds}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ads List */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Ads</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="paused">Paused</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {loading ? (
            <div className="text-center py-8">Loading advertisements...</div>
          ) : ads.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <h3 className="text-lg font-semibold mb-2">No advertisements yet</h3>
                <p className="text-muted-foreground mb-4">Create your first ad to start promoting your business</p>
                <Button onClick={() => navigate('/create-ad')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Ad
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {ads.map((ad) => (
                <Card key={ad.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex space-x-4 flex-1">
                        {ad.image_url && (
                          <img 
                            src={ad.image_url} 
                            alt={ad.title}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                        )}
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold">{ad.title}</h3>
                            {getStatusBadge(ad.status)}
                            <Badge variant="outline">{getTypeLabel(ad.ad_type)}</Badge>
                          </div>
                          
                          {ad.description && (
                            <p className="text-muted-foreground mb-3">{ad.description}</p>
                          )}
                          
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-4 h-4" />
                              <span>{getPlacementLabel(ad.placement_type)}</span>
                            </div>
                            {ad.target_location && (
                              <div className="flex items-center space-x-1">
                                <span>📍 {ad.target_location}</span>
                              </div>
                            )}
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>Started {format(new Date(ad.start_date), 'MMM dd')}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        {/* Performance Metrics */}
                        <div className="text-right space-y-1">
                          <div className="flex space-x-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Impressions</p>
                              <p className="font-semibold">{ad.impressions.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Clicks</p>
                              <p className="font-semibold">{ad.clicks.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Spent</p>
                              <p className="font-semibold">${ad.spend_total.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">CTR</p>
                              <p className="font-semibold">
                                {ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(2) : '0.00'}%
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-2">
                          {ad.status === 'active' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateAdStatus(ad.id, 'paused')}
                            >
                              <Pause className="w-4 h-4" />
                            </Button>
                          ) : ad.status === 'paused' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateAdStatus(ad.id, 'active')}
                            >
                              <Play className="w-4 h-4" />
                            </Button>
                          ) : null}
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/edit-ad/${ad.id}`)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="active">
          <div className="grid gap-4">
            {ads.filter(ad => ad.status === 'active').map((ad) => (
              <Card key={ad.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{ad.title}</h3>
                      <p className="text-sm text-muted-foreground">{getPlacementLabel(ad.placement_type)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Daily budget: ${ad.budget_daily || 'No limit'}</p>
                      <p className="text-sm">Spent: ${ad.spend_total.toFixed(2)} / ${ad.budget_total.toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="paused">
          <div className="grid gap-4">
            {ads.filter(ad => ad.status === 'paused').map((ad) => (
              <Card key={ad.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{ad.title}</h3>
                      <p className="text-sm text-muted-foreground">Paused on {format(new Date(ad.updated_at || ad.created_at), 'MMM dd, yyyy')}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateAdStatus(ad.id, 'active')}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Resume
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pending">
          <div className="grid gap-4">
            {ads.filter(ad => ad.status === 'pending').map((ad) => (
              <Card key={ad.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{ad.title}</h3>
                      <p className="text-sm text-muted-foreground">Submitted for review on {format(new Date(ad.created_at), 'MMM dd, yyyy')}</p>
                    </div>
                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                      Under Review
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};