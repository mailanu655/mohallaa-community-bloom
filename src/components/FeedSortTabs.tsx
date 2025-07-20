import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Clock, 
  MapPin, 
  AlertTriangle
} from 'lucide-react';

interface FeedSortTabsProps {
  activeSort: string;
  onSortChange: (sort: string) => void;
  alertsCount?: number;
  onAlertsClick?: () => void;
  location?: {
    city?: string;
    state?: string;
    neighborhood?: string;
  } | null;
}

const FeedSortTabs = ({ activeSort, onSortChange, alertsCount = 0, onAlertsClick, location }: FeedSortTabsProps) => {
  const tabs = [
    { id: 'for-you', label: 'For You', icon: Sparkles },
    { id: 'latest', label: 'Latest', icon: Clock },
    { id: 'nearby', label: 'Nearby', icon: MapPin }
  ];

  return (
    <div className="border-b border-border/50 sticky top-16 bg-background/95 backdrop-blur-sm z-40">
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant="ghost"
              size="sm"
              onClick={() => onSortChange(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-none border-b-2 transition-all ${
                activeSort === tab.id
                  ? 'border-primary text-primary font-semibold'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </Button>
          ))}
        </div>

        {/* Real-time Alerts */}
        {alertsCount > 0 && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onAlertsClick}
            className="flex items-center gap-2 text-amber-600 border-amber-200 hover:bg-amber-50"
          >
            <AlertTriangle className="w-4 h-4" />
            <span className="hidden sm:inline">Safety Alerts</span>
            <Badge variant="destructive" className="ml-1">
              {alertsCount}
            </Badge>
          </Button>
        )}
      </div>
      
      {/* Location Info for Nearby Tab */}
      {activeSort === 'nearby' && location && (
        <div className="px-4 py-2 bg-muted/30 border-t border-border/50">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>
              Showing posts near {location.neighborhood && `${location.neighborhood}, `}
              {location.city}{location.state && `, ${location.state}`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedSortTabs;