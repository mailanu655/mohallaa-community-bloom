import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Tag, 
  Clock, 
  Users, 
  MapPin,
  Percent,
  DollarSign,
  Calendar,
  Gift
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface BusinessDealsCardProps {
  deal: {
    id: string;
    title: string;
    description: string;
    deal_type: string;
    discount_percentage?: number;
    discount_amount?: number;
    terms_conditions?: string;
    start_date: string;
    end_date?: string;
    max_redemptions?: number;
    current_redemptions: number;
    businesses: {
      name: string;
      city: string;
      state: string;
    };
  };
  onRedeem?: (dealId: string) => void;
}

export const BusinessDealsCard = ({ deal, onRedeem }: BusinessDealsCardProps) => {
  const getDealIcon = () => {
    switch (deal.deal_type) {
      case 'percentage': return Percent;
      case 'fixed_amount': return DollarSign;
      case 'bogo': return Gift;
      default: return Tag;
    }
  };

  const getDealValue = () => {
    if (deal.discount_percentage) {
      return `${deal.discount_percentage}% OFF`;
    }
    if (deal.discount_amount) {
      return `$${deal.discount_amount} OFF`;
    }
    return 'Special Offer';
  };

  const getDealTypeColor = () => {
    switch (deal.deal_type) {
      case 'percentage': return 'bg-green-100 text-green-800';
      case 'fixed_amount': return 'bg-blue-100 text-blue-800';
      case 'bogo': return 'bg-purple-100 text-purple-800';
      default: return 'bg-orange-100 text-orange-800';
    }
  };

  const isExpired = deal.end_date && new Date(deal.end_date) < new Date();
  const isLimited = deal.max_redemptions && deal.current_redemptions >= deal.max_redemptions;
  const canRedeem = !isExpired && !isLimited;

  const Icon = getDealIcon();

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${!canRedeem ? 'opacity-60' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon className="w-6 h-6 text-primary" />
            </div>
            
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg leading-tight mb-2">{deal.title}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge className={getDealTypeColor()}>
                  {getDealValue()}
                </Badge>
                {!canRedeem && (
                  <Badge variant="secondary">
                    {isExpired ? 'Expired' : 'Sold Out'}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-muted-foreground leading-relaxed">
          {deal.description}
        </p>

        {/* Business Info */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4" />
          <span>{deal.businesses.name} • {deal.businesses.city}, {deal.businesses.state}</span>
        </div>

        {/* Deal Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span>
              {deal.end_date 
                ? `Expires ${formatDistanceToNow(new Date(deal.end_date), { addSuffix: true })}`
                : 'No expiration'
              }
            </span>
          </div>

          {deal.max_redemptions && (
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span>
                {deal.max_redemptions - deal.current_redemptions} of {deal.max_redemptions} left
              </span>
            </div>
          )}
        </div>

        {/* Terms and Conditions */}
        {deal.terms_conditions && (
          <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
            <p className="font-medium mb-1">Terms & Conditions:</p>
            <p>{deal.terms_conditions}</p>
          </div>
        )}

        {/* Action Button */}
        <Button
          onClick={() => onRedeem?.(deal.id)}
          disabled={!canRedeem}
          className="w-full gap-2"
          variant={canRedeem ? "default" : "secondary"}
        >
          <Tag className="w-4 h-4" />
          {canRedeem ? 'Get Deal' : isExpired ? 'Deal Expired' : 'Deal Unavailable'}
        </Button>
      </CardContent>
    </Card>
  );
};