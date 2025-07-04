import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Filter,
  MapPin,
  Clock,
  DollarSign,
  Gift,
  Plus,
  Heart,
  MessageCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

const MarketplacePage = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priceFilter, setPriceFilter] = useState('');

  useEffect(() => {
    fetchMarketplaceItems();
  }, []);

  useEffect(() => {
    filterItems();
  }, [items, searchTerm, categoryFilter, priceFilter]);

  const fetchMarketplaceItems = async () => {
    try {
      const { data, error } = await supabase
        .from('marketplace')
        .select(`
          *,
          profiles!inner(first_name, last_name, avatar_url),
          communities(name, city, state)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching marketplace items:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = items;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter) {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }

    if (priceFilter === 'free') {
      filtered = filtered.filter(item => !item.price || item.price === 0);
    } else if (priceFilter === 'paid') {
      filtered = filtered.filter(item => item.price && item.price > 0);
    }

    setFilteredItems(filtered);
  };

  const categories = [
    { value: 'goods', label: 'Goods' },
    { value: 'services', label: 'Services' },
    { value: 'housing', label: 'Housing' },
    { value: 'jobs', label: 'Jobs' }
  ];

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">For Sale & Free</h1>
          <p className="text-muted-foreground">
            Discover items for sale and free in your neighborhood
          </p>
        </div>
        <Button variant="cultural" asChild>
          <Link to="/marketplace/create">
            <Plus className="w-4 h-4 mr-2" />
            List an Item
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={priceFilter} onValueChange={setPriceFilter}>
              <SelectTrigger className="w-full md:w-32">
                <SelectValue placeholder="Price" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Prices</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="paid">For Sale</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('');
                setPriceFilter('');
              }}
            >
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} found
        </p>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Sort by: Recent</span>
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <Card key={item.id} className="hover:shadow-lg transition-shadow overflow-hidden">
            <div className="aspect-video bg-muted flex items-center justify-center">
              {item.images && item.images.length > 0 ? (
                <img 
                  src={item.images[0]} 
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-muted-foreground">
                  {item.price === 0 || !item.price ? (
                    <Gift className="w-12 h-12" />
                  ) : (
                    <DollarSign className="w-12 h-12" />
                  )}
                </div>
              )}
            </div>
            
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {item.description}
                  </p>
                </div>
                <Badge 
                  variant={item.price === 0 || !item.price ? 'secondary' : 'default'}
                  className="ml-2"
                >
                  {item.price === 0 || !item.price ? 'FREE' : `$${item.price}`}
                </Badge>
              </div>

              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs capitalize">
                  {item.category}
                </Badge>
                {item.is_negotiable && (
                  <Badge variant="outline" className="text-xs">
                    Negotiable
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={item.profiles?.avatar_url} />
                    <AvatarFallback className="text-xs">
                      {item.profiles?.first_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-muted-foreground">
                    {item.profiles?.first_name}
                  </span>
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                </div>
              </div>

              {item.location && (
                <div className="flex items-center text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3 mr-1" />
                  {item.location}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button size="sm" className="flex-1">
                  <MessageCircle className="w-4 h-4 mr-1" />
                  Contact
                </Button>
                <Button variant="outline" size="sm">
                  <Heart className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No items found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search filters or be the first to list an item!
          </p>
          <Button variant="cultural" asChild>
            <Link to="/marketplace/create">
              <Plus className="w-4 h-4 mr-2" />
              List an Item
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
};

export default MarketplacePage;