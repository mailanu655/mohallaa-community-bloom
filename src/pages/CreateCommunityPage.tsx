import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { MapPin, Users, Globe, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const CreateCommunityPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'city' as const,
    city: '',
    state: '',
    zip_code: '',
    neighborhood_name: '',
    privacy_type: 'public',
    require_approval: false,
    auto_approve_members: true,
    is_indian_diaspora_focused: true,
    radius_miles: '5'
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const communityData = {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zip_code || null,
        neighborhood_name: formData.neighborhood_name || null,
        privacy_type: formData.privacy_type,
        require_approval: formData.require_approval,
        auto_approve_members: formData.auto_approve_members,
        is_indian_diaspora_focused: formData.is_indian_diaspora_focused,
        radius_miles: parseInt(formData.radius_miles)
      };

      const { data: community, error } = await supabase
        .from('communities')
        .insert([communityData])
        .select()
        .single();

      if (error) throw error;

      // Add the creator as the first member with owner role
      if (community) {
        await supabase
          .from('community_members')
          .insert([{
            community_id: community.id,
            user_id: user.id,
            role: 'owner'
          }]);
      }

      toast({
        title: "Community Created!",
        description: "Your community has been created successfully.",
      });

      navigate('/communities');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create community",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const usStates = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
    'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
    'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
    'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
    'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
    'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
    'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
    'Wisconsin', 'Wyoming'
  ];

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Create Community</h1>
        <p className="text-muted-foreground">
          Start a new community to connect with Indians in your area
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Community Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Community Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Community Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Indians in Silicon Valley, Desi Community NYC"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your community, its purpose, and what members can expect..."
                rows={4}
              />
            </div>

            {/* Community Type */}
            <div className="space-y-2">
              <Label htmlFor="type">Community Type</Label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="city">City-based Community</SelectItem>
                  <SelectItem value="neighborhood">Neighborhood Community</SelectItem>
                  <SelectItem value="region">Regional Community</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Location */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city" className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    City *
                  </Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="e.g., San Francisco"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Select value={formData.state} onValueChange={(value) => handleInputChange('state', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {usStates.map(state => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="zip_code">ZIP Code</Label>
                  <Input
                    id="zip_code"
                    value={formData.zip_code}
                    onChange={(e) => handleInputChange('zip_code', e.target.value)}
                    placeholder="e.g., 94103"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="neighborhood_name">Neighborhood (Optional)</Label>
                  <Input
                    id="neighborhood_name"
                    value={formData.neighborhood_name}
                    onChange={(e) => handleInputChange('neighborhood_name', e.target.value)}
                    placeholder="e.g., SOMA, Brooklyn Heights"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="radius_miles">Community Radius (miles)</Label>
                <Select value={formData.radius_miles} onValueChange={(value) => handleInputChange('radius_miles', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 miles</SelectItem>
                    <SelectItem value="5">5 miles</SelectItem>
                    <SelectItem value="10">10 miles</SelectItem>
                    <SelectItem value="25">25 miles</SelectItem>
                    <SelectItem value="50">50 miles</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Privacy Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Privacy & Membership Settings
              </h3>

              <div className="space-y-2">
                <Label htmlFor="privacy_type">Privacy Type</Label>
                <Select value={formData.privacy_type} onValueChange={(value) => handleInputChange('privacy_type', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        Public - Anyone can join
                      </div>
                    </SelectItem>
                    <SelectItem value="private">
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        Private - Invitation only
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="require_approval"
                    checked={formData.require_approval}
                    onCheckedChange={(checked) => handleInputChange('require_approval', checked as boolean)}
                  />
                  <Label htmlFor="require_approval">Require approval for new members</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="auto_approve_members"
                    checked={formData.auto_approve_members}
                    onCheckedChange={(checked) => handleInputChange('auto_approve_members', checked as boolean)}
                  />
                  <Label htmlFor="auto_approve_members">Auto-approve members (if approval required)</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_indian_diaspora_focused"
                    checked={formData.is_indian_diaspora_focused}
                    onCheckedChange={(checked) => handleInputChange('is_indian_diaspora_focused', checked as boolean)}
                  />
                  <Label htmlFor="is_indian_diaspora_focused">Focus on Indian diaspora community</Label>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/communities')}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !formData.name || !formData.city || !formData.state}
                className="flex-1"
              >
                {loading ? 'Creating...' : 'Create Community'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateCommunityPage;