import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Users, Shield, Bell, BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CommunitySettingsDialogProps {
  community: any;
  canManage: boolean;
  onUpdate: (updates: any) => void;
}

const CommunitySettingsDialog = ({ community, canManage, onUpdate }: CommunitySettingsDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    name: '',
    description: '',
    privacy_type: 'public',
    require_approval: false,
    auto_approve_members: true,
    is_indian_diaspora_focused: true,
    rules: ''
  });

  const { toast } = useToast();

  useEffect(() => {
    if (community) {
      setSettings({
        name: community.name || '',
        description: community.description || '',
        privacy_type: community.privacy_type || 'public',
        require_approval: community.require_approval || false,
        auto_approve_members: community.auto_approve_members || true,
        is_indian_diaspora_focused: community.is_indian_diaspora_focused || true,
        rules: community.rules || ''
      });
    }
  }, [community]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('communities')
        .update(settings)
        .eq('id', community.id);

      if (error) throw error;

      toast({
        title: "Settings Updated",
        description: "Community settings have been updated successfully.",
      });

      onUpdate(settings);
      setOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!canManage) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Community Settings</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="general" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="membership" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Membership
            </TabsTrigger>
            <TabsTrigger value="moderation" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Moderation
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Community Name</Label>
              <Input
                id="name"
                value={settings.name}
                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={settings.description}
                onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rules">Community Rules & Guidelines</Label>
              <Textarea
                id="rules"
                value={settings.rules}
                onChange={(e) => setSettings({ ...settings, rules: e.target.value })}
                rows={5}
                placeholder="Add community rules, guidelines, and expectations for members..."
              />
            </div>
          </TabsContent>

          <TabsContent value="membership" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="privacy">Privacy Type</Label>
              <Select value={settings.privacy_type} onValueChange={(value) => setSettings({ ...settings, privacy_type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public - Anyone can join</SelectItem>
                  <SelectItem value="private">Private - Invitation only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="require_approval"
                  checked={settings.require_approval}
                  onCheckedChange={(checked) => setSettings({ ...settings, require_approval: checked as boolean })}
                />
                <Label htmlFor="require_approval">Require approval for new members</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="auto_approve_members"
                  checked={settings.auto_approve_members}
                  onCheckedChange={(checked) => setSettings({ ...settings, auto_approve_members: checked as boolean })}
                />
                <Label htmlFor="auto_approve_members">Auto-approve member requests (if approval required)</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_indian_diaspora_focused"
                  checked={settings.is_indian_diaspora_focused}
                  onCheckedChange={(checked) => setSettings({ ...settings, is_indian_diaspora_focused: checked as boolean })}
                />
                <Label htmlFor="is_indian_diaspora_focused">Focus on Indian diaspora community</Label>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="moderation" className="space-y-4">
            <div className="text-center p-6 text-muted-foreground">
              <Shield className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Moderation Settings</h3>
              <p>Advanced moderation features will be available soon.</p>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <div className="text-center p-6 text-muted-foreground">
              <Bell className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Notification Settings</h3>
              <p>Community notification preferences will be available soon.</p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommunitySettingsDialog;