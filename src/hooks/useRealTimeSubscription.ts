import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface RealtimeSubscriptionOptions {
  table: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  filter?: string;
  schema?: string;
  onInsert?: (payload: any) => void;
  onUpdate?: (payload: any) => void;
  onDelete?: (payload: any) => void;
  onError?: (error: any) => void;
}

export function useRealTimeSubscription({
  table,
  event = '*',
  filter,
  schema = 'public',
  onInsert,
  onUpdate,
  onDelete,
  onError
}: RealtimeSubscriptionOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  
  useEffect(() => {
    // Create unique channel name
    const channelName = `realtime_${table}_${Date.now()}`;
    const channel = supabase.channel(channelName);
    
    // Configure postgres changes listener
    const config: any = {
      event,
      schema,
      table
    };
    
    if (filter) {
      config.filter = filter;
    }
    
    channel.on('postgres_changes', config, (payload) => {
      try {
        switch (payload.eventType) {
          case 'INSERT':
            onInsert?.(payload);
            break;
          case 'UPDATE':
            onUpdate?.(payload);
            break;
          case 'DELETE':
            onDelete?.(payload);
            break;
        }
      } catch (error) {
        console.error('Error handling realtime event:', error);
        onError?.(error);
      }
    });
    
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log(`Subscribed to ${table} changes`);
      } else if (status === 'CHANNEL_ERROR') {
        console.error(`Error subscribing to ${table} changes`);
        onError?.(new Error('Subscription failed'));
      }
    });
    
    channelRef.current = channel;
    
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [table, event, filter, schema]);
  
  const unsubscribe = () => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  };
  
  return { unsubscribe };
}