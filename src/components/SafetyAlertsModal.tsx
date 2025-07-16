import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  AlertTriangle, 
  MapPin, 
  Clock, 
  Plus,
  CheckCircle,
  Filter,
  Users
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useSafetyAlerts } from '@/hooks/useSafetyAlerts';
import { useAuth } from '@/contexts/AuthContext';
import CreateSafetyAlertDialog from './CreateSafetyAlertDialog';

interface SafetyAlertsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const severityColors = {
  low: 'bg-blue-100 text-blue-800 border-blue-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  critical: 'bg-red-100 text-red-800 border-red-200'
};

const severityIcons = {
  low: '🔵',
  medium: '🟡',
  high: '🟠',
  critical: '🔴'
};

const alertTypeIcons = {
  general: '📢',
  emergency: '🚨',
  weather: '🌦️',
  crime: '🚔',
  traffic: '🚗'
};

export default function SafetyAlertsModal({ open, onOpenChange }: SafetyAlertsModalProps) {
  const { user } = useAuth();
  const { 
    alerts, 
    loading, 
    error, 
    resolveAlert, 
    getAlertsBySeverity 
  } = useSafetyAlerts();
  const [createAlertOpen, setCreateAlertOpen] = useState(false);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');

  const filteredAlerts = selectedSeverity === 'all' 
    ? alerts 
    : getAlertsBySeverity(selectedSeverity);

  const handleResolveAlert = async (alertId: string) => {
    try {
      await resolveAlert(alertId);
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                Safety Alerts
                <Badge variant="outline" className="ml-2">
                  {alerts.length} active
                </Badge>
              </DialogTitle>
              
              <Button 
                onClick={() => setCreateAlertOpen(true)}
                size="sm"
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Report Alert
              </Button>
            </div>
          </DialogHeader>

          <Tabs value={selectedSeverity} onValueChange={setSelectedSeverity}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All ({alerts.length})</TabsTrigger>
              <TabsTrigger value="critical">
                Critical ({getAlertsBySeverity('critical').length})
              </TabsTrigger>
              <TabsTrigger value="high">
                High ({getAlertsBySeverity('high').length})
              </TabsTrigger>
              <TabsTrigger value="medium">
                Medium ({getAlertsBySeverity('medium').length})
              </TabsTrigger>
              <TabsTrigger value="low">
                Low ({getAlertsBySeverity('low').length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={selectedSeverity} className="mt-4">
              <ScrollArea className="h-[400px]">
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : error ? (
                  <div className="text-center text-red-600 p-4">
                    Error loading alerts: {error}
                  </div>
                ) : filteredAlerts.length === 0 ? (
                  <div className="text-center text-muted-foreground p-8">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">No alerts found</h3>
                    <p>
                      {selectedSeverity === 'all' 
                        ? "No active safety alerts in your area." 
                        : `No ${selectedSeverity} severity alerts found.`
                      }
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredAlerts.map((alert) => (
                      <div 
                        key={alert.id} 
                        className="border border-border rounded-lg p-4 space-y-3"
                      >
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={alert.profiles?.avatar_url} />
                              <AvatarFallback className="text-xs">
                                {alert.profiles?.first_name?.[0]}
                                {alert.profiles?.last_name?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm">
                                  {alert.profiles?.first_name} {alert.profiles?.last_name}
                                </span>
                                <span className="text-muted-foreground">·</span>
                                <span className="text-muted-foreground text-xs">
                                  {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-2 mb-2">
                                <Badge 
                                  variant="outline" 
                                  className={severityColors[alert.severity as keyof typeof severityColors]}
                                >
                                  {severityIcons[alert.severity as keyof typeof severityIcons]} 
                                  {alert.severity.toUpperCase()}
                                </Badge>
                                
                                <Badge variant="secondary">
                                  {alertTypeIcons[alert.alert_type as keyof typeof alertTypeIcons]} 
                                  {alert.alert_type}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          {(user?.id === alert.author_id) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleResolveAlert(alert.id)}
                              className="flex items-center gap-1"
                            >
                              <CheckCircle className="w-3 h-3" />
                              Resolve
                            </Button>
                          )}
                        </div>

                        {/* Content */}
                        <div className="space-y-2">
                          <h4 className="font-semibold">{alert.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {alert.description}
                          </p>
                        </div>

                        {/* Location */}
                        {alert.location_details && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            <span>{alert.location_details}</span>
                            {alert.radius_affected_miles && (
                              <span>• Radius: {alert.radius_affected_miles} miles</span>
                            )}
                          </div>
                        )}

                        {/* Community */}
                        {alert.communities && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Users className="w-4 h-4" />
                            <span>{alert.communities.name}, {alert.communities.city}</span>
                          </div>
                        )}

                        {/* Expiry */}
                        {alert.expires_at && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>
                              Expires {formatDistanceToNow(new Date(alert.expires_at), { addSuffix: true })}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <CreateSafetyAlertDialog
        open={createAlertOpen}
        onOpenChange={setCreateAlertOpen}
      />
    </>
  );
}