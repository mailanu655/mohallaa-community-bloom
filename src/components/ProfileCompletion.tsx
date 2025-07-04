import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, User, MapPin, Briefcase, Target } from 'lucide-react';

interface ProfileData {
  bio?: string;
  profession?: string;
  skills?: string[];
  interests?: string[];
  hometown_india?: string;
  languages?: string[];
  linkedin_url?: string;
  experience_years?: number;
  community_id?: string;
}

interface ProfileCompletionProps {
  onComplete?: () => void;
}

const ProfileCompletion: React.FC<ProfileCompletionProps> = ({ onComplete }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profileData, setProfileData] = useState<ProfileData>({});
  const [communities, setCommunities] = useState<Array<{ id: string; name: string }>>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const totalSteps = 4;
  const completionPercentage = (currentStep / totalSteps) * 100;

  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    try {
      const { data } = await supabase
        .from('communities')
        .select('id, name')
        .order('name');
      setCommunities(data || []);
    } catch (error) {
      console.error('Error fetching communities:', error);
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkipStep = () => {
    handleNext();
  };

  const handleComplete = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Profile completed!",
        description: "Your profile has been updated successfully.",
      });

      onComplete?.();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <User className="w-12 h-12 text-primary mx-auto" />
              <h3 className="text-lg font-semibold">Tell us about yourself</h3>
              <p className="text-sm text-muted-foreground">
                Help others get to know you better
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about yourself, your background, and what you're passionate about..."
                  rows={4}
                  value={profileData.bio || ''}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="hometown">Hometown in India</Label>
                <Input
                  id="hometown"
                  placeholder="e.g., Mumbai, Delhi, Bangalore"
                  value={profileData.hometown_india || ''}
                  onChange={(e) => setProfileData({ ...profileData, hometown_india: e.target.value })}
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <Briefcase className="w-12 h-12 text-primary mx-auto" />
              <h3 className="text-lg font-semibold">Professional Information</h3>
              <p className="text-sm text-muted-foreground">
                Share your professional background
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="profession">Profession</Label>
                <Input
                  id="profession"
                  placeholder="e.g., Software Engineer, Doctor, Teacher"
                  value={profileData.profession || ''}
                  onChange={(e) => setProfileData({ ...profileData, profession: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="experience">Years of Experience</Label>
                <Select
                  value={profileData.experience_years?.toString() || ''}
                  onValueChange={(value) => setProfileData({ ...profileData, experience_years: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0-1 years</SelectItem>
                    <SelectItem value="2">2-3 years</SelectItem>
                    <SelectItem value="4">4-5 years</SelectItem>
                    <SelectItem value="6">6-10 years</SelectItem>
                    <SelectItem value="11">10+ years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn Profile (optional)</Label>
                <Input
                  id="linkedin"
                  placeholder="https://linkedin.com/in/yourprofile"
                  value={profileData.linkedin_url || ''}
                  onChange={(e) => setProfileData({ ...profileData, linkedin_url: e.target.value })}
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <Target className="w-12 h-12 text-primary mx-auto" />
              <h3 className="text-lg font-semibold">Skills & Interests</h3>
              <p className="text-sm text-muted-foreground">
                What are you good at and interested in?
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="skills">Skills (comma-separated)</Label>
                <Input
                  id="skills"
                  placeholder="e.g., Python, React, Project Management, Cooking"
                  value={profileData.skills?.join(', ') || ''}
                  onChange={(e) => setProfileData({ 
                    ...profileData, 
                    skills: e.target.value.split(',').map(s => s.trim()).filter(s => s) 
                  })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="interests">Interests (comma-separated)</Label>
                <Input
                  id="interests"
                  placeholder="e.g., Photography, Travel, Sports, Music"
                  value={profileData.interests?.join(', ') || ''}
                  onChange={(e) => setProfileData({ 
                    ...profileData, 
                    interests: e.target.value.split(',').map(s => s.trim()).filter(s => s) 
                  })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="languages">Languages (comma-separated)</Label>
                <Input
                  id="languages"
                  placeholder="e.g., English, Hindi, Tamil, Spanish"
                  value={profileData.languages?.join(', ') || ''}
                  onChange={(e) => setProfileData({ 
                    ...profileData, 
                    languages: e.target.value.split(',').map(s => s.trim()).filter(s => s) 
                  })}
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <MapPin className="w-12 h-12 text-primary mx-auto" />
              <h3 className="text-lg font-semibold">Join a Community</h3>
              <p className="text-sm text-muted-foreground">
                Find your local Indian community
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="community">Choose your community (optional)</Label>
                <Select
                  value={profileData.community_id || ''}
                  onValueChange={(value) => setProfileData({ ...profileData, community_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a community" />
                  </SelectTrigger>
                  <SelectContent>
                    {communities.map(community => (
                      <SelectItem key={community.id} value={community.id}>
                        {community.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="text-center space-y-2">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                <h4 className="font-semibold">Almost done!</h4>
                <p className="text-sm text-muted-foreground">
                  Complete your profile to connect with your community
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto border-0 bg-card/80 backdrop-blur-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-foreground">Complete Your Profile</CardTitle>
        <div className="space-y-2">
          <Progress value={completionPercentage} className="w-full" />
          <p className="text-sm text-muted-foreground">
            Step {currentStep} of {totalSteps}
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {renderStep()}
        
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            Previous
          </Button>
          
          <div className="flex space-x-2">
            {currentStep < totalSteps && (
              <Button
                variant="ghost"
                onClick={handleSkipStep}
              >
                Skip
              </Button>
            )}
            
            {currentStep < totalSteps ? (
              <Button
                onClick={handleNext}
                variant="cultural"
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                variant="cultural"
                disabled={isLoading}
              >
                {isLoading ? 'Completing...' : 'Complete Profile'}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileCompletion;