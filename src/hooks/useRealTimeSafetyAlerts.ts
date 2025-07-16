import { useEffect, useCallback } from 'react';
import { useRealTimeSubscription } from './useRealTimeSubscription';
import { useSafetyAlerts } from './useSafetyAlerts';
import { useToast } from '@/hooks/use-toast';

export function useRealTimeSafetyAlerts() {
  const { fetchAlerts, getCriticalAlertsCount } = useSafetyAlerts();
  const { toast } = useToast();

  const handleNewAlert = useCallback((payload: any) => {
    const newAlert = payload.new;
    
    // Show toast notification for critical alerts
    if (newAlert.severity === 'critical') {
      toast({
        title: "🚨 Critical Safety Alert",
        description: newAlert.title,
        variant: "destructive",
      });
    } else if (newAlert.severity === 'high') {
      toast({
        title: "⚠️ Safety Alert",
        description: newAlert.title,
      });
    }

    // Refresh alerts data
    fetchAlerts();
  }, [fetchAlerts, toast]);

  const handleAlertUpdate = useCallback((payload: any) => {
    const updatedAlert = payload.new;
    
    // Show notification if alert was resolved
    if (updatedAlert.is_resolved && !payload.old.is_resolved) {
      toast({
        title: "✅ Alert Resolved",
        description: `${updatedAlert.title} has been resolved.`,
      });
    }

    // Refresh alerts data
    fetchAlerts();
  }, [fetchAlerts, toast]);

  const handleAlertDelete = useCallback(() => {
    // Refresh alerts data when an alert is deleted
    fetchAlerts();
  }, [fetchAlerts]);

  // Subscribe to real-time updates
  const { unsubscribe } = useRealTimeSubscription({
    table: 'safety_alerts',
    event: '*',
    onInsert: handleNewAlert,
    onUpdate: handleAlertUpdate,
    onDelete: handleAlertDelete,
    onError: (error) => {
      console.error('Real-time safety alerts error:', error);
      toast({
        title: "Connection Error",
        description: "Lost connection to safety alerts. Refreshing...",
        variant: "destructive",
      });
    }
  });

  // Cleanup subscription on unmount
  useEffect(() => {
    return () => {
      unsubscribe();
    };
  }, [unsubscribe]);

  return {
    unsubscribe
  };
}