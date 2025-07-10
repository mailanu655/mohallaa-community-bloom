import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MapPin, Calendar, Search } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: <Users className="w-12 h-12 text-primary" />,
      title: "Neighborhood Communities",
      description: "Join hyper-local groups in your city and connect with Indians living nearby. Share recommendations, organize meetups, and build lasting friendships."
    },
    {
      icon: <MapPin className="w-12 h-12 text-secondary" />,
      title: "Local Marketplace",
      description: "Buy and sell items within your community. From furniture to festival decorations, find what you need from trusted neighbors."
    },
    {
      icon: <Calendar className="w-12 h-12 text-accent" />,
      title: "Cultural Events",
      description: "Never miss a celebration! Discover Diwali parties, Garba nights, cultural performances, and family-friendly events happening near you."
    },
    {
      icon: <Search className="w-12 h-12 text-primary-glow" />,
      title: "Community Posts",
      description: "Ask questions, share experiences, seek recommendations, and get advice from people who understand your cultural context."
    }
  ];

  return (
    <section className="py-20 bg-gradient-warm">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            What You Can Do on{" "}
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              Mohallaa
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to connect, engage, and thrive within your local Indian community - 
            all in one place.
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