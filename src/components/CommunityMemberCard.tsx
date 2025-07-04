import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Shield, Crown, Star, User } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CommunityMemberCardProps {
  member: {
    id: string;
    user_id: string;
    role: string;
    joined_at: string;
    profiles: {
      first_name: string;
      last_name: string;
      avatar_url?: string;
      profession?: string;
      bio?: string;
      skills?: string[];
      is_verified?: boolean;
    };
  };
  canModerate: boolean;
  canManageRoles: boolean;
  currentUserRole: string;
  onRoleUpdate: (memberId: string, newRole: string) => void;
  onRemoveMember: (memberId: string) => void;
}

const getRoleIcon = (role: string) => {
  switch (role) {
    case 'owner': return Crown;
    case 'admin': return Shield;
    case 'moderator': return Star;
    default: return User;
  }
};

const getRoleColor = (role: string) => {
  switch (role) {
    case 'owner': return 'default';
    case 'admin': return 'secondary';
    case 'moderator': return 'outline';
    default: return 'secondary';
  }
};

const CommunityMemberCard: React.FC<CommunityMemberCardProps> = ({
  member,
  canModerate,
  canManageRoles,
  currentUserRole,
  onRoleUpdate,
  onRemoveMember
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const RoleIcon = getRoleIcon(member.role);

  const handleRoleUpdate = async (newRole: string) => {
    setIsUpdating(true);
    await onRoleUpdate(member.id, newRole);
    setIsUpdating(false);
  };

  const handleRemoveMember = async () => {
    setIsUpdating(true);
    await onRemoveMember(member.id);
    setIsUpdating(false);
  };

  const canManageThisMember = canManageRoles && member.role !== 'owner' && member.role !== currentUserRole;

  return (
    <Card className="border-0 bg-card/80 backdrop-blur-sm hover:shadow-cultural transition-all duration-300 hover:-translate-y-1">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="w-12 h-12">
                <AvatarImage src={member.profiles.avatar_url} />
                <AvatarFallback>
                  {member.profiles.first_name?.[0]}{member.profiles.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">
                    {member.profiles.first_name} {member.profiles.last_name}
                  </h3>
                  {member.profiles.is_verified && (
                    <Badge variant="default" className="text-xs">Verified</Badge>
                  )}
                </div>
                {member.profiles.profession && (
                  <p className="text-sm text-muted-foreground">{member.profiles.profession}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant={getRoleColor(member.role)} className="flex items-center gap-1">
                <RoleIcon className="w-3 h-3" />
                {member.role}
              </Badge>
              
              {canManageThisMember && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0"
                      disabled={isUpdating}
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-card border-border">
                    {member.role !== 'admin' && (
                      <DropdownMenuItem onClick={() => handleRoleUpdate('admin')}>
                        <Shield className="w-4 h-4 mr-2" />
                        Make Admin
                      </DropdownMenuItem>
                    )}
                    {member.role !== 'moderator' && (
                      <DropdownMenuItem onClick={() => handleRoleUpdate('moderator')}>
                        <Star className="w-4 h-4 mr-2" />
                        Make Moderator
                      </DropdownMenuItem>
                    )}
                    {member.role !== 'member' && (
                      <DropdownMenuItem onClick={() => handleRoleUpdate('member')}>
                        <User className="w-4 h-4 mr-2" />
                        Make Member
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem 
                      onClick={handleRemoveMember}
                      className="text-destructive focus:text-destructive"
                    >
                      Remove Member
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
          
          {member.profiles.bio && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {member.profiles.bio}
            </p>
          )}
          
          {member.profiles.skills && member.profiles.skills.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {member.profiles.skills.slice(0, 3).map((skill, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {member.profiles.skills.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{member.profiles.skills.length - 3}
                </Badge>
              )}
            </div>
          )}
          
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-muted-foreground">
              Joined {new Date(member.joined_at).toLocaleDateString()}
            </span>
            <Button variant="outline" size="sm" asChild>
              <Link to={`/profile/${member.user_id}`}>
                View Profile
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CommunityMemberCard;