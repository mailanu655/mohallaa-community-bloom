import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  AlertCircle, 
  User, 
  Camera, 
  Briefcase, 
  Target, 
  MapPin,
  Star 
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

interface ProfileCompletionData {
  score: number;
  missingFields: string[];
  profile: any;
}

const ProfileCompletionWidget = () => {
  const { user } = useAuth();
  const [completionData, setCompletionData] = useState<ProfileCompletionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfileCompletion();
    }
  }, [user]);

  const fetchProfileCompletion = async () => {
    if (!user) return;

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      const missingFields = [];
      let score = profile.profile_completion_score || 0;

      // Check what's missing
      if (!profile.avatar_url) missingFields.push('Profile Photo');
      if (!profile.bio || profile.bio.length < 50) missingFields.push('Bio');
      if (!profile.profession) missingFields.push('Profession');
      if (!profile.experience_years) missingFields.push('Experience');
      if (!profile.skills || profile.skills.length < 3) missingFields.push('Skills');
      if (!profile.interests || profile.interests.length < 3) missingFields.push('Interests');
      if (!profile.hometown_india) missingFields.push('Hometown');
      if (!profile.community_id) missingFields.push('Community');
      if (!profile.linkedin_url) missingFields.push('LinkedIn');

      setCompletionData({
        score,
        missingFields,
        profile
      });
    } catch (error) {
      console.error('Error fetching profile completion:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !completionData) return null;

  const { score, missingFields } = completionData;
  const isComplete = score >= 90;
  const needsImprovement = score < 60;

  const getCompletionColor = () => {
    if (score >= 90) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCompletionIcon = () => {
    if (isComplete) return <CheckCircle className="w-5 h-5 text-green-600" />;
    return <AlertCircle className="w-5 h-5 text-yellow-600" />;
  };

  const priorityTasks = [
    { field: 'Profile Photo', icon: Camera, description: 'Add a professional photo' },
    { field: 'Bio', icon: User, description: 'Write a compelling bio (50+ characters)' },
    { field: 'Profession', icon: Briefcase, description: 'Add your profession' },
    { field: 'Skills', icon: Target, description: 'List at least 3 skills' },
    { field: 'Community', icon: MapPin, description: 'Join your local community' }
  ];

  const tasksToDo = priorityTasks.filter(task => missingFields.includes(task.field));

  return (
    <Card className="border-0 bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getCompletionIcon()}
            Profile Completion
          </div>
          <Badge variant={isComplete ? 'default' : needsImprovement ? 'destructive' : 'secondary'}>
            {score}%
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span className={getCompletionColor()}>{score}% complete</span>
          </div>
          <Progress value={score} className="h-2" />
        </div>

        {isComplete ? (
          <div className="text-center space-y-2 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <Star className="w-8 h-8 text-green-600 mx-auto" />
            <h4 className="font-semibold text-green-800 dark:text-green-200">
              Profile Complete!
            </h4>
            <p className="text-sm text-green-600 dark:text-green-300">
              Your professional profile is looking great!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Quick Actions:</h4>
            <div className="space-y-2">
              {tasksToDo.slice(0, 3).map((task) => {
                const IconComponent = task.icon;
                return (
                  <div key={task.field} className="flex items-center gap-2 text-sm">
                    <IconComponent className="w-4 h-4 text-muted-foreground" />
                    <span className="flex-1">{task.description}</span>
                  </div>
                );
              })}
            </div>
            
            <div className="flex gap-2">
              <Button variant="cultural" size="sm" className="flex-1" asChild>
                <Link to="/profile/edit">Complete Profile</Link>
              </Button>
              {tasksToDo.length > 3 && (
                <Button variant="outline" size="sm">
                  +{tasksToDo.length - 3} more
                </Button>
              )}
            </div>
          </div>
        )}

        {missingFields.length > 0 && (
          <div className="text-xs text-muted-foreground">
            Missing: {missingFields.slice(0, 3).join(', ')}
            {missingFields.length > 3 && ` +${missingFields.length - 3} more`}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileCompletionWidget;