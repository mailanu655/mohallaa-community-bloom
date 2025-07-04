import { useState, useRef, useEffect } from 'react';
import { Search, X, User, MessageSquare, MapPin, Calendar, Building } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSearch } from '@/hooks/useSearch';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const SearchBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { results, loading, query, setQuery } = useSearch();
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'post': return <MessageSquare className="w-4 h-4" />;
      case 'community': return <MapPin className="w-4 h-4" />;
      case 'user': return <User className="w-4 h-4" />;
      case 'event': return <Calendar className="w-4 h-4" />;
      case 'business': return <Building className="w-4 h-4" />;
      default: return <Search className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'post': return 'bg-blue-500';
      case 'community': return 'bg-green-500';
      case 'user': return 'bg-purple-500';
      case 'event': return 'bg-orange-500';
      case 'business': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getResultLink = (result: any) => {
    switch (result.type) {
      case 'post': return `/post/${result.id}`;
      case 'community': return `/community/${result.id}`;
      case 'user': return `/profile/${result.id}`;
      case 'event': return `/event/${result.id}`;
      case 'business': return `/business/${result.id}`;
      default: return '#';
    }
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search communities, posts, people, events..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="pl-10 pr-10 bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary/50 transition-colors"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {isOpen && (query || results.length > 0) && (
        <Card className="absolute top-full left-0 right-0 mt-2 max-h-96 overflow-hidden z-50 border-0 bg-card/95 backdrop-blur-sm shadow-cultural">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-2">Searching...</p>
              </div>
            ) : results.length > 0 ? (
              <div className="max-h-80 overflow-y-auto">
                {results.map((result) => (
                  <Link
                    key={`${result.type}-${result.id}`}
                    to={getResultLink(result)}
                    onClick={() => setIsOpen(false)}
                    className="block hover:bg-muted/50 transition-colors"
                  >
                    <div className="p-4 border-b border-border/50 last:border-0">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-full ${getTypeColor(result.type)} text-white`}>
                          {getTypeIcon(result.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-foreground truncate">
                              {result.title}
                            </h4>
                            <Badge variant="secondary" className="text-xs">
                              {result.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {result.content}
                          </p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center space-x-2">
                              {result.author && (
                                <div className="flex items-center space-x-1">
                                  <Avatar className="w-4 h-4">
                                    <AvatarImage src={result.author.avatar_url} />
                                    <AvatarFallback className="text-xs">
                                      {result.author.first_name[0]}{result.author.last_name[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span>
                                    {result.author.first_name} {result.author.last_name}
                                  </span>
                                </div>
                              )}
                              {result.community && (
                                <span>in {result.community.name}</span>
                              )}
                              {result.location && (
                                <span>{result.location}</span>
                              )}
                            </div>
                            <span>
                              {formatDistanceToNow(new Date(result.created_at), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : query ? (
              <div className="p-4 text-center text-muted-foreground">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No results found for "{query}"</p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SearchBar;