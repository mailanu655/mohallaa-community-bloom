import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const Features = () => {
  const mainFeatures = [
    {
      title: "Connect with your community",
      description: "Find and connect with Indians in your neighborhood. Build meaningful relationships with people who share your cultural background and professional interests.",
      link: "/communities"
    },
    {
      title: "Share your experiences",
      description: "Post questions, share recommendations, and get advice from community members. From the best Indian restaurants to career guidance.",
      link: "/posts"
    },
    {
      title: "Join cultural events",
      description: "Discover and attend Diwali celebrations, Garba nights, professional meetups, and family gatherings in your city.",
      link: "/events"
    }
  ];

  const additionalFeatures = [
    {
      title: "Local Marketplace",
      description: "Buy and sell within your community"
    },
    {
      title: "Business Directory",
      description: "Discover Indian-owned businesses"
    },
    {
      title: "Cultural Support",
      description: "Get help with cultural adaptation"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Everything you need to build your
            <span className="bg-gradient-hero bg-clip-text text-transparent"> community life</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From professional networking to cultural celebrations, Mohallaa brings together 
            all aspects of Indian community life in America.
          </p>
        </div>

        {/* Main Features */}
        <div className="space-y-16 mb-20">
          {mainFeatures.map((feature, index) => (
            <div 
              key={index} 
              className={`grid lg:grid-cols-2 gap-12 items-center ${
                index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''
              }`}
            >
              <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
                <div className="mb-6">
                  <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                    {feature.description}
                  </p>
                  <Button asChild variant="outline" className="group">
                    <Link to={feature.link} className="flex items-center">
                      Learn More
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </div>
              </div>
              
              <div className={index % 2 === 1 ? 'lg:col-start-1' : ''}>
                <div className="relative">
                  <div className="bg-white rounded-2xl p-6 h-80 border border-border shadow-sm">
                    <div className="h-full flex flex-col justify-center space-y-4">
                      {index === 0 && (
                        <>
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">G</div>
                            <div>
                              <div className="text-sm font-semibold text-foreground">Google</div>
                              <div className="text-xs text-muted-foreground">Software Engineer</div>
                            </div>
                            <div className="ml-auto w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">M</div>
                            <div>
                              <div className="text-sm font-semibold text-foreground">Microsoft</div>
                              <div className="text-xs text-muted-foreground">Product Manager</div>
                            </div>
                            <div className="ml-auto w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          </div>
                          <div className="text-xs text-primary font-medium">+247 verified professionals</div>
                        </>
                      )}
                      {index === 1 && (
                        <>
                          <div className="text-sm font-semibold text-foreground mb-2">Latest Posts</div>
                          <div className="space-y-2">
                            <div className="p-2 bg-primary/10 rounded text-xs">
                              "Best Indian restaurants in Seattle? 🍛"
                            </div>
                            <div className="p-2 bg-secondary/10 rounded text-xs">
                              "H1B visa attorney recommendations needed"
                            </div>
                            <div className="p-2 bg-accent/10 rounded text-xs">
                              "Cricket team forming in Austin! 🏏"
                            </div>
                          </div>
                          <div className="text-xs text-primary font-medium">+1.2K active discussions</div>
                        </>
                      )}
                      {index === 2 && (
                        <>
                          <div className="text-sm font-semibold text-foreground mb-2">Upcoming Events</div>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">
                              <div className="text-xs">Diwali Celebration</div>
                              <div className="text-xs text-yellow-600">Oct 12</div>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                              <div className="text-xs">Tech Meetup</div>
                              <div className="text-xs text-blue-600">Oct 15</div>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                              <div className="text-xs">Garba Night</div>
                              <div className="text-xs text-green-600">Oct 20</div>
                            </div>
                          </div>
                          <div className="text-xs text-primary font-medium">+23 events this month</div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Features Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {additionalFeatures.map((feature, index) => (
            <div key={index} className="text-center p-6 rounded-xl bg-gradient-cultural hover:shadow-lg transition-all duration-300">
              <h4 className="font-semibold text-foreground mb-2">{feature.title}</h4>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;