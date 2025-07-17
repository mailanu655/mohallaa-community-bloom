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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { History, MapPin, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import LocationHistoryService from '@/utils/locationHistory';
import { formatDistanceToNow } from 'date-fns';

interface LocationHistoryEntry {
  id: string;
  user_id: string;
  latitude: number;
  longitude: number;
  city?: string;
  state?: string;
  accuracy?: number;
  detection_method: 'auto' | 'manual' | 'ip';
  created_at: string;
}

interface LocationHistoryDialogProps {
  trigger?: React.ReactNode;
}

export const LocationHistoryDialog = ({ trigger }: LocationHistoryDialogProps) => {
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState<LocationHistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [clearing, setClearing] = useState(false);
  const { toast } = useToast();

  const loadHistory = async () => {
    setLoading(true);
    try {
      const entries = await LocationHistoryService.getHistory(20);
      setHistory(entries);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load location history.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = async () => {
    setClearing(true);
    try {
      await LocationHistoryService.clearHistory();
      setHistory([]);
      toast({
        title: "History Cleared",
        description: "Your location history has been cleared.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear location history.",
        variant: "destructive",
      });
    } finally {
      setClearing(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadHistory();
    }
  }, [open]);

  const getMethodBadge = (method: string) => {
    switch (method) {
      case 'auto':
        return <Badge variant="default" className="text-xs">Auto</Badge>;
      case 'manual':
        return <Badge variant="secondary" className="text-xs">Manual</Badge>;
      case 'ip':
        return <Badge variant="outline" className="text-xs">IP</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{method}</Badge>;
    }
  };

  const defaultTrigger = (
    <Button variant="outline" size="sm" className="gap-2">
      <History className="h-4 w-4" />
      Location History
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Location History
          </DialogTitle>
          <DialogDescription>
            Your recent location changes and detection methods.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-muted-foreground">
            {history.length} location{history.length !== 1 ? 's' : ''} recorded
          </span>
          {history.length > 0 && (
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={clearHistory}
              disabled={clearing}
              className="gap-2"
            >
              {clearing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Clear History
            </Button>
          )}
        </div>

        <ScrollArea className="h-[400px] w-full">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading history...</span>
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <MapPin className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No location history yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Location changes will appear here automatically
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-start justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {entry.city && entry.state ? (
                          `${entry.city}, ${entry.state}`
                        ) : (
                          `${entry.latitude.toFixed(4)}, ${entry.longitude.toFixed(4)}`
                        )}
                      </span>
                      {getMethodBadge(entry.detection_method)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                      {entry.accuracy && (
                        <span className="ml-2">
                          ±{Math.round(entry.accuracy)}m accuracy
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};