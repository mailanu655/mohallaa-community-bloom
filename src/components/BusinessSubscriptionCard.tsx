import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Star } from "lucide-react";

interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  period: 'monthly' | 'yearly';
  features: string[];
  popular?: boolean;
}

interface BusinessSubscriptionCardProps {
  tier: SubscriptionTier;
  currentTier?: string;
  onSubscribe: (tierId: string) => void;
}

export function BusinessSubscriptionCard({ tier, currentTier, onSubscribe }: BusinessSubscriptionCardProps) {
  const isCurrentTier = currentTier === tier.id;
  const discount = tier.period === 'yearly' ? 20 : 0;
  const displayPrice = tier.period === 'yearly' ? tier.price * 0.8 : tier.price;

  return (
    <Card className={`relative ${tier.popular ? 'border-primary shadow-lg scale-105' : ''} ${isCurrentTier ? 'bg-muted' : ''}`}>
      {tier.popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-gradient-primary text-white px-4 py-1">
            <Star className="w-3 h-3 mr-1" />
            Most Popular
          </Badge>
        </div>
      )}
      
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-2">
          {tier.id === 'premium' && <Crown className="w-6 h-6 text-primary mr-2" />}
          {tier.id === 'enterprise' && <Star className="w-6 h-6 text-primary mr-2" />}
          <CardTitle className="text-xl">{tier.name}</CardTitle>
        </div>
        
        <div className="text-3xl font-bold">
          ${displayPrice}
          <span className="text-sm font-normal text-muted-foreground">
            /{tier.period === 'yearly' ? 'year' : 'month'}
          </span>
        </div>
        
        {tier.period === 'yearly' && discount > 0 && (
          <div className="text-sm text-primary font-medium">
            Save {discount}% annually
          </div>
        )}
        
        <CardDescription>
          {tier.id === 'basic' && 'Essential features for small businesses'}
          {tier.id === 'premium' && 'Advanced features for growing businesses'}
          {tier.id === 'enterprise' && 'Complete solution for large businesses'}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <ul className="space-y-3">
          {tier.features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <Check className="w-4 h-4 text-primary mt-0.5 mr-3 flex-shrink-0" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      
      <CardFooter>
        <Button 
          className="w-full"
          variant={isCurrentTier ? "secondary" : "default"}
          disabled={isCurrentTier}
          onClick={() => onSubscribe(tier.id)}
        >
          {isCurrentTier ? 'Current Plan' : `Upgrade to ${tier.name}`}
        </Button>
      </CardFooter>
    </Card>
  );
}