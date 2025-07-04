import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MapPin, Calendar, Search } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: <Users className="w-12 h-12 text-primary" />,
      title: "Community Networks",
      description: "Connect with fellow Indians in your city and neighborhood. Build meaningful professional and personal relationships."
    },
    {
      icon: <MapPin className="w-12 h-12 text-primary" />,
      title: "Location-Based Groups",
      description: "Join location-specific communities in cities with high Indian populations across America."
    },
    {
      icon: <Calendar className="w-12 h-12 text-primary" />,
      title: "Cultural Events",
      description: "Discover and organize Diwali celebrations, Holi festivals, cultural performances, and community gatherings."
    },
    {
      icon: <Search className="w-12 h-12 text-primary" />,
      title: "Business Directory",
      description: "Find Indian-owned businesses, from authentic restaurants to professional services, all verified by the community."
    }
  ];

  return (
    <section className="py-20 bg-gradient-warm">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Everything You Need to{" "}
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              Stay Connected
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From professional networking to cultural celebrations, Mohallaa brings the warmth 
            of Indian community to your digital doorstep.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="text-center hover:shadow-cultural transition-all duration-300 hover:-translate-y-2 border-0 bg-card/80 backdrop-blur-sm"
            >
              <CardHeader>
                <div className="flex justify-center mb-4 animate-float-gentle">
                  {feature.icon}
                </div>
                <CardTitle className="text-xl font-semibold text-card-foreground">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;