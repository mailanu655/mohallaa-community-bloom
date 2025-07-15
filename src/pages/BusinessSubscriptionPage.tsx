import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BusinessSubscriptionCard } from "@/components/BusinessSubscriptionCard";
import { ArrowLeft, Crown, Building2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

const subscriptionTiers = [
  {
    id: 'basic',
    name: 'Basic',
    price: 0,
    period: 'monthly' as const,
    features: [
      'Basic business profile',
      'Contact information display',
      'Basic service listings',
      'Customer reviews',
      'Standard support'
    ]
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 29,
    period: 'monthly' as const,
    popular: true,
    features: [
      'Enhanced business profile',
      'Priority search placement',
      'Advanced analytics dashboard',
      'Photo gallery (up to 20 images)',
      'Social media integration',
      'Customer messaging system',
      'Priority support',
      'Featured business badge'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 79,
    period: 'monthly' as const,
    features: [
      'Complete business solution',
      'Top search placement',
      'Advanced analytics & insights',
      'Unlimited photo gallery',
      'Social media integration',
      'Customer messaging system',
      'API access',
      'Custom branding options',
      'Dedicated account manager',
      '24/7 premium support'
    ]
  }
];

export default function BusinessSubscriptionPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { businessId } = useParams();
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBusiness();
  }, [businessId, user]);

  const fetchBusiness = async () => {
    if (!user || !businessId) return;

    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', businessId)
        .eq('owner_id', user.id)
        .single();

      if (error) throw error;
      setBusiness(data);
    } catch (error) {
      console.error('Error fetching business:', error);
      toast.error('Failed to load business information');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (tierId: string) => {
    if (!business) return;

    try {
      const tier = subscriptionTiers.find(t => t.id === tierId);
      if (!tier) return;

      // Update business subscription
      const { error } = await supabase
        .from('businesses')
        .update({
          subscription_tier: tierId,
          subscription_status: 'active',
          subscription_price: tier.price,
          subscription_end_date: tierId === 'basic' ? null : 
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
          updated_at: new Date().toISOString()
        })
        .eq('id', business.id);

      if (error) throw error;

      // Create subscription record
      const { error: subscriptionError } = await supabase
        .from('business_subscriptions')
        .insert({
          business_id: business.id,
          tier: tierId,
          status: 'active',
          price: tier.price,
          start_date: new Date().toISOString(),
          end_date: tierId === 'basic' ? null : 
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        });

      if (subscriptionError) throw subscriptionError;

      toast.success(`Successfully upgraded to ${tier.name} plan!`);
      fetchBusiness(); // Refresh business data
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast.error('Failed to update subscription');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-96 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Business Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The business you're looking for doesn't exist or you don't have access to it.
        </p>
        <Button onClick={() => navigate('/businesses')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Businesses
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate(`/business/${businessId}`)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Business
        </Button>
        
        <div className="flex items-center mb-4">
          <Building2 className="w-8 h-8 mr-3 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">{business.name} - Subscription</h1>
            <p className="text-muted-foreground">
              Choose the right plan for your business needs
            </p>
          </div>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Crown className="w-5 h-5 mr-2 text-primary" />
              Current Plan: {business.subscription_tier || 'Basic'}
            </CardTitle>
            <CardDescription>
              {business.subscription_end_date && (
                <>Subscription ends on {new Date(business.subscription_end_date).toLocaleDateString()}</>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Cost</p>
                <p className="text-2xl font-bold">${business.subscription_price || 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-lg font-medium capitalize">{business.subscription_status || 'Active'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Next Billing</p>
                <p className="text-lg font-medium">
                  {business.subscription_end_date ? 
                    new Date(business.subscription_end_date).toLocaleDateString() : 
                    'N/A'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {subscriptionTiers.map((tier) => (
          <BusinessSubscriptionCard
            key={tier.id}
            tier={tier}
            currentTier={business.subscription_tier}
            onSubscribe={handleSubscribe}
          />
        ))}
      </div>

      {/* Yearly Plans */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6 text-center">Annual Plans (Save 20%)</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {subscriptionTiers.slice(1).map((tier) => (
            <BusinessSubscriptionCard
              key={`${tier.id}-yearly`}
              tier={{
                ...tier,
                id: `${tier.id}-yearly`,
                period: 'yearly',
                price: tier.price * 12
              }}
              currentTier={business.subscription_tier}
              onSubscribe={handleSubscribe}
            />
          ))}
        </div>
      </div>
    </div>
  );
}