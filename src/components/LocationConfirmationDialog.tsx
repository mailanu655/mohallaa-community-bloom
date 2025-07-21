
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
import { MapPin, CheckCircle, AlertTriangle, Shield, Target, Navigation } from 'lucide-react';
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

  const getAccuracyLevel = () => {
    if (!location.accuracy) return { level: 'unknown', icon: Target, color: 'text-muted-foreground' };
    
    if (location.accuracy < 100) {
      return { level: 'high', icon: Target, color: 'text-emerald-600' };
    } else if (location.accuracy < 1000) {
      return { level: 'medium', icon: Target, color: 'text-amber-600' };
    } else {
      return { level: 'low', icon: Target, color: 'text-red-600' };
    }
  };

  const getConfidenceLevel = () => {
    if (confidenceLevel > 0.8) {
      return { level: 'high', color: 'text-emerald-600', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200' };
    } else if (confidenceLevel > 0.5) {
      return { level: 'medium', color: 'text-amber-600', bgColor: 'bg-amber-50', borderColor: 'border-amber-200' };
    } else {
      return { level: 'low', color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' };
    }
  };

  const accuracyInfo = getAccuracyLevel();
  const confidenceInfo = getConfidenceLevel();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] w-full max-w-[95vw] p-0 gap-0 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 px-6 pt-6 pb-4 border-b border-border/50">
          <DialogHeader className="text-center space-y-3">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-background shadow-lg border border-border/50">
              <Navigation className="h-7 w-7 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Confirm Location
              </DialogTitle>
              <DialogDescription className="text-muted-foreground mt-2 text-base">
                We've detected your location. Please verify the details below.
              </DialogDescription>
            </div>
          </DialogHeader>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {hasLocationDetails ? (
            <div className={`p-4 rounded-xl border transition-all ${confidenceInfo.bgColor} ${confidenceInfo.borderColor} hover:shadow-md`}>
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 ${confidenceInfo.color}`}>
                  <CheckCircle className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-foreground text-lg leading-tight truncate">
                      {location.neighborhood ? `${location.neighborhood}` : location.city}
                    </h3>
                    <Badge variant="secondary" className="text-xs font-medium shrink-0 self-start sm:self-center">
                      {confidenceInfo.level.toUpperCase()} MATCH
                    </Badge>
                  </div>
                  <p className="text-muted-foreground font-medium break-words">
                    {location.city}, {location.state}
                    {location.zipcode && ` • ${location.zipcode}`}
                  </p>
                  
                   {/* Accuracy Info */}
                   {location.accuracy && (
                     <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-current/20">
                       <div className="flex items-center gap-2">
                         <accuracyInfo.icon className={`h-4 w-4 ${accuracyInfo.color} shrink-0`} />
                         <span className="text-sm text-muted-foreground">
                           Accuracy: <span className="font-medium">±{Math.round(location.accuracy)}m</span>
                         </span>
                       </div>
                       {location.provider && (
                         <div className="flex items-center gap-2">
                           <span className="text-muted-foreground">•</span>
                           <span className="text-sm text-muted-foreground font-medium">
                             {location.provider}
                           </span>
                         </div>
                       )}
                     </div>
                   )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-amber-900 mb-1">
                    Incomplete Location Data
                  </h3>
                  <p className="text-sm text-amber-700 mb-3">
                    We found your coordinates but couldn't determine the exact address.
                  </p>
                  <div className="text-xs font-mono bg-amber-100 text-amber-800 px-2 py-1 rounded border">
                    {location.latitude?.toFixed(6)}, {location.longitude?.toFixed(6)}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <DialogFooter className="p-6 pt-0">
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
              className="flex-1 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-primary/25"
              disabled={!hasLocationDetails && (!location.latitude || !location.longitude)}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirm Location
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LocationConfirmationDialog;
