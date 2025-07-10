import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useCommunityJoinRequests } from "@/hooks/useCommunityJoinRequests";

interface CommunityJoinRequestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  communityId: string;
  communityName: string;
}

const CommunityJoinRequestDialog = ({ 
  isOpen, 
  onClose, 
  communityId, 
  communityName 
}: CommunityJoinRequestDialogProps) => {
  const [message, setMessage] = useState("");
  const { submitJoinRequest, isLoading } = useCommunityJoinRequests(communityId);

  const handleSubmit = async () => {
    const success = await submitJoinRequest(message);
    if (success) {
      setMessage("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request to Join {communityName}</DialogTitle>
          <DialogDescription>
            This is a private community. Send a request to the community moderators explaining why you'd like to join.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Tell the moderators why you'd like to join this community..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="mt-2"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isLoading}
            variant="cultural"
          >
            {isLoading ? "Sending..." : "Send Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CommunityJoinRequestDialog;