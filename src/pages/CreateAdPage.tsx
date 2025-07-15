import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, ArrowLeft, DollarSign, Target, Image, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import FileUploader from '@/components/FileUploader';

export const CreateAdPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [communities, setCommunities] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    target_url: '',
    ad_type: 'banner',
    placement_type: 'marketplace',
    target_location: '',
    target_community_id: '',
    budget_total: '',
    budget_daily: '',
    cost_per_click: '0.50',
    start_date: new Date(),
    end_date: null as Date | null,
    has_end_date: false
  });

  React.useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    const { data } = await supabase
      .from('communities')
      .select('id, name, city, state')
      .order('name');
    
    if (data) setCommunities(data);
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (url: string) => {
    updateFormData('image_url', url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create an advertisement.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.title || !formData.budget_total) {
      toast({
        title: "Required fields missing",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from('advertisements').insert({
        advertiser_id: user.id,
        title: formData.title,
        description: formData.description,
        image_url: formData.image_url || null,
        target_url: formData.target_url || null,
        ad_type: formData.ad_type,
        placement_type: formData.placement_type,
        target_location: formData.target_location || null,
        target_community_id: formData.target_community_id || null,
        budget_total: parseFloat(formData.budget_total),
        budget_daily: formData.budget_daily ? parseFloat(formData.budget_daily) : null,
        cost_per_click: parseFloat(formData.cost_per_click),
        start_date: formData.start_date.toISOString(),
        end_date: formData.has_end_date && formData.end_date ? formData.end_date.toISOString() : null,
      });

      if (error) throw error;

      toast({
        title: "Advertisement created!",
        description: "Your ad has been submitted for review and will be active once approved.",
      });

      navigate('/ads-dashboard');
    } catch (error) {
      console.error('Error creating advertisement:', error);
      toast({
        title: "Error",
        description: "Failed to create advertisement. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center space-x-4 mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/ads-dashboard')}
          className="p-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create Advertisement</h1>
          <p className="text-muted-foreground">Promote your business to local community members</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="w-5 h-5" />
                <span>Ad Content</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => updateFormData('title', e.target.value)}
                  placeholder="Enter advertisement title"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                  placeholder="Describe your product or service"
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="target_url">Target URL</Label>
                <Input
                  id="target_url"
                  type="url"
                  value={formData.target_url}
                  onChange={(e) => updateFormData('target_url', e.target.value)}
                  placeholder="https://your-website.com"
                />
              </div>

              <div>
                <Label>Advertisement Image</Label>
                <FileUploader
                  folder="advertisements"
                  maxFiles={1}
                  acceptedFileTypes={['image/jpeg', 'image/png', 'image/gif', 'image/webp']}
                  onUploadComplete={(fileInfo) => handleImageUpload(fileInfo.publicUrl)}
                />
                {formData.image_url && (
                  <img 
                    src={formData.image_url} 
                    alt="Ad preview" 
                    className="mt-2 w-full max-w-xs h-32 object-cover rounded-lg"
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Targeting & Placement */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5" />
                <span>Targeting & Placement</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="ad_type">Ad Type</Label>
                <Select value={formData.ad_type} onValueChange={(value) => updateFormData('ad_type', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sponsored_post">Sponsored Post</SelectItem>
                    <SelectItem value="banner">Banner Ad</SelectItem>
                    <SelectItem value="local_business">Local Business Ad</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="placement_type">Placement</Label>
                <Select value={formData.placement_type} onValueChange={(value) => updateFormData('placement_type', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="community_feed">Community Feed</SelectItem>
                    <SelectItem value="marketplace">Marketplace</SelectItem>
                    <SelectItem value="business_directory">Business Directory</SelectItem>
                    <SelectItem value="sidebar">Sidebar</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="target_community">Target Community (Optional)</Label>
                <Select value={formData.target_community_id} onValueChange={(value) => updateFormData('target_community_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All communities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All communities</SelectItem>
                    {communities.map((community: any) => (
                      <SelectItem key={community.id} value={community.id}>
                        {community.name} - {community.city}, {community.state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="target_location">Target Location</Label>
                <Input
                  id="target_location"
                  value={formData.target_location}
                  onChange={(e) => updateFormData('target_location', e.target.value)}
                  placeholder="e.g., San Francisco, CA"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Budget & Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5" />
              <span>Budget & Schedule</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div>
                <Label htmlFor="budget_total">Total Budget *</Label>
                <Input
                  id="budget_total"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.budget_total}
                  onChange={(e) => updateFormData('budget_total', e.target.value)}
                  placeholder="100.00"
                  required
                />
              </div>

              <div>
                <Label htmlFor="budget_daily">Daily Budget</Label>
                <Input
                  id="budget_daily"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.budget_daily}
                  onChange={(e) => updateFormData('budget_daily', e.target.value)}
                  placeholder="10.00"
                />
              </div>

              <div>
                <Label htmlFor="cost_per_click">Cost Per Click</Label>
                <Input
                  id="cost_per_click"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.cost_per_click}
                  onChange={(e) => updateFormData('cost_per_click', e.target.value)}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(formData.start_date, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.start_date}
                      onSelect={(date) => date && updateFormData('start_date', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Switch
                    checked={formData.has_end_date}
                    onCheckedChange={(checked) => updateFormData('has_end_date', checked)}
                  />
                  <Label>Set End Date</Label>
                </div>
                
                {formData.has_end_date && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.end_date ? format(formData.end_date, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.end_date}
                        onSelect={(date) => updateFormData('end_date', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate('/ads-dashboard')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Advertisement'}
          </Button>
        </div>
      </form>
    </div>
  );
};