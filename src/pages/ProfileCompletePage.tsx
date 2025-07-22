import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  User, 
  Briefcase, 
  MapPin,
  ArrowLeft,
  ArrowRight,
  Check,
  Home
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import AvatarUpload from '@/components/AvatarUpload';
import { NeighborhoodSelector } from '@/components/NeighborhoodSelector';

interface ProfileData {
  first_name: string;
  last_name: string;
  bio: string;
  profession: string;
  experience_years: number | null;
  selected_neighborhood_id: string | null;
}

const ProfileCompletePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [currentProfile, setCurrentProfile] = useState<any>(null);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<any>(null);
  
  const [profileData, setProfileData] = useState<ProfileData>({
    first_name: '',
    last_name: '',
    bio: '',
    profession: '',
    experience_years: null,
    selected_neighborhood_id: null
  });

  const steps = [
    {
      title: "Basic Information",
      description: "Tell us about yourself",
      icon: User
    },
    {
      title: "Professional Details",
      description: "Your career background",
      icon: Briefcase
    },
    {
      title: "Choose Your Neighborhood",
      description: "Connect with your local community",
      icon: MapPin
    }
  ];

  useEffect(() => {
    if (user) {
      fetchExistingProfile();
    }
  }, [user]);

  const fetchExistingProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setCurrentProfile(data);
        setProfileData({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          bio: data.bio || '',
          profession: data.profession || '',
          experience_years: data.experience_years,
          selected_neighborhood_id: data.selected_neighborhood_id
        });

        // If profile is already complete, redirect to home
        if (data.profile_setup_completed) {
          navigate('/home');
          return;
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkipToHome = () => {
    navigate('/home');
  };

  const handleComplete = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const updateData = {
        ...profileData,
        profile_setup_completed: true,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Welcome to Mohallaa! 🎉",
        description: "Your profile is now complete. Explore your neighborhood community!",
      });

      navigate('/home');
    } catch (error) {
      console.error('Error completing profile:', error);
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNeighborhoodSelect = async (neighborhood: any) => {
    setSelectedNeighborhood(neighborhood);
    setProfileData({
      ...profileData,
      selected_neighborhood_id: neighborhood.id
    });
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 0:
        return profileData.first_name.trim() && profileData.last_name.trim();
      case 1:
        return profileData.profession.trim();
      case 2:
        return profileData.selected_neighborhood_id;
      default:
        return false;
    }
  };

  const isProfileComplete = () => {
    return profileData.first_name.trim() && 
           profileData.last_name.trim() && 
           profileData.profession.trim() && 
           profileData.selected_neighborhood_id;
  };

  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-warm">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-12 h-12 bg-gradient-hero rounded-lg flex items-center justify-center text-white font-bold text-2xl">
              म
            </div>
            <span className="text-3xl font-bold text-foreground">Mohallaa</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Complete Your Profile</h1>
            <p className="text-muted-foreground">Help us personalize your community experience</p>
          </div>
        </div>

        {/* Progress */}
        <Card className="border-0 bg-card/80 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">
                  Step {currentStep + 1} of {steps.length}
                </span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(progressPercentage)}% complete
                </span>
              </div>
              <Progress value={progressPercentage} className="w-full" />
              
              <div className="flex justify-between">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const isCompleted = index < currentStep;
                  const isCurrent = index === currentStep;
                  
                  return (
                    <div key={index} className="flex flex-col items-center space-y-2">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                        isCompleted 
                          ? 'bg-primary border-primary text-primary-foreground' 
                          : isCurrent 
                            ? 'border-primary text-primary' 
                            : 'border-muted text-muted-foreground'
                      }`}>
                        {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                      </div>
                      <div className="text-center max-w-20">
                        <p className="text-xs font-medium">{step.title}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step Content */}
        <Card className="border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              {(() => {
                const Icon = steps[currentStep].icon;
                return <Icon className="w-5 h-5 mr-2" />;
              })()}
              {steps[currentStep].title}
            </CardTitle>
            <p className="text-muted-foreground">{steps[currentStep].description}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 0: Basic Information */}
            {currentStep === 0 && (
              <div className="space-y-6">
                <div className="flex justify-center">
                  <AvatarUpload
                    currentAvatarUrl={currentProfile?.avatar_url}
                    size="lg"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name *</Label>
                    <Input
                      id="first_name"
                      placeholder="Your first name"
                      value={profileData.first_name}
                      onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name *</Label>
                    <Input
                      id="last_name"
                      placeholder="Your last name"
                      value={profileData.last_name}
                      onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio (Optional)</Label>
                  <Textarea
                    id="bio"
                    rows={3}
                    placeholder="Tell your community about yourself..."
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    {profileData.bio.length}/250 characters
                  </p>
                </div>
              </div>
            )}

            {/* Step 1: Professional Details */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="profession">Profession *</Label>
                  <Input
                    id="profession"
                    placeholder="e.g., Software Engineer, Doctor, Teacher"
                    value={profileData.profession}
                    onChange={(e) => setProfileData({ ...profileData, profession: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience">Years of Experience (Optional)</Label>
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
              </div>
            )}

            {/* Step 2: Neighborhood Selection */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-hero rounded-full flex items-center justify-center mx-auto">
                    <MapPin className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Choose Your Neighborhood</h3>
                    <p className="text-muted-foreground">
                      Connect with your local Indian community and discover nearby events, recommendations, and neighbors.
                    </p>
                  </div>
                </div>
                
                <NeighborhoodSelector 
                  onNeighborhoodSelect={handleNeighborhoodSelect}
                  currentNeighborhood={selectedNeighborhood}
                  trigger={
                    <Button variant="outline" className="w-full">
                      <MapPin className="w-4 h-4 mr-2" />
                      {profileData.selected_neighborhood_id ? 'Change Neighborhood' : 'Select Your Neighborhood'}
                    </Button>
                  }
                />

                {profileData.selected_neighborhood_id && (
                  <div className="text-center p-4 bg-primary/10 rounded-lg">
                    <Check className="w-6 h-6 text-primary mx-auto mb-2" />
                    <p className="text-sm font-medium text-primary">Neighborhood Selected!</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button variant="outline" onClick={handlePrevious}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
            )}
            <Button variant="ghost" onClick={handleSkipToHome}>
              <Home className="w-4 h-4 mr-2" />
              Skip for now
            </Button>
          </div>

          <div>
            {currentStep < steps.length - 1 ? (
              <Button 
                onClick={handleNext}
                disabled={!isStepValid(currentStep)}
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button 
                onClick={handleComplete}
                disabled={!isProfileComplete() || isLoading}
                className="bg-primary hover:bg-primary/90"
              >
                {isLoading ? 'Completing...' : 'Complete Setup'}
                <Check className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCompletePage;