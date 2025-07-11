import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, UserPlus, UserCheck, Clock, X } from 'lucide-react';
import { useCommunityMembership } from '@/hooks/useCommunityMembership';
import { useAuth } from '@/contexts/AuthContext';

interface CommunityJoinButtonProps {
  communityId: string;
  requiresApproval?: boolean;
}

const CommunityJoinButton = ({ communityId, requiresApproval }: CommunityJoinButtonProps) => {
  const { user } = useAuth();
  const { 
    isMember, 
    hasPendingRequest, 
    joining, 
    joinCommunity, 
    leaveCommunity, 
    cancelJoinRequest 
  } = useCommunityMembership(communityId);
  
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [message, setMessage] = useState('');

  if (!user) {
    return null;
  }

  const handleJoin = async () => {
    if (requiresApproval) {
      setShowMessageDialog(true);
    } else {
      await joinCommunity();
    }
  };

  const handleJoinWithMessage = async () => {
    await joinCommunity(message);
    setShowMessageDialog(false);
    setMessage('');
  };

  if (isMember) {
    return (
      <Button 
        variant="outline" 
        size="sm"
        onClick={leaveCommunity}
        className="flex items-center gap-2"
      >
        <UserCheck className="w-4 h-4" />
        Member
      </Button>
    );
  }

  if (hasPendingRequest) {
    return (
      <Button 
        variant="outline" 
        size="sm"
        onClick={cancelJoinRequest}
        className="flex items-center gap-2"
      >
        <Clock className="w-4 h-4" />
        Pending
        <X className="w-3 h-3 ml-1" />
      </Button>
    );
  }

  return (
    <>
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleJoin}
        disabled={joining}
        className="flex items-center gap-2"
      >
        {joining ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <UserPlus className="w-4 h-4" />
        )}
        Join
      </Button>

      <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Join Community</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="message">Message (Optional)</Label>
              <Textarea
                id="message"
                placeholder="Tell the community why you'd like to join..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="mt-2"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setShowMessageDialog(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleJoinWithMessage}
                disabled={joining}
              >
                {joining ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Send Request
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CommunityJoinButton;