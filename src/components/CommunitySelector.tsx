
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus } from 'lucide-react';
import { useUserCommunities } from '@/hooks/useUserCommunities';
import CommunitySearchDialog from './CommunitySearchDialog';

interface Community {
  id: string;
  name: string;
  description?: string;
  member_count: number;
  privacy_type: string;
  city: string;
  state: string;
}

interface CommunitySelectorProps {
  value: string;
  onValueChange: (value: string) => void;
}

const CommunitySelector = ({ value, onValueChange }: CommunitySelectorProps) => {
  const { communities, loading } = useUserCommunities();
  const [showSearchDialog, setShowSearchDialog] = useState(false);

  const handleSelectFromSearch = (community: Community) => {
    onValueChange(community.id);
  };

  const selectedCommunity = communities.find(c => c.id === value);
  const displayValue = selectedCommunity ? selectedCommunity.name : value === 'general' ? 'General' : 'Select community';

  return (
    <>
      <div className="flex items-center space-x-2">
        <Select value={value} onValueChange={onValueChange}>
          <SelectTrigger className="w-auto h-8 border-0 bg-transparent text-xs min-w-[120px]">
            <SelectValue placeholder="Community">
              {displayValue}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="general">General</SelectItem>
            {communities.map(community => (
              <SelectItem key={community.id} value={community.id}>
                {community.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => setShowSearchDialog(true)}
          title="Browse more communities"
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>

      <CommunitySearchDialog
        open={showSearchDialog}
        onOpenChange={setShowSearchDialog}
        onSelectCommunity={handleSelectFromSearch}
      />
    </>
  );
};

export default CommunitySelector;
