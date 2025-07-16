import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Sparkles, 
  Clock, 
  MapPin, 
  TrendingUp,
  Users,
  AlertTriangle
} from 'lucide-react';

interface FeedSortTabsProps {
  activeSort: string;
  onSortChange: (sort: string) => void;
  alertsCount?: number;
}

const FeedSortTabs = ({ activeSort, onSortChange, alertsCount = 0 }: FeedSortTabsProps) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <Tabs value={activeSort} onValueChange={onSortChange} className="w-auto">
        <TabsList className="grid grid-cols-4 w-auto bg-muted/50">
          <TabsTrigger value="for-you" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">For You</span>
          </TabsTrigger>
          <TabsTrigger value="latest" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline">Latest</span>
          </TabsTrigger>
          <TabsTrigger value="nearby" className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span className="hidden sm:inline">Nearby</span>
          </TabsTrigger>
          <TabsTrigger value="trending" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">Trending</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Real-time Alerts */}
      {alertsCount > 0 && (
        <Button 
          variant="outline" 
          size="sm" 
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
  );
};

export default FeedSortTabs;