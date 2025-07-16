import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Users, MapPin } from "lucide-react";

const Communities = () => {
  const cities = [
    {
      name: "San Francisco Bay Area",
      members: "12,500+",
      description: "Tech professionals, cultural events, and vibrant community life in the heart of Silicon Valley.",
      image: "🌉"
    },
    {
      name: "New York Metro",
      members: "18,000+",
      description: "From Wall Street to cultural centers, connecting Indians across the tri-state area.",
      image: "🗽"
    },
    {
      name: "Greater Seattle",
      members: "8,200+",
      description: "Microsoft, Amazon, and beyond - building community in the Pacific Northwest.",
      image: "🏔️"
    },
    {
      name: "Houston",
      members: "9,500+",
      description: "Energy sector professionals and diverse cultural celebrations in Texas.",
      image: "🚀"
    },
    {
      name: "Chicago",
      members: "7,800+",
      description: "Midwest hospitality meets Indian warmth in the Windy City.",
      image: "🏙️"
    },
    {
      name: "Boston",
      members: "6,400+",
      description: "Academic excellence and innovation hub with strong community bonds.",
      image: "🎓"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Your{" "}
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              Community
            </span>{" "}
            Awaits
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Join thousands of Indians building connections, sharing experiences, and creating 
            home in cities across America.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {cities.map((city, index) => (
            <Card 
              key={index} 
              className="hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 bg-white border border-border/50"
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-4xl animate-float-gentle">{city.image}</div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="w-4 h-4 mr-1" />
                    {city.members}
                  </div>
                </div>
                <CardTitle className="text-xl font-semibold text-card-foreground flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-primary" />
                  {city.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {city.description}
                </p>
                <Button asChild variant="outline" className="w-full hover:bg-primary hover:text-primary-foreground">
                  <Link to="/communities">Join Community</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button asChild variant="default" size="lg" className="bg-primary hover:bg-primary/90 shadow-warm">
            <Link to="/communities">View All Communities</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Communities;