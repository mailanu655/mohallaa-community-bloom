
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, AlertTriangle, MapPin, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SafetyAlertData {
  title: string;
  description: string;
  alertType: string;
  urgencyLevel: string;
  affectedArea: string;
  timeOfIncident: string;
  authoritiesContacted: boolean;
  emergencyContacts: string;
}

interface SafetyAlertFormFieldsProps {
  formData: SafetyAlertData;
  onFormDataChange: (field: string, value: any) => void;
  showTitle?: boolean;
  showDescription?: boolean;
}

const SafetyAlertFormFields = ({ 
  formData, 
  onFormDataChange, 
  showTitle = true, 
  showDescription = true 
}: SafetyAlertFormFieldsProps) => {
  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-4 p-4 bg-gray-50/30 rounded-lg border border-gray-200/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-700">
          <Shield className="w-4 h-4 text-red-600" />
          <Label className="text-sm font-medium">Safety Alert Details</Label>
        </div>
        {formData.urgencyLevel && (
          <Badge className={`${getUrgencyColor(formData.urgencyLevel)} text-white`}>
            {formData.urgencyLevel.toUpperCase()} PRIORITY
          </Badge>
        )}
      </div>

      {/* Essential Fields */}
      {showTitle && (
        <div className="space-y-2">
          <Label htmlFor="alert-title">Alert Title *</Label>
          <Input
            id="alert-title"
            value={formData.title}
            onChange={(e) => onFormDataChange('title', e.target.value)}
            placeholder="e.g., Road Accident on MG Road - Traffic Blocked"
            className="border-gray-300"
          />
        </div>
      )}

      {showDescription && (
        <div className="space-y-2">
          <Label htmlFor="alert-description">Alert Description *</Label>
          <Textarea
            id="alert-description"
            value={formData.description}
            onChange={(e) => onFormDataChange('description', e.target.value)}
            placeholder="Provide detailed information about the safety alert..."
            rows={4}
            className="border-gray-300"
          />
        </div>
      )}

      {/* Important Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="alert-type">Alert Type *</Label>
          <Select value={formData.alertType} onValueChange={(value) => onFormDataChange('alertType', value)}>
            <SelectTrigger className="border-gray-300">
              <SelectValue placeholder="Select alert type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="traffic">Traffic/Road Incident</SelectItem>
              <SelectItem value="crime">Crime/Security</SelectItem>
              <SelectItem value="weather">Weather Emergency</SelectItem>
              <SelectItem value="fire">Fire Emergency</SelectItem>
              <SelectItem value="medical">Medical Emergency</SelectItem>
              <SelectItem value="utility">Utility Outage</SelectItem>
              <SelectItem value="other">Other Emergency</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="urgency-level">Urgency Level *</Label>
          <Select value={formData.urgencyLevel} onValueChange={(value) => onFormDataChange('urgencyLevel', value)}>
            <SelectTrigger className="border-gray-300">
              <SelectValue placeholder="Select urgency level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="critical">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span>Critical - Immediate Action Required</span>
                </div>
              </SelectItem>
              <SelectItem value="high">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  <span>High - Urgent Attention Needed</span>
                </div>
              </SelectItem>
              <SelectItem value="medium">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  <span>Medium - Important to Know</span>
                </div>
              </SelectItem>
              <SelectItem value="low">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-blue-500" />
                  <span>Low - General Awareness</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="affected-area">Affected Area/Location *</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="affected-area"
              value={formData.affectedArea}
              onChange={(e) => onFormDataChange('affectedArea', e.target.value)}
              placeholder="e.g., MG Road, near Metro Station"
              className="pl-10 border-gray-300"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="time-of-incident">Time of Incident</Label>
          <div className="relative">
            <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="time-of-incident"
              type="datetime-local"
              value={formData.timeOfIncident}
              onChange={(e) => onFormDataChange('timeOfIncident', e.target.value)}
              className="pl-10 border-gray-300"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="authorities-contacted"
          checked={formData.authoritiesContacted}
          onCheckedChange={(checked) => onFormDataChange('authoritiesContacted', checked)}
        />
        <Label htmlFor="authorities-contacted" className="text-sm">
          Authorities have been contacted
        </Label>
      </div>

      <div className="space-y-2">
        <Label htmlFor="emergency-contacts">Emergency Contact Numbers (if relevant)</Label>
        <Textarea
          id="emergency-contacts"
          value={formData.emergencyContacts}
          onChange={(e) => onFormDataChange('emergencyContacts', e.target.value)}
          placeholder="e.g., Police: 100, Fire: 101, Ambulance: 108, Local contacts..."
          rows={3}
          className="border-gray-300"
        />
      </div>

      {formData.urgencyLevel === 'critical' && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
            <div className="text-sm text-red-800">
              <p className="font-medium">Critical Alert Notice:</p>
              <p>This alert will be given high visibility and may trigger immediate notifications to community members.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SafetyAlertFormFields;
