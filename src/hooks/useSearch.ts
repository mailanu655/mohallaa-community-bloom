import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { debounce } from 'lodash-es';

interface SearchResult {
  id: string;
  title: string;
  content: string;
  type: 'post' | 'community' | 'user' | 'event' | 'business';
  created_at: string;
  author?: {
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
  community?: {
    name: string;
  };
  location?: string;
}

export const useSearch = () => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');

  const searchAll = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const searchTerm = searchQuery.trim();
      
      // Search posts
      const { data: posts } = await supabase
        .from('posts')
        .select(`
          id, title, content, created_at,
          profiles!posts_author_id_fkey(first_name, last_name, avatar_url),
          communities(name)
        `)
        .textSearch('search_vector', searchTerm)
        .limit(10);

      // Search communities
      const { data: communities } = await supabase
        .from('communities')
        .select('id, name, description, city, state, created_at')
        .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%`)
        .limit(5);

      // Search users
      const { data: users } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, bio, profession, avatar_url, created_at')
        .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,profession.ilike.%${searchTerm}%`)
        .limit(5);

      // Search events
      const { data: events } = await supabase
        .from('events')
        .select('id, title, description, location, start_date, created_at')
        .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`)
        .limit(5);

      // Search businesses
      const { data: businesses } = await supabase
        .from('businesses')
        .select('id, name, description, city, state, created_at')
        .textSearch('search_vector', searchTerm)
        .limit(5);

      // Combine results
      const allResults: SearchResult[] = [
        ...(posts || []).map(post => ({
          id: post.id,
          title: post.title,
          content: post.content,
          type: 'post' as const,
          created_at: post.created_at,
          author: post.profiles,
          community: post.communities
        })),
        ...(communities || []).map(community => ({
          id: community.id,
          title: community.name,
          content: community.description || '',
          type: 'community' as const,
          created_at: community.created_at,
          location: `${community.city}, ${community.state}`
        })),
        ...(users || []).map(user => ({
          id: user.id,
          title: `${user.first_name} ${user.last_name}`,
          content: user.bio || user.profession || '',
          type: 'user' as const,
          created_at: user.created_at,
          author: {
            first_name: user.first_name,
            last_name: user.last_name,
            avatar_url: user.avatar_url
          }
        })),
        ...(events || []).map(event => ({
          id: event.id,
          title: event.title,
          content: event.description || '',
          type: 'event' as const,
          created_at: event.created_at,
          location: event.location
        })),
        ...(businesses || []).map(business => ({
          id: business.id,
          title: business.name,
          content: business.description || '',
          type: 'business' as const,
          created_at: business.created_at,
          location: `${business.city}, ${business.state}`
        }))
      ];

      // Sort by relevance (for now, just by creation date)
      allResults.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setResults(allResults);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = useCallback(
    debounce((searchQuery: string) => {
      searchAll(searchQuery);
    }, 300),
    []
  );

  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  return {
    results,
    loading,
    query,
    setQuery,
    search: searchAll
  };
};