import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Users, TrendingUp } from 'lucide-react';
import { NeighborhoodSelector } from './NeighborhoodSelector';
import { useLocation } from '@/hooks/useLocation';
import { Neighborhood } from '@/hooks/useNeighborhoods';

export const NeighborhoodLocationPrompt = () => {
  const [showSelector, setShowSelector] = useState(false);
  const { setNeighborhoodLocation, selectedNeighborhood, loading } = useLocation();

  const handleNeighborhoodSelect = async (neighborhood: Neighborhood) => {
    await setNeighborhoodLocation(neighborhood);
  };

  if (selectedNeighborhood) {
    return null; // Don't show if already selected
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
          <MapPin className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-xl">Welcome to Mohallaa!</CardTitle>
        <CardDescription className="text-base">
          Choose your neighborhood to connect with local community members, discover nearby events, and stay updated with what's happening around you.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Users className="h-4 w-4 text-primary" />
            <span>Connect with neighbors and local community</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span>Discover local events, deals, and recommendations</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 text-primary" />
            <span>See posts and activities relevant to your area</span>
          </div>
        </div>

        <NeighborhoodSelector
          onNeighborhoodSelect={handleNeighborhoodSelect}
          isOpen={showSelector}
          onOpenChange={setShowSelector}
          trigger={
            <Button className="w-full" size="lg" disabled={loading}>
              <MapPin className="h-4 w-4 mr-2" />
              Choose Your Neighborhood
            </Button>
          }
        />
      </CardContent>
    </Card>
  );
};