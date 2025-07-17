import { Badge } from '@/components/ui/badge';
import { MapPin, Wifi, WifiOff } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface LocationAccuracyIndicatorProps {
  accuracy?: number;
  accuracyLevel?: 'high' | 'medium' | 'low';
  provider?: string;
  confidence?: number;
}

export const LocationAccuracyIndicator = ({ 
  accuracy, 
  accuracyLevel, 
  provider,
  confidence 
}: LocationAccuracyIndicatorProps) => {
  const getAccuracyInfo = () => {
    if (!accuracyLevel) {
      return {
        level: 'unknown',
        color: 'bg-muted text-muted-foreground',
        icon: WifiOff,
        description: 'Location accuracy unknown'
      };
    }

    switch (accuracyLevel) {
      case 'high':
        return {
          level: 'High',
          color: 'bg-emerald-500/10 text-emerald-700 border-emerald-200 dark:text-emerald-400 dark:border-emerald-800',
          icon: Wifi,
          description: accuracy ? `Very accurate (±${Math.round(accuracy)}m)` : 'Very accurate location'
        };
      case 'medium':
        return {
          level: 'Medium',
          color: 'bg-amber-500/10 text-amber-700 border-amber-200 dark:text-amber-400 dark:border-amber-800',
          icon: Wifi,
          description: accuracy ? `Moderately accurate (±${Math.round(accuracy)}m)` : 'Moderately accurate location'
        };
      case 'low':
        return {
          level: 'Low',
          color: 'bg-red-500/10 text-red-700 border-red-200 dark:text-red-400 dark:border-red-800',
          icon: WifiOff,
          description: accuracy ? `Low accuracy (±${Math.round(accuracy)}m)` : 'Low accuracy location'
        };
      default:
        return {
          level: 'Unknown',
          color: 'bg-muted text-muted-foreground',
          icon: WifiOff,
          description: 'Location accuracy unknown'
        };
    }
  };

  const accuracyInfo = getAccuracyInfo();
  const Icon = accuracyInfo.icon;

  const tooltipContent = (
    <div className="space-y-1">
      <p className="font-medium">{accuracyInfo.description}</p>
      {provider && (
        <p className="text-xs opacity-80">Source: {provider}</p>
      )}
      {confidence && (
        <p className="text-xs opacity-80">Confidence: {Math.round(confidence * 100)}%</p>
      )}
    </div>
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className={`${accuracyInfo.color} cursor-help`}
          >
            <Icon className="h-3 w-3 mr-1" />
            {accuracyInfo.level}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          {tooltipContent}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};