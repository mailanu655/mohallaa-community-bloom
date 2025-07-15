import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollText, Shield, Users, MessageSquare } from 'lucide-react';

interface CommunityRulesProps {
  rules?: string;
  communityName: string;
}

const CommunityRules = ({ rules, communityName }: CommunityRulesProps) => {
  const defaultRules = [
    "Be respectful and courteous to all community members",
    "No spam, self-promotion, or irrelevant content",
    "Keep discussions relevant to the community topic",
    "No hate speech, discrimination, or offensive language",
    "Respect privacy - don't share personal information without consent",
    "Use appropriate language and maintain a family-friendly environment",
    "Report inappropriate content to moderators",
    "Follow local laws and regulations",
    "Help create a welcoming environment for all members"
  ];

  const customRules = rules ? rules.split('\n').filter(rule => rule.trim()) : [];
  const displayRules = customRules.length > 0 ? customRules : defaultRules;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ScrollText className="w-5 h-5" />
          Community Rules & Guidelines
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Please read and follow these guidelines to maintain a positive environment in {communityName}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {displayRules.map((rule, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <Badge variant="outline" className="mt-0.5 min-w-fit">
                {index + 1}
              </Badge>
              <p className="text-sm leading-relaxed">{rule}</p>
            </div>
          ))}
        </div>

        <div className="border-t pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center gap-2 p-3 bg-primary/5 rounded-lg">
              <Shield className="w-6 h-6 text-primary" />
              <div>
                <p className="font-semibold text-sm">Moderation</p>
                <p className="text-xs text-muted-foreground">
                  Posts may be moderated
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
              <div>
                <p className="font-semibold text-sm">Community</p>
                <p className="text-xs text-muted-foreground">
                  Help build a great community
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <MessageSquare className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-semibold text-sm">Discussion</p>
                <p className="text-xs text-muted-foreground">
                  Keep conversations constructive
                </p>
              </div>
            </div>
          </div>
        </div>

        {customRules.length === 0 && (
          <div className="text-center text-sm text-muted-foreground p-4 bg-muted/30 rounded-lg">
            <ScrollText className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>These are the default community guidelines.</p>
            <p>Community admins can customize these rules.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CommunityRules;