
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ManualLocationDialogProps {
  onLocationSet: (city: string, state: string) => Promise<boolean>;
  loading?: boolean;
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const ManualLocationDialog = ({ 
  onLocationSet, 
  loading = false,
  trigger,
  isOpen,
  onOpenChange
}: ManualLocationDialogProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const open = isOpen !== undefined ? isOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!city.trim() || !state.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter both city and state.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const success = await onLocationSet(city.trim(), state.trim());
      if (success) {
        setOpen(false);
        setCity('');
        setState('');
        toast({
          title: "Location Set",
          description: `Your location has been set to ${city}, ${state}.`,
        });
      } else {
        toast({
          title: "Failed to Set Location",
          description: "Please try again or use automatic location detection.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to set manual location. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const defaultTrigger = (
    <Button variant="outline" size="sm" className="gap-2">
      <MapPin className="h-4 w-4" />
      Set Location Manually
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && (
        <DialogTrigger asChild>
          {trigger || defaultTrigger}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Set Your Location
          </DialogTitle>
          <DialogDescription>
            Enter your city and state to find posts and events in your area.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="city" className="text-sm font-medium">City</Label>
              <Input
                id="city"
                type="text"
                placeholder="e.g., San Francisco"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                disabled={isSubmitting || loading}
                className="focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="state" className="text-sm font-medium">State</Label>
              <Input
                id="state"
                type="text"
                placeholder="e.g., California"
                value={state}
                onChange={(e) => setState(e.target.value)}
                disabled={isSubmitting || loading}
                className="focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={isSubmitting || loading}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || loading || !city.trim() || !state.trim()}
              className="w-full sm:w-auto gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Setting Location...
                </>
              ) : (
                <>
                  <MapPin className="h-4 w-4" />
                  Set Location
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
