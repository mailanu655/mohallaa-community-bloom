-- Add privacy settings to communities table
ALTER TABLE public.communities 
ADD COLUMN privacy_type TEXT NOT NULL DEFAULT 'public' CHECK (privacy_type IN ('public', 'private'));

-- Add columns for join requests and invitations
ALTER TABLE public.communities 
ADD COLUMN require_approval BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN auto_approve_members BOOLEAN NOT NULL DEFAULT true;

-- Create community join requests table
CREATE TABLE public.community_join_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(community_id, user_id)
);

-- Create community invitations table
CREATE TABLE public.community_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  invited_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  invited_email TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CHECK ((invited_user_id IS NOT NULL) OR (invited_email IS NOT NULL))
);

-- Enable RLS
ALTER TABLE public.community_join_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_invitations ENABLE ROW LEVEL SECURITY;

-- RLS policies for community_join_requests
CREATE POLICY "Users can view their own join requests" 
ON public.community_join_requests 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Community moderators can view join requests" 
ON public.community_join_requests 
FOR SELECT 
USING (can_moderate_community(auth.uid(), community_id));

CREATE POLICY "Users can create join requests" 
ON public.community_join_requests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Community moderators can update join requests" 
ON public.community_join_requests 
FOR UPDATE 
USING (can_moderate_community(auth.uid(), community_id));

-- RLS policies for community_invitations
CREATE POLICY "Users can view invitations sent to them" 
ON public.community_invitations 
FOR SELECT 
USING ((auth.uid() = invited_user_id) OR (auth.uid() = invited_by) OR can_moderate_community(auth.uid(), community_id));

CREATE POLICY "Community moderators can create invitations" 
ON public.community_invitations 
FOR INSERT 
WITH CHECK (can_moderate_community(auth.uid(), community_id) AND auth.uid() = invited_by);

CREATE POLICY "Invited users can update their invitations" 
ON public.community_invitations 
FOR UPDATE 
USING ((auth.uid() = invited_user_id) OR can_moderate_community(auth.uid(), community_id));

-- Add triggers for updated_at
CREATE TRIGGER update_community_join_requests_updated_at
BEFORE UPDATE ON public.community_join_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_community_invitations_updated_at
BEFORE UPDATE ON public.community_invitations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();