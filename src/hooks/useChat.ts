import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  id: string;
  sender_id: string;
  recipient_id?: string;
  community_id?: string;
  content: string;
  message_type: string;
  read: boolean;
  created_at: string;
  attachments?: any;
  sender?: {
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
}

interface ChatUser {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  last_message?: Message;
  unread_count: number;
}

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatUsers, setChatUsers] = useState<ChatUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    fetchChatUsers();
    setupRealtimeSubscription();

    return () => {
      supabase.removeAllChannels();
    };
  }, [user]);

  const fetchChatUsers = async () => {
    if (!user) return;

    try {
      // Get unique chat partners from profiles table
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url')
        .neq('id', user.id)
        .limit(10);

      if (error) throw error;

      setChatUsers((profiles || []).map(profile => ({
        ...profile,
        unread_count: 0
      })));
    } catch (error) {
      console.error('Error fetching chat users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (partnerId: string) => {
    if (!user) return;

    try {
      const { data: messageData, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},recipient_id.eq.${partnerId}),and(sender_id.eq.${partnerId},recipient_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Get sender profiles
      const senderIds = [...new Set(messageData?.map(m => m.sender_id) || [])];
      const { data: senderProfiles } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url')
        .in('id', senderIds);

      const messagesWithSender = (messageData || []).map(msg => ({
        ...msg,
        sender: senderProfiles?.find(p => p.id === msg.sender_id)
      }));
      
      setMessages(messagesWithSender as Message[]);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async (content: string, recipientId?: string, communityId?: string) => {
    if (!user || !content.trim()) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          recipient_id: recipientId,
          community_id: communityId,
          content: content.trim(),
          message_type: 'text'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const setupRealtimeSubscription = () => {
    if (!user) return;

    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `or(sender_id.eq.${user.id},recipient_id.eq.${user.id})`
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages(prev => [...prev, newMessage]);
          fetchChatUsers(); // Refresh chat users list
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  return {
    messages,
    chatUsers,
    loading,
    fetchMessages,
    sendMessage,
    refetch: fetchChatUsers
  };
};