import React, { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Advertisement {
  id: string;
  title: string;
  description: string;
  image_url: string;
  target_url: string;
  cost_per_click: number;
}

interface AdBannerProps {
  placement: 'community_feed' | 'marketplace' | 'business_directory' | 'sidebar';
  communityId?: string;
  className?: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({ placement, communityId, className = '' }) => {
  const { user } = useAuth();
  const [ad, setAd] = React.useState<Advertisement | null>(null);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    fetchAd();
  }, [placement, communityId]);

  const fetchAd = async () => {
    try {
      let query = supabase
        .from('advertisements')
        .select('*')
        .eq('placement_type', placement)
        .eq('status', 'active')
        .lte('start_date', new Date().toISOString())
        .or(`end_date.is.null,end_date.gte.${new Date().toISOString()}`);

      if (communityId) {
        query = query.eq('target_community_id', communityId);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching ad:', error);
        return;
      }

      if (data) {
        setAd(data);
        // Track impression
        await trackImpression(data.id);
      }
    } catch (error) {
      console.error('Error fetching ad:', error);
    } finally {
      setLoading(false);
    }
  };

  const trackImpression = async (adId: string) => {
    try {
      await supabase.from('ad_impressions').insert({
        ad_id: adId,
        viewer_id: user?.id || null,
        placement_page: placement
      });

      await supabase.rpc('update_ad_impression', { ad_uuid: adId });
    } catch (error) {
      console.error('Error tracking impression:', error);
    }
  };

  const handleClick = async () => {
    if (!ad) return;

    try {
      await supabase.from('ad_clicks').insert({
        ad_id: ad.id,
        viewer_id: user?.id || null,
        placement_page: placement
      });

      await supabase.rpc('update_ad_click', { 
        ad_uuid: ad.id, 
        click_cost: ad.cost_per_click 
      });

      if (ad.target_url) {
        window.open(ad.target_url, '_blank');
      }
    } catch (error) {
      console.error('Error tracking click:', error);
    }
  };

  if (loading || !ad) {
    return null;
  }

  return (
    <Card className={`p-4 border-l-4 border-l-orange-500 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 ${className}`}>
      <div className="flex items-start space-x-3">
        <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
          Sponsored
        </Badge>
      </div>
      
      <div className="mt-2 flex items-center space-x-4">
        {ad.image_url && (
          <img 
            src={ad.image_url} 
            alt={ad.title}
            className="w-16 h-16 object-cover rounded-lg"
          />
        )}
        
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">{ad.title}</h3>
          {ad.description && (
            <p className="text-sm text-muted-foreground mt-1">{ad.description}</p>
          )}
          
          <button
            onClick={handleClick}
            className="inline-flex items-center space-x-1 text-sm text-primary hover:text-primary/80 mt-2 font-medium"
          >
            <span>Learn More</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
    </Card>
  );
};