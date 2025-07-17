import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ApiErrorHandler } from '@/utils/errorHandler';
import { useRealTimeSubscription } from '@/hooks/useRealTimeSubscription';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  related_id?: string;
  related_type?: string;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const updateUnreadCount = useCallback((notifs?: Notification[]) => {
    const currentNotifs = notifs || notifications;
    setUnreadCount(currentNotifs.filter(n => !n.read).length);
  }, [notifications]);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      
      setNotifications(data || []);
      updateUnreadCount(data || []);
    } catch (error) {
      ApiErrorHandler.showToast(error, 'fetchNotifications');
    } finally {
      setLoading(false);
    }
  }, [user?.id]); // Only depend on user.id to prevent excessive re-fetching

  // Set up real-time subscription
  useRealTimeSubscription({
    table: 'notifications',
    filter: user ? `user_id=eq.${user.id}` : undefined,
    onInsert: (payload) => {
      const newNotification = payload.new as Notification;
      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Show toast for new notification
      toast({
        title: newNotification.title,
        description: newNotification.message,
      });
    },
    onUpdate: (payload) => {
      const updated = payload.new as Notification;
      setNotifications(prev => 
        prev.map(n => n.id === updated.id ? updated : n)
      );
      updateUnreadCount();
    },
    onError: (error) => {
      console.error('Notification subscription error:', error);
    }
  });

  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
    }
  }, [user?.id, fetchNotifications]); // Only trigger once per user

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;
    } catch (error) {
      ApiErrorHandler.showToast(error, 'markAsRead');
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) throw error;
      
      setUnreadCount(0);
    } catch (error) {
      ApiErrorHandler.showToast(error, 'markAllAsRead');
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications
  };
};