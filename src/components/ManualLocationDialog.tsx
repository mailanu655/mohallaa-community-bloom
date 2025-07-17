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
}

export const ManualLocationDialog = ({ 
  onLocationSet, 
  loading = false,
  trigger 
}: ManualLocationDialogProps) => {
  const [open, setOpen] = useState(false);
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

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
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Set Your Location
          </DialogTitle>
          <DialogDescription>
            Enter your city and state manually if automatic location detection isn't working.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                type="text"
                placeholder="Enter your city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                disabled={isSubmitting || loading}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                type="text"
                placeholder="Enter your state"
                value={state}
                onChange={(e) => setState(e.target.value)}
                disabled={isSubmitting || loading}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={isSubmitting || loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || loading || !city.trim() || !state.trim()}
              className="gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Setting...
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