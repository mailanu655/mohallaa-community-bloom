import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Heart, Home, Users2, Sparkles } from "lucide-react";

const WhyMohallaa = () => {
  const reasons = [
    {
      icon: <Home className="w-8 h-8 text-primary" />,
      title: "Feel at Home",
      description: "Moving to a new country? Find your community and recreate the warmth of home with fellow Indians who share your journey."
    },
    {
      icon: <Users2 className="w-8 h-8 text-secondary" />,
      title: "Professional Growth",
      description: "Network with Indian professionals, find mentors, discover job opportunities, and build career connections in your field."
    },
    {
      icon: <Heart className="w-8 h-8 text-accent" />,
      title: "Cultural Connection",
      description: "Never miss Diwali celebrations, find authentic Indian restaurants, or connect with others who understand your cultural values."
    },
    {
      icon: <Sparkles className="w-8 h-8 text-primary-glow" />,
      title: "Local Support",
      description: "Get recommendations for Indian groceries, doctors who speak your language, and trusted services from community members."
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Problem Statement */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Why{" "}
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              Mohallaa?
            </span>
          </h2>
          <div className="max-w-4xl mx-auto">
            <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
              Living in America as an Indian can feel isolating. You're searching for authentic Indian food, 
              missing cultural celebrations, and craving connections with people who understand your background.
            </p>
            <p className="text-lg text-muted-foreground mb-8">
              <strong className="text-foreground">Mohallaa bridges this gap</strong> by connecting you with 
              Indians in your neighborhood, helping you build meaningful friendships and professional networks.
            </p>
          </div>
        </div>

        {/* Solution Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {reasons.map((reason, index) => (
            <Card 
              key={index} 
              className="text-center hover:shadow-cultural transition-all duration-300 hover:-translate-y-2 border-0 bg-card/80 backdrop-blur-sm"
            >
              <CardContent className="p-6">
                <div className="flex justify-center mb-4 animate-float-gentle">
                  {reason.icon}
                </div>
                <h3 className="text-lg font-semibold text-card-foreground mb-3">
                  {reason.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {reason.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center bg-gradient-cultural rounded-2xl p-8 border border-border/50">
          <h3 className="text-2xl font-bold text-foreground mb-4">
            Ready to find your community?
          </h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Join thousands of Indians who have already found their home away from home. 
            Your neighborhood community is waiting for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild variant="default" size="lg" className="bg-primary hover:bg-primary/90 shadow-warm">
              <Link to="/communities">Join Your Local Community</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="hover:bg-primary hover:text-primary-foreground">
              <Link to="/communities">Browse Communities</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyMohallaa;