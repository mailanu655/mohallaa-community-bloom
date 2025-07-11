import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Users, Search, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import CommunityJoinButton from "@/components/CommunityJoinButton";

const CommunitiesPage = () => {
  const [communities, setCommunities] = useState([]);
  const [filteredCommunities, setFilteredCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedState, setSelectedState] = useState("all");
  const [selectedType, setSelectedType] = useState("all");

  useEffect(() => {
    fetchCommunities();
  }, []);

  useEffect(() => {
    filterCommunities();
  }, [communities, searchTerm, selectedState, selectedType]);

  const fetchCommunities = async () => {
    try {
      const { data } = await supabase
        .from('communities')
        .select('*')
        .order('member_count', { ascending: false });

      setCommunities(data || []);
    } catch (error) {
      console.error('Error fetching communities:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCommunities = () => {
    let filtered = communities;

    if (searchTerm) {
      filtered = filtered.filter(community =>
        community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        community.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        community.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedState && selectedState !== "all") {
      filtered = filtered.filter(community => community.state === selectedState);
    }

    if (selectedType && selectedType !== "all") {
      filtered = filtered.filter(community => community.type === selectedType);
    }

    setFilteredCommunities(filtered);
  };

  const states = [...new Set(communities.map(c => c.state))].sort();
  const types = [...new Set(communities.map(c => c.type))].sort();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-warm">
        <div className="max-w-7xl mx-auto p-6 space-y-8">
          {/* Header Skeleton */}
          <div className="text-center space-y-4 animate-pulse">
            <div className="h-12 bg-card/20 rounded w-96 mx-auto"></div>
            <div className="h-6 bg-card/20 rounded w-2/3 mx-auto"></div>
          </div>

          {/* Search and Filters Skeleton */}
          <Card className="border-0 bg-card/20 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-10 bg-muted/20 rounded"></div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Communities Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
              <Card key={i} className="border-0 bg-card/20 backdrop-blur-sm animate-pulse">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="h-6 bg-muted/20 rounded w-3/4"></div>
                      <div className="h-4 bg-muted/20 rounded w-1/2"></div>
                    </div>
                    <div className="h-6 bg-muted/20 rounded w-16"></div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="h-4 bg-muted/20 rounded w-2/3"></div>
                    <div className="h-4 bg-muted/20 rounded w-1/2"></div>
                  </div>
                  <div className="h-12 bg-muted/20 rounded w-full"></div>
                  <div className="flex items-center justify-between pt-2">
                    <div className="h-8 bg-muted/20 rounded w-24"></div>
                    <div className="h-8 bg-muted/20 rounded w-16"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-warm">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Discover{" "}
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              Communities
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Connect with Indian communities across America. Find your local network and build meaningful relationships.
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="border-0 bg-card/80 backdrop-blur-sm animate-fade-in">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search communities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger>
                  <SelectValue placeholder="Select State" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All States</SelectItem>
                  {states.map(state => (
                    <SelectItem key={state} value={state}>{state}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Community Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {types.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedState("all");
                  setSelectedType("all");
                }}
                className="flex items-center"
              >
                <Filter className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="flex items-center justify-between animate-fade-in">
          <p className="text-muted-foreground">
            Showing {filteredCommunities.length} of {communities.length} communities
          </p>
        </div>

        {/* Communities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          {filteredCommunities.map((community) => (
            <Card
              key={community.id}
              className="hover:shadow-cultural transition-all duration-300 hover:-translate-y-2 border-0 bg-card/80 backdrop-blur-sm"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-xl font-semibold text-foreground line-clamp-2">
                    {community.name}
                  </CardTitle>
                  <Badge variant="secondary" className="ml-2">
                    {community.type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span className="text-sm">{community.city}, {community.state}</span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Users className="w-4 h-4 mr-2" />
                    <span className="text-sm">{community.member_count || 0} members</span>
                  </div>
                </div>

                {community.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {community.description}
                  </p>
                )}

                <div className="flex items-center justify-between pt-2">
                  <div className="flex space-x-2">
                    <Button variant="hero" size="sm" asChild>
                      <Link to={`/community/${community.id}`}>
                        View Community
                      </Link>
                    </Button>
                  </div>
                  <CommunityJoinButton 
                    communityId={community.id}
                    requiresApproval={community.require_approval}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCommunities.length === 0 && (
          <Card className="border-0 bg-card/80 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-muted rounded-full mx-auto flex items-center justify-center">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">No communities found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search criteria or browse all communities.
                  </p>
                </div>
                <Button
                  variant="cultural"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedState("all");
                    setSelectedType("all");
                  }}
                >
                  Show All Communities
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CommunitiesPage;