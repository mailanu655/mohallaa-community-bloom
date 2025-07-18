
import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Users, Globe, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { debounce } from 'lodash-es';

interface Community {
  id: string;
  name: string;
  description?: string;
  member_count: number;
  privacy_type: string;
  city: string;
  state: string;
}

interface CommunitySearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectCommunity: (community: Community) => void;
}

const CommunitySearchDialog = ({ open, onOpenChange, onSelectCommunity }: CommunitySearchDialogProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Community[]>([]);
  const [loading, setLoading] = useState(false);

  const searchCommunities = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    console.log('Searching for communities with query:', query);
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('communities')
        .select('id, name, description, member_count, privacy_type, city, state')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,city.ilike.%${query}%`)
        .order('member_count', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Search error:', error);
        throw error;
      }

      console.log('Search results:', data);
      setSearchResults(data || []);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedSearch = useCallback(
    debounce((query: string) => {
      searchCommunities(query);
    }, 300),
    [searchCommunities]
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
    
    // Cleanup function to cancel pending debounced calls
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchQuery, debouncedSearch]);

  const handleSelectCommunity = (community: Community) => {
    onSelectCommunity(community);
    onOpenChange(false);
    setSearchQuery('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Browse Communities</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search communities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <ScrollArea className="h-96">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="text-muted-foreground">Searching...</div>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-2">
                {searchResults.map((community) => (
                  <Button
                    key={community.id}
                    variant="ghost"
                    className="w-full justify-start p-3 h-auto text-left"
                    onClick={() => handleSelectCommunity(community)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {community.privacy_type === 'private' ? (
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Globe className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{community.name}</div>
                        <div className="text-sm text-muted-foreground truncate">
                          {community.city}, {community.state}
                        </div>
                        {community.description && (
                          <div className="text-xs text-muted-foreground line-clamp-2 mt-1">
                            {community.description}
                          </div>
                        )}
                        <div className="flex items-center space-x-1 mt-1">
                          <Users className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {community.member_count} members
                          </span>
                        </div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            ) : searchQuery ? (
              <div className="flex items-center justify-center p-8">
                <div className="text-muted-foreground">No communities found</div>
              </div>
            ) : (
              <div className="flex items-center justify-center p-8">
                <div className="text-muted-foreground">Start typing to search communities</div>
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommunitySearchDialog;
