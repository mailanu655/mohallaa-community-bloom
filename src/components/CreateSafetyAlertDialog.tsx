import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useSafetyAlerts } from '@/hooks/useSafetyAlerts';
import { AlertTriangle, MapPin, Clock } from 'lucide-react';

interface CreateSafetyAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateSafetyAlertDialog({
  open,
  onOpenChange,
}: CreateSafetyAlertDialogProps) {
  const { createAlert } = useSafetyAlerts();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    alert_type: 'general',
    severity: 'medium',
    location_details: '',
    radius_affected_miles: 2,
    expires_at: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in the title and description.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      await createAlert({
        title: formData.title.trim(),
        description: formData.description.trim(),
        alert_type: formData.alert_type,
        severity: formData.severity,
        location_details: formData.location_details.trim() || undefined,
        radius_affected_miles: formData.radius_affected_miles || 2,
        expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : undefined,
      });

      toast({
        title: "Alert Created",
        description: "Your safety alert has been posted to the community.",
      });

      // Reset form and close dialog
      setFormData({
        title: '',
        description: '',
        alert_type: 'general',
        severity: 'medium',
        location_details: '',
        radius_affected_miles: 2,
        expires_at: '',
      });
      onOpenChange(false);

    } catch (error) {
      console.error('Error creating alert:', error);
      toast({
        title: "Error",
        description: "Failed to create safety alert. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            Report Safety Alert
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Alert Title *</Label>
            <Input
              id="title"
              placeholder="Brief description of the alert"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              maxLength={100}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Provide more details about the safety concern..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              maxLength={500}
            />
          </div>

          {/* Alert Type */}
          <div className="space-y-2">
            <Label>Alert Type</Label>
            <Select 
              value={formData.alert_type} 
              onValueChange={(value) => handleInputChange('alert_type', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">📢 General</SelectItem>
                <SelectItem value="emergency">🚨 Emergency</SelectItem>
                <SelectItem value="weather">🌦️ Weather</SelectItem>
                <SelectItem value="crime">🚔 Crime</SelectItem>
                <SelectItem value="traffic">🚗 Traffic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Severity */}
          <div className="space-y-2">
            <Label>Severity Level</Label>
            <Select 
              value={formData.severity} 
              onValueChange={(value) => handleInputChange('severity', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">🔵 Low</SelectItem>
                <SelectItem value="medium">🟡 Medium</SelectItem>
                <SelectItem value="high">🟠 High</SelectItem>
                <SelectItem value="critical">🔴 Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Specific Location (Optional)
            </Label>
            <Input
              id="location"
              placeholder="e.g., Main St & 1st Ave, Target parking lot"
              value={formData.location_details}
              onChange={(e) => handleInputChange('location_details', e.target.value)}
            />
          </div>

          {/* Radius */}
          <div className="space-y-2">
            <Label htmlFor="radius">Affected Area Radius (miles)</Label>
            <Select 
              value={formData.radius_affected_miles.toString()} 
              onValueChange={(value) => handleInputChange('radius_affected_miles', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 mile</SelectItem>
                <SelectItem value="2">2 miles</SelectItem>
                <SelectItem value="5">5 miles</SelectItem>
                <SelectItem value="10">10 miles</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Expiry */}
          <div className="space-y-2">
            <Label htmlFor="expires" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Expires (Optional)
            </Label>
            <Input
              id="expires"
              type="datetime-local"
              value={formData.expires_at}
              onChange={(e) => handleInputChange('expires_at', e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Posting...' : 'Post Alert'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}