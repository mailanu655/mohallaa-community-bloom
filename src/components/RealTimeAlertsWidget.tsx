import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle,
  Cloud,
  Car,
  Zap,
  Wind,
  MapPin,
  Clock,
  Bell,
  X
} from 'lucide-react';

interface Alert {
  id: string;
  type: 'weather' | 'traffic' | 'power' | 'safety' | 'community';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  location: string;
  timestamp: string;
  actionable: boolean;
}

const RealTimeAlertsWidget = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);

  useEffect(() => {
    // Mock real-time alerts - in production, this would connect to alert services
    const mockAlerts: Alert[] = [
      {
        id: '1',
        type: 'weather',
        title: 'Heavy Rain Alert',
        description: 'Heavy rainfall expected in your area for the next 2 hours',
        severity: 'medium',
        location: 'Your neighborhood',
        timestamp: new Date().toISOString(),
        actionable: true
      },
      {
        id: '2',
        type: 'traffic',
        title: 'Road Closure',
        description: 'Main Street closed due to construction until 6 PM',
        severity: 'low',
        location: '0.5 miles away',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        actionable: false
      },
      {
        id: '3',
        type: 'safety',
        title: 'Community Safety Notice',
        description: 'Increased police presence in downtown area tonight',
        severity: 'low',
        location: 'Downtown district',
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        actionable: false
      }
    ];

    setAlerts(mockAlerts);
  }, []);

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'weather': return Cloud;
      case 'traffic': return Car;
      case 'power': return Zap;
      case 'safety': return AlertTriangle;
      default: return Bell;
    }
  };

  const getAlertColor = (severity: Alert['severity']) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-muted-foreground bg-muted border-border';
    }
  };

  const dismissAlert = (alertId: string) => {
    setDismissedAlerts(prev => [...prev, alertId]);
  };

  const visibleAlerts = alerts.filter(alert => !dismissedAlerts.includes(alert.id));

  if (visibleAlerts.length === 0) {
    return null;
  }

  return (
    <Card className="border-0 bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          Live Alerts
          <Badge variant="secondary" className="text-xs">
            {visibleAlerts.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {visibleAlerts.map((alert) => {
          const IconComponent = getAlertIcon(alert.type);
          
          return (
            <div 
              key={alert.id} 
              className={`p-3 rounded-lg border ${getAlertColor(alert.severity)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <IconComponent className="w-4 h-4 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm mb-1">{alert.title}</h4>
                    <p className="text-xs opacity-90 mb-2">{alert.description}</p>
                    <div className="flex items-center gap-3 text-xs opacity-75">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {alert.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(alert.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => dismissAlert(alert.id)}
                  className="h-6 w-6 p-0 opacity-50 hover:opacity-100"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
              
              {alert.actionable && (
                <Button variant="outline" size="sm" className="mt-2 text-xs h-7">
                  View Details
                </Button>
              )}
            </div>
          );
        })}
        
        <Button variant="ghost" size="sm" className="w-full text-xs">
          View All Alerts
        </Button>
      </CardContent>
    </Card>
  );
};

export default RealTimeAlertsWidget;