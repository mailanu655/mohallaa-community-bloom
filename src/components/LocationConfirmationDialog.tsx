
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
import { MapPin, CheckCircle, AlertTriangle, Target, Navigation } from 'lucide-react';
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

  const hasLocationDetails = location.city && location.state;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] w-full max-w-[95vw]">
        {/* Simple Header */}
        <DialogHeader className="text-center space-y-3 pb-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Navigation className="h-6 w-6 text-primary" />
          </div>
          <div>
            <DialogTitle className="text-xl font-semibold">
              Confirm Location
            </DialogTitle>
            <DialogDescription className="text-muted-foreground mt-1">
              We've detected your location. Please verify the details below.
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="py-2">
          {hasLocationDetails ? (
            <div className="p-4 rounded-lg border bg-card">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-card-foreground leading-tight truncate mb-1">
                    {location.neighborhood ? `${location.neighborhood}` : location.city}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {location.city}, {location.state}
                    {location.zipcode && ` ${location.zipcode}`}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-lg border bg-amber-50 border-amber-200">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <h3 className="font-medium text-amber-900 mb-1">
                    Incomplete Location Data
                  </h3>
                  <p className="text-sm text-amber-700 mb-2">
                    We found your coordinates but couldn't determine the exact address.
                  </p>
                  <div className="text-xs font-mono bg-amber-100 text-amber-800 px-2 py-1 rounded">
                    {location.latitude?.toFixed(6)}, {location.longitude?.toFixed(6)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="pt-4">
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <Button 
              variant="outline" 
              onClick={onRetry}
              className="flex-1"
            >
              <Target className="h-4 w-4 mr-2" />
              Retry
            </Button>
            <Button 
              variant="outline" 
              onClick={onManualEntry}
              className="flex-1"
            >
              <MapPin className="h-4 w-4 mr-2" />
              Manual
            </Button>
            <Button 
              onClick={onConfirm}
              className="flex-1"
              disabled={!hasLocationDetails && (!location.latitude || !location.longitude)}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirm
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LocationConfirmationDialog;
