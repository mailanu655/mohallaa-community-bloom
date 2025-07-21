import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MapPin, AlertTriangle } from 'lucide-react';
import { LocationData } from '@/hooks/useLocation';

interface LocationConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  location: LocationData | null;
  onConfirm: () => void;
  onRetry: () => void;
  onManualEntry: () => void;
}

const LocationConfirmationDialog = ({
  isOpen,
  onClose,
  location,
  onConfirm,
  onRetry,
  onManualEntry,
}: LocationConfirmationDialogProps) => {
  if (!location) return null;

  const isCoordinatesValid = location.latitude !== 0 && location.longitude !== 0;
  const hasLocationDetails = location.city && location.state;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Confirm Your Location
          </DialogTitle>
          <DialogDescription>
            We detected your location. Please confirm if this is correct.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Location Display */}
          <div className="p-4 bg-muted/30 rounded-lg">
            <div className="space-y-2">
              {hasLocationDetails ? (
                <>
                  <div className="text-sm font-medium">
                    {location.neighborhood && `${location.neighborhood}, `}
                    {location.city}, {location.state}
                  </div>
                  {location.zipcode && (
                    <div className="text-sm text-muted-foreground">
                      ZIP: {location.zipcode}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Coordinates: {location.latitude?.toFixed(4)}, {location.longitude?.toFixed(4)}
                </div>
              )}
              
              <div className="text-xs text-muted-foreground">
                Accuracy: {location.accuracy ? `${Math.round(location.accuracy)}m` : 'Unknown'}
                {location.provider && ` • Source: ${location.provider}`}
              </div>
            </div>
          </div>

          {/* Warning for invalid coordinates */}
          {!isCoordinatesValid && (
            <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-destructive mt-0.5" />
              <div className="text-sm text-destructive">
                The detected coordinates appear invalid. You may want to retry or enter your location manually.
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onRetry} className="w-full sm:w-auto">
            Try Again
          </Button>
          <Button variant="outline" onClick={onManualEntry} className="w-full sm:w-auto">
            Enter Manually
          </Button>
          <Button 
            onClick={onConfirm} 
            className="w-full sm:w-auto"
            disabled={!hasLocationDetails && !isCoordinatesValid}
          >
            Confirm Location
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LocationConfirmationDialog;