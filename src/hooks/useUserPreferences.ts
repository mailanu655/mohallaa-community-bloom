import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UserPreferences {
  preferred_post_types: string[];
  preferred_categories: string[];
  interaction_weights: {
    view: number;
    like: number;
    comment: number;
    share: number;
    bookmark: number;
  };
  personalization_enabled: boolean;
}

export const useUserPreferences = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences>({
    preferred_post_types: [],
    preferred_categories: [],
    interaction_weights: {
      view: 1,
      like: 5,
      comment: 10,
      share: 15,
      bookmark: 8
    },
    personalization_enabled: true
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPreferences = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setPreferences({
          preferred_post_types: data.preferred_post_types || [],
          preferred_categories: data.preferred_categories || [],
          interaction_weights: (data.interaction_weights as any) || {
            view: 1,
            like: 5,
            comment: 10,
            share: 15,
            bookmark: 8
          },
          personalization_enabled: data.personalization_enabled ?? true
        });
      }
    } catch (err) {
      console.error('Error fetching user preferences:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch preferences');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updatePreferences = useCallback(async (updates: Partial<UserPreferences>) => {
    if (!user) return;

    try {
      setError(null);
      
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          ...updates
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      setPreferences(prev => ({ ...prev, ...updates }));
    } catch (err) {
      console.error('Error updating preferences:', err);
      setError(err instanceof Error ? err.message : 'Failed to update preferences');
    }
  }, [user]);

  const togglePersonalization = useCallback(async () => {
    await updatePreferences({
      personalization_enabled: !preferences.personalization_enabled
    });
  }, [preferences.personalization_enabled, updatePreferences]);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  return {
    preferences,
    loading,
    error,
    updatePreferences,
    togglePersonalization,
    refreshPreferences: fetchPreferences
  };
};