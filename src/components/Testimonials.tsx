import { Card, CardContent } from "@/components/ui/card";
import { Users, Heart, Calendar, MessageSquare, MapPin, Briefcase } from "lucide-react";

const Testimonials = () => {
  const communityHighlights = [
    {
      title: "Bay Area Diwali Celebration",
      description: "500+ community members came together for the largest Diwali celebration in Silicon Valley",
      icon: <Calendar className="w-6 h-6 text-yellow-500" />,
      metric: "500+",
      label: "Attendees",
      color: "bg-yellow-50 border-yellow-200"
    },
    {
      title: "Professional Network Growth",
      description: "Indian professionals connecting across tech, healthcare, and finance sectors",
      icon: <Briefcase className="w-6 h-6 text-blue-500" />,
      metric: "2,500+",
      label: "Professionals",
      color: "bg-blue-50 border-blue-200"
    },
    {
      title: "Local Recommendations Shared",
      description: "Community members sharing the best Indian restaurants, grocery stores, and services",
      icon: <MessageSquare className="w-6 h-6 text-green-500" />,
      metric: "10,000+",
      label: "Recommendations",
      color: "bg-green-50 border-green-200"
    },
    {
      title: "Newcomer Welcome Program",
      description: "New immigrants getting help with housing, schools, and local connections",
      icon: <Heart className="w-6 h-6 text-red-500" />,
      metric: "1,200+",
      label: "Families Helped",
      color: "bg-red-50 border-red-200"
    }
  ];

  const communityMoments = [
    {
      city: "San Francisco",
      event: "Tech Meetup",
      participants: "120+ engineers",
      achievement: "3 job offers made"
    },
    {
      city: "New York",
      event: "Garba Night",
      participants: "800+ dancers",
      achievement: "Raised $5K for charity"
    },
    {
      city: "Seattle",
      event: "Food Festival",
      participants: "300+ families",
      achievement: "15 local vendors featured"
    },
    {
      city: "Houston",
      event: "Career Fair",
      participants: "200+ professionals",
      achievement: "50+ connections made"
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Our <span className="bg-gradient-hero bg-clip-text text-transparent">community</span> in action
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real stories of connection, support, and growth happening in Indian communities across America.
          </p>
        </div>

        {/* Community Highlights */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {communityHighlights.map((highlight, index) => (
            <Card key={index} className={`hover:shadow-lg transition-all duration-300 ${highlight.color}`}>
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                    {highlight.icon}
                  </div>
                </div>
                
                <div className="text-3xl font-bold text-foreground mb-1">{highlight.metric}</div>
                <div className="text-sm font-medium text-muted-foreground mb-3">{highlight.label}</div>
                
                <h4 className="font-semibold text-foreground mb-2 text-sm">{highlight.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {highlight.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Community Moments */}
        <div>
          <h3 className="text-2xl font-bold text-center mb-8">Recent Community Moments</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {communityMoments.map((moment, index) => (
              <div key={index} className="bg-white rounded-lg p-4 border border-border/50 hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-2 mb-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-sm text-foreground">{moment.city}</span>
                </div>
                <div className="text-lg font-bold text-foreground mb-1">{moment.event}</div>
                <div className="text-sm text-muted-foreground mb-2">{moment.participants}</div>
                <div className="text-xs text-primary font-medium">{moment.achievement}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Community Impact */}
        <div className="mt-16 text-center bg-gradient-cultural rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-foreground mb-6">Community Impact This Month</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div className="flex items-center justify-center mb-2">
                <Users className="w-6 h-6 text-primary mr-2" />
                <span className="text-2xl font-bold text-foreground">847</span>
              </div>
              <div className="text-sm text-muted-foreground">New Connections</div>
            </div>
            <div>
              <div className="flex items-center justify-center mb-2">
                <Calendar className="w-6 h-6 text-secondary mr-2" />
                <span className="text-2xl font-bold text-foreground">23</span>
              </div>
              <div className="text-sm text-muted-foreground">Events Organized</div>
            </div>
            <div>
              <div className="flex items-center justify-center mb-2">
                <MessageSquare className="w-6 h-6 text-accent mr-2" />
                <span className="text-2xl font-bold text-foreground">1.2K</span>
              </div>
              <div className="text-sm text-muted-foreground">Posts Shared</div>
            </div>
            <div>
              <div className="flex items-center justify-center mb-2">
                <Heart className="w-6 h-6 text-red-500 mr-2" />
                <span className="text-2xl font-bold text-foreground">156</span>
              </div>
              <div className="text-sm text-muted-foreground">Families Helped</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;