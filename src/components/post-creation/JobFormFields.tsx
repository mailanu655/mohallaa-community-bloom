
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Briefcase, Building, Calendar, DollarSign } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface JobData {
  title: string;
  description: string;
  jobTitle: string;
  companyName: string;
  employmentType: string;
  salaryRange: string;
  experienceRequired: string;
  skills: string;
  applicationDeadline: string;
  contactMethod: string;
  isRemote: boolean;
  location: string;
}

interface JobFormFieldsProps {
  formData: JobData;
  onFormDataChange: (field: string, value: any) => void;
  showTitle?: boolean;
  showDescription?: boolean;
}

const JobFormFields = ({ 
  formData, 
  onFormDataChange, 
  showTitle = true, 
  showDescription = true 
}: JobFormFieldsProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="space-y-4 p-4 bg-indigo-50/30 rounded-lg border border-indigo-200/50">
      <div className="flex items-center gap-2 text-indigo-700">
        <Briefcase className="w-4 h-4" />
        <Label className="text-sm font-medium">Job Posting Details</Label>
      </div>

      {/* Essential Fields */}
      {showTitle && (
        <div className="space-y-2">
          <Label htmlFor="job-post-title">Post Title *</Label>
          <Input
            id="job-post-title"
            value={formData.title}
            onChange={(e) => onFormDataChange('title', e.target.value)}
            placeholder="e.g., Hiring React Developer - Remote Position"
            className="border-indigo-200"
          />
        </div>
      )}

      {showDescription && (
        <div className="space-y-2">
          <Label htmlFor="job-post-description">Job Description *</Label>
          <Textarea
            id="job-post-description"
            value={formData.description}
            onChange={(e) => onFormDataChange('description', e.target.value)}
            placeholder="Describe the job role, responsibilities, company culture..."
            rows={4}
            className="border-indigo-200"
          />
        </div>
      )}

      {/* Important Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="job-title">Job Title *</Label>
          <Input
            id="job-title"
            value={formData.jobTitle}
            onChange={(e) => onFormDataChange('jobTitle', e.target.value)}
            placeholder="e.g., Senior React Developer"
            className="border-indigo-200"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="company-name">Company Name</Label>
          <div className="relative">
            <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="company-name"
              value={formData.companyName}
              onChange={(e) => onFormDataChange('companyName', e.target.value)}
              placeholder="e.g., Tech Solutions Inc."
              className="pl-10 border-indigo-200"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="employment-type">Employment Type *</Label>
          <Select value={formData.employmentType} onValueChange={(value) => onFormDataChange('employmentType', value)}>
            <SelectTrigger className="border-indigo-200">
              <SelectValue placeholder="Select employment type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full-time">Full-time</SelectItem>
              <SelectItem value="part-time">Part-time</SelectItem>
              <SelectItem value="contract">Contract</SelectItem>
              <SelectItem value="freelance">Freelance</SelectItem>
              <SelectItem value="internship">Internship</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="salary-range">Salary Range</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Select value={formData.salaryRange} onValueChange={(value) => onFormDataChange('salaryRange', value)}>
              <SelectTrigger className="pl-10 border-indigo-200">
                <SelectValue placeholder="Select salary range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="under-3">Under ₹3 LPA</SelectItem>
                <SelectItem value="3-6">₹3-6 LPA</SelectItem>
                <SelectItem value="6-10">₹6-10 LPA</SelectItem>
                <SelectItem value="10-15">₹10-15 LPA</SelectItem>
                <SelectItem value="15-25">₹15-25 LPA</SelectItem>
                <SelectItem value="above-25">Above ₹25 LPA</SelectItem>
                <SelectItem value="negotiable">Negotiable</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Advanced Fields - Progressive Disclosure */}
      <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-0 h-auto text-indigo-700 hover:text-indigo-800">
            <span className="text-sm font-medium">
              {showAdvanced ? 'Hide' : 'Show'} Additional Job Details
            </span>
            <span className="text-xs">{showAdvanced ? '−' : '+'}</span>
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="experience-required">Experience Required</Label>
              <Select value={formData.experienceRequired} onValueChange={(value) => onFormDataChange('experienceRequired', value)}>
                <SelectTrigger className="border-indigo-200">
                  <SelectValue placeholder="Select experience level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entry">Entry Level (0-1 years)</SelectItem>
                  <SelectItem value="junior">Junior (1-3 years)</SelectItem>
                  <SelectItem value="mid">Mid Level (3-5 years)</SelectItem>
                  <SelectItem value="senior">Senior (5-8 years)</SelectItem>
                  <SelectItem value="lead">Lead/Principal (8+ years)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="application-deadline">Application Deadline</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="application-deadline"
                  type="date"
                  value={formData.applicationDeadline}
                  onChange={(e) => onFormDataChange('applicationDeadline', e.target.value)}
                  className="pl-10 border-indigo-200"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="skills">Required Skills/Qualifications</Label>
            <Textarea
              id="skills"
              value={formData.skills}
              onChange={(e) => onFormDataChange('skills', e.target.value)}
              placeholder="e.g., React, TypeScript, Node.js, Bachelor's degree in CS..."
              rows={3}
              className="border-indigo-200"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Job Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => onFormDataChange('location', e.target.value)}
              placeholder="e.g., Bangalore, Karnataka"
              className="border-indigo-200"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is-remote"
              checked={formData.isRemote}
              onCheckedChange={(checked) => onFormDataChange('isRemote', checked)}
            />
            <Label htmlFor="is-remote" className="text-sm">
              Remote work available
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-method">Preferred Contact Method</Label>
            <Select value={formData.contactMethod} onValueChange={(value) => onFormDataChange('contactMethod', value)}>
              <SelectTrigger className="border-indigo-200">
                <SelectValue placeholder="How should candidates apply?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="phone">Phone Call</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="company-portal">Company Portal</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default JobFormFields;
