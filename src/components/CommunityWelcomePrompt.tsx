import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, X, Clock, Sparkles } from "lucide-react";

interface CommunityWelcomePromptProps {
  communityName: string;
  onDismiss: () => void;
  onCreatePost: () => void;
}

const CommunityWelcomePrompt = ({ 
  communityName, 
  onDismiss, 
  onCreatePost 
}: CommunityWelcomePromptProps) => {
  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5 animate-fade-in">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Welcome to {communityName}! 🎉
              </h3>
              <p className="text-muted-foreground mb-4">
                You've successfully joined the community! Why not introduce yourself and let everyone know a bit about you?
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={onCreatePost}
                  variant="cultural" 
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  Write Introduction Post
                </Button>
                <Button 
                  onClick={onDismiss}
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Clock className="w-4 h-4" />
                  Maybe Later
                </Button>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="p-1 h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CommunityWelcomePrompt;