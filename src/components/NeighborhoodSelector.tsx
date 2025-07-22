import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MapPin, Search, Loader2, TrendingUp } from 'lucide-react';
import { useNeighborhoods, Neighborhood, NeighborhoodSearchResult } from '@/hooks/useNeighborhoods';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface NeighborhoodSelectorProps {
  onNeighborhoodSelect: (neighborhood: Neighborhood) => Promise<void>;
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  currentNeighborhood?: Neighborhood | null;
}

export const NeighborhoodSelector = ({
  onNeighborhoodSelect,
  trigger,
  isOpen,
  onOpenChange,
  currentNeighborhood,
}: NeighborhoodSelectorProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSelecting, setIsSelecting] = useState(false);
  const {
    popularNeighborhoods,
    searchResults,
    loading,
    error,
    searchNeighborhoods,
  } = useNeighborhoods();
  const { toast } = useToast();

  const open = isOpen !== undefined ? isOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        searchNeighborhoods(searchQuery);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleNeighborhoodSelect = async (neighborhood: Neighborhood) => {
    setIsSelecting(true);
    try {
      await onNeighborhoodSelect(neighborhood);
      setOpen(false);
      setSearchQuery('');
      toast({
        title: "Neighborhood Selected",
        description: `You're now connected to ${neighborhood.name}, ${neighborhood.city}`,
      });
    } catch (error: any) {
      toast({
        title: "Selection Failed",
        description: error.message || "Failed to select neighborhood",
        variant: "destructive",
      });
    } finally {
      setIsSelecting(false);
    }
  };

  const displayNeighborhoods = searchQuery.trim() 
    ? searchResults 
    : popularNeighborhoods;

  const formatNeighborhoodLabel = (neighborhood: Neighborhood | NeighborhoodSearchResult) => {
    if (neighborhood.metro_area && neighborhood.metro_area !== `${neighborhood.city} Metro`) {
      return `${neighborhood.name}, ${neighborhood.city} • ${neighborhood.metro_area}`;
    }
    return `${neighborhood.name}, ${neighborhood.city}, ${neighborhood.state_code}`;
  };

  const defaultTrigger = (
    <Button variant="outline" size="sm" className="gap-2">
      <MapPin className="h-4 w-4" />
      {currentNeighborhood 
        ? `${currentNeighborhood.name}, ${currentNeighborhood.city}`
        : 'Select Neighborhood'
      }
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && (
        <DialogTrigger asChild>
          {trigger || defaultTrigger}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[500px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Choose Your Neighborhood
          </DialogTitle>
          <DialogDescription>
            Select your neighborhood to see local posts, events, and connect with neighbors.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search neighborhoods, cities, or areas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              disabled={isSelecting}
            />
            {loading && (
              <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>

          {/* Popular Neighborhoods Badge */}
          {!searchQuery.trim() && (
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Popular neighborhoods</span>
            </div>
          )}

          {/* Neighborhoods List */}
          <ScrollArea className="h-[300px] w-full">
            <div className="space-y-2">
              {displayNeighborhoods.map((neighborhood) => (
                <div
                  key={neighborhood.id}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors",
                    "hover:bg-muted/50",
                    currentNeighborhood?.id === neighborhood.id && "bg-primary/10 border-primary/20"
                  )}
                  onClick={() => handleNeighborhoodSelect(neighborhood)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm truncate">
                        {neighborhood.name}
                      </p>
                      {neighborhood.is_popular && (
                        <Badge variant="secondary" className="text-xs">
                          Popular
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {neighborhood.metro_area 
                        ? `${neighborhood.city}, ${neighborhood.state_code} • ${neighborhood.metro_area}`
                        : `${neighborhood.city}, ${neighborhood.state}`
                      }
                    </p>
                    {neighborhood.population && (
                      <p className="text-xs text-muted-foreground">
                        {neighborhood.population.toLocaleString()} residents
                      </p>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              ))}

              {displayNeighborhoods.length === 0 && !loading && (
                <div className="text-center py-8">
                  <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">
                    {searchQuery.trim() 
                      ? "No neighborhoods found. Try a different search term."
                      : "No neighborhoods available."
                    }
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
              {error}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};