
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
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, CheckCircle, AlertCircle, MapIcon } from 'lucide-react';
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
  const isAccurate = location.accuracy && location.accuracy < 1000; // Within 1km
  const confidenceLevel = location.confidence || 0.5;

  const getAccuracyBadge = () => {
    if (!location.accuracy) return null;
    
    if (location.accuracy < 100) {
      return <Badge className="bg-green-100 text-green-700 hover:bg-green-200">High Accuracy</Badge>;
    } else if (location.accuracy < 1000) {
      return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200">Medium Accuracy</Badge>;
    } else {
      return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200">Low Accuracy</Badge>;
    }
  };

  const getConfidenceBadge = () => {
    if (confidenceLevel > 0.8) {
      return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200">High Confidence</Badge>;
    } else if (confidenceLevel > 0.5) {
      return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">Medium Confidence</Badge>;
    } else {
      return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-200">Low Confidence</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <MapPin className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-xl font-semibold">
            Confirm Your Location
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            We've detected your location. Please confirm if this looks correct.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Card className="border-muted">
            <CardContent className="p-4">
              {hasLocationDetails ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div className="flex-1">
                      <div className="font-medium text-foreground">
                        {location.neighborhood && `${location.neighborhood}, `}
                        {location.city}, {location.state}
                      </div>
                      {location.zipcode && (
                        <div className="text-sm text-muted-foreground">
                          {location.zipcode}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {getAccuracyBadge()}
                    {getConfidenceBadge()}
                    {location.provider && (
                      <Badge variant="outline" className="text-xs">
                        {location.provider}
                      </Badge>
                    )}
                  </div>

                  {location.accuracy && (
                    <div className="text-xs text-muted-foreground">
                      Accuracy: ±{Math.round(location.accuracy)}m
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                    <div className="flex-1">
                      <div className="font-medium text-foreground">
                        Location detected but incomplete
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Coordinates: {location.latitude?.toFixed(4)}, {location.longitude?.toFixed(4)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-800">
                      We couldn't determine your exact city and state. You may want to enter your location manually for better results.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MapIcon className="h-3 w-3" />
            <span>Your exact location is never shared with other users</span>
          </div>
        </div>

        <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={onRetry} 
            className="w-full sm:w-auto"
          >
            Try Again
          </Button>
          <Button 
            variant="outline" 
            onClick={onManualEntry} 
            className="w-full sm:w-auto"
          >
            Enter Manually
          </Button>
          <Button 
            onClick={onConfirm} 
            className="w-full sm:w-auto"
            disabled={!hasLocationDetails && (!location.latitude || !location.longitude)}
          >
            {hasLocationDetails ? 'Confirm Location' : 'Use Coordinates'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LocationConfirmationDialog;
