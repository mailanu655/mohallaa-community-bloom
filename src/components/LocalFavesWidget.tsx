import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles,
  Search,
  MapPin,
  Star,
  ChefHat,
  Coffee,
  Dumbbell,
  ShoppingBag,
  Send
} from 'lucide-react';

const LocalFavesWidget = () => {
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const popularQuestions = [
    { icon: ChefHat, text: "Best Indian restaurants near me?", category: "food" },
    { icon: Coffee, text: "Where to find good chai?", category: "food" },
    { icon: Dumbbell, text: "Local gyms with flexible hours?", category: "fitness" },
    { icon: ShoppingBag, text: "Indian grocery stores nearby?", category: "shopping" }
  ];

  const handleAskFaves = async () => {
    if (!question.trim()) return;
    
    setIsLoading(true);
    // TODO: Integrate with AI service
    setTimeout(() => {
      setIsLoading(false);
      setQuestion('');
    }, 2000);
  };

  return (
    <Card className="border-0 bg-gradient-to-br from-primary/5 to-accent/5 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="w-5 h-5 text-primary" />
          Local Faves
          <Badge variant="secondary" className="text-xs">AI-Powered</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Ask about local businesses, spots, and recommendations from your Indian community.
        </p>
        
        <div className="flex gap-2">
          <Input
            placeholder="Ask about local spots..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAskFaves()}
            className="flex-1"
          />
          <Button 
            size="icon" 
            onClick={handleAskFaves}
            disabled={!question.trim() || isLoading}
            className="shrink-0"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground">Popular questions:</h4>
          <div className="space-y-2">
            {popularQuestions.map((q, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                className="w-full justify-start text-left h-auto p-2 hover:bg-background/50"
                onClick={() => setQuestion(q.text)}
              >
                <q.icon className="w-4 h-4 mr-2 text-muted-foreground" />
                <span className="text-sm">{q.text}</span>
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LocalFavesWidget;