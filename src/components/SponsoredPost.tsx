import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Heart, MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SponsoredPostData {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  target_url?: string;
  cost_per_click: number;
  advertiser: {
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
}

interface SponsoredPostProps {
  communityId?: string;
  className?: string;
}

export const SponsoredPost: React.FC<SponsoredPostProps> = ({ communityId, className = '' }) => {
  const { user } = useAuth();
  const [sponsoredPost, setSponsoredPost] = React.useState<SponsoredPostData | null>(null);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    fetchSponsoredPost();
  }, [communityId]);

  const fetchSponsoredPost = async () => {
    try {
      let query = supabase
        .from('advertisements')
        .select(`
          *,
          advertiser:profiles!advertiser_id(first_name, last_name, avatar_url)
        `)
        .eq('ad_type', 'sponsored_post')
        .eq('placement_type', 'community_feed')
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
        console.error('Error fetching sponsored post:', error);
        return;
      }

      if (data) {
        setSponsoredPost(data);
        // Track impression
        await trackImpression(data.id);
      }
    } catch (error) {
      console.error('Error fetching sponsored post:', error);
    } finally {
      setLoading(false);
    }
  };

  const trackImpression = async (adId: string) => {
    try {
      await supabase.from('ad_impressions').insert({
        ad_id: adId,
        viewer_id: user?.id || null,
        placement_page: 'community_feed'
      });

      await supabase.rpc('update_ad_impression', { ad_uuid: adId });
    } catch (error) {
      console.error('Error tracking impression:', error);
    }
  };

  const handleClick = async () => {
    if (!sponsoredPost) return;

    try {
      await supabase.from('ad_clicks').insert({
        ad_id: sponsoredPost.id,
        viewer_id: user?.id || null,
        placement_page: 'community_feed'
      });

      await supabase.rpc('update_ad_click', { 
        ad_uuid: sponsoredPost.id, 
        click_cost: sponsoredPost.cost_per_click 
      });

      if (sponsoredPost.target_url) {
        window.open(sponsoredPost.target_url, '_blank');
      }
    } catch (error) {
      console.error('Error tracking click:', error);
    }
  };

  if (loading || !sponsoredPost) {
    return null;
  }

  return (
    <Card className={`bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-l-4 border-l-blue-500 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={sponsoredPost.advertiser.avatar_url} />
              <AvatarFallback>
                {sponsoredPost.advertiser.first_name[0]}{sponsoredPost.advertiser.last_name[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="font-semibold text-sm">
                  {sponsoredPost.advertiser.first_name} {sponsoredPost.advertiser.last_name}
                </h4>
                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  Sponsored
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">Promoted post</p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div onClick={handleClick} className="cursor-pointer">
          <h3 className="font-semibold text-lg mb-2 hover:text-primary transition-colors">
            {sponsoredPost.title}
          </h3>
          
          {sponsoredPost.description && (
            <p className="text-muted-foreground mb-3">{sponsoredPost.description}</p>
          )}

          {sponsoredPost.image_url && (
            <img 
              src={sponsoredPost.image_url} 
              alt={sponsoredPost.title}
              className="w-full h-48 object-cover rounded-lg mb-3"
            />
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <Heart className="w-4 h-4 mr-1" />
              Like
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <MessageCircle className="w-4 h-4 mr-1" />
              Comment
            </Button>
          </div>
          
          {sponsoredPost.target_url && (
            <Button 
              onClick={handleClick}
              size="sm" 
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              Learn More
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};