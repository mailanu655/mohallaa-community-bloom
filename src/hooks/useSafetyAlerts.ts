import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface SafetyAlert {
  id: string;
  title: string;
  description: string;
  alert_type: string;
  severity: string;
  location_details?: string;
  latitude?: number;
  longitude?: number;
  radius_affected_miles?: number;
  community_id?: string;
  author_id: string;
  is_resolved: boolean;
  resolved_at?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    first_name: string;
    last_name: string;
    avatar_url?: string;
  } | null;
  communities?: {
    name: string;
    city: string;
    state: string;
  } | null;
}

interface UserLocation {
  community_id?: string;
  zip_code?: string;
}

export function useSafetyAlerts() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<SafetyAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocation>({});

  // Fetch user's location data
  useEffect(() => {
    const fetchUserLocation = async () => {
      if (!user?.id) return;

      try {
        const { data } = await supabase
          .from('profiles')
          .select('community_id, zip_code')
          .eq('id', user.id)
          .single();

        if (data) {
          setUserLocation({
            community_id: data.community_id,
            zip_code: data.zip_code
          });
        }
      } catch (error) {
        console.error('Error fetching user location:', error);
      }
    };

    fetchUserLocation();
  }, [user?.id]);

  // Fetch safety alerts
  const fetchAlerts = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('safety_alerts')
        .select(`
          *,
          profiles!inner(first_name, last_name, avatar_url),
          communities(name, city, state)
        `)
        .eq('is_resolved', false)
        .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString())
        .order('severity', { ascending: false })
        .order('created_at', { ascending: false });

      // Filter by user's location if available
      if (userLocation.community_id) {
        query = query.eq('community_id', userLocation.community_id);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      setAlerts((data as unknown as SafetyAlert[]) || []);
    } catch (err) {
      console.error('Error fetching safety alerts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch alerts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [userLocation.community_id]);

  // Create new alert
  const createAlert = async (alertData: {
    title: string;
    description: string;
    alert_type: string;
    severity: string;
    location_details?: string;
    latitude?: number;
    longitude?: number;
    radius_affected_miles?: number;
    expires_at?: string;
  }) => {
    if (!user?.id) {
      throw new Error('Must be logged in to create alerts');
    }

    const { data, error } = await supabase
      .from('safety_alerts')
      .insert({
        ...alertData,
        author_id: user.id,
        community_id: userLocation.community_id
      })
      .select(`
        *,
        profiles!inner(first_name, last_name, avatar_url),
        communities(name, city, state)
      `)
      .single();

    if (error) {
      throw error;
    }

    return data;
  };

  // Mark alert as resolved
  const resolveAlert = async (alertId: string) => {
    const { error } = await supabase
      .from('safety_alerts')
      .update({
        is_resolved: true,
        resolved_at: new Date().toISOString()
      })
      .eq('id', alertId);

    if (error) {
      throw error;
    }

    // Refresh alerts
    await fetchAlerts();
  };

  // Get active alerts count
  const getActiveAlertsCount = () => {
    return alerts.length;
  };

  // Get alerts by severity
  const getAlertsBySeverity = (severity: string) => {
    return alerts.filter(alert => alert.severity === severity);
  };

  // Get critical alerts count
  const getCriticalAlertsCount = () => {
    return alerts.filter(alert => alert.severity === 'critical').length;
  };

  return {
    alerts,
    loading,
    error,
    userLocation,
    createAlert,
    resolveAlert,
    fetchAlerts,
    getActiveAlertsCount,
    getAlertsBySeverity,
    getCriticalAlertsCount
  };
}