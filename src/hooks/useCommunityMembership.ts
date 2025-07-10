import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface CommunityMembership {
  id: string;
  user_id: string;
  community_id: string;
  role: string;
  joined_at: string;
}

export const useCommunityMembership = (communityId: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [membership, setMembership] = useState<CommunityMembership | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>('guest');

  useEffect(() => {
    if (user && communityId) {
      fetchMembership();
    } else {
      setIsLoading(false);
    }
  }, [user, communityId]);

  const fetchMembership = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('community_members')
        .select('*')
        .eq('user_id', user.id)
        .eq('community_id', communityId)
        .maybeSingle();

      if (error) throw error;

      setMembership(data);
      setUserRole(data?.role || 'guest');
    } catch (error) {
      console.error('Error fetching membership:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const joinCommunity = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to join this community.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // First, ensure the user has a profile
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (!existingProfile) {
        // Create a basic profile for the user
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email || '',
            first_name: user.user_metadata?.first_name || '',
            last_name: user.user_metadata?.last_name || ''
          });

        if (profileError) {
          console.error('Error creating profile:', profileError);
          throw new Error('Failed to create user profile');
        }
      }

      // Now join the community
      const { data, error } = await supabase
        .from('community_members')
        .insert({
          user_id: user.id,
          community_id: communityId,
          role: 'member'
        })
        .select()
        .single();

      if (error) throw error;

      setMembership(data);
      setUserRole('member');
      toast({
        title: "Welcome!",
        description: "You've successfully joined the community."
      });
    } catch (error) {
      console.error('Error joining community:', error);
      toast({
        title: "Error",
        description: "Failed to join community. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const leaveCommunity = async () => {
    if (!user || !membership) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('community_members')
        .delete()
        .eq('id', membership.id);

      if (error) throw error;

      setMembership(null);
      setUserRole('guest');
      toast({
        title: "Left Community",
        description: "You've left the community."
      });
    } catch (error) {
      console.error('Error leaving community:', error);
      toast({
        title: "Error",
        description: "Failed to leave community. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateMemberRole = async (memberId: string, newRole: string) => {
    if (!canModerate) return;

    try {
      const { error } = await supabase
        .from('community_members')
        .update({ role: newRole })
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: "Role Updated",
        description: `Member role updated to ${newRole}.`
      });
      
      // Refresh membership data if it's the current user
      if (membership?.id === memberId) {
        await fetchMembership();
      }
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: "Error",
        description: "Failed to update member role.",
        variant: "destructive"
      });
    }
  };

  const removeMember = async (memberId: string) => {
    if (!canModerate) return;

    try {
      const { error } = await supabase
        .from('community_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: "Member Removed",
        description: "Member has been removed from the community."
      });
    } catch (error) {
      console.error('Error removing member:', error);
      toast({
        title: "Error",
        description: "Failed to remove member.",
        variant: "destructive"
      });
    }
  };

  const isMember = !!membership;
  const canModerate = ['owner', 'admin', 'moderator'].includes(userRole);
  const canManageRoles = ['owner', 'admin'].includes(userRole);
  const isOwner = userRole === 'owner';

  return {
    membership,
    userRole,
    isMember,
    canModerate,
    canManageRoles,
    isOwner,
    isLoading,
    joinCommunity,
    leaveCommunity,
    updateMemberRole,
    removeMember,
    refreshMembership: fetchMembership
  };
};