import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Users, MessageSquare, Calendar, ShoppingBag, Building2, Heart, ArrowRight } from "lucide-react";

const Features = () => {
  const mainFeatures = [
    {
      icon: <Users className="w-8 h-8 text-primary" />,
      title: "Connect with your community",
      description: "Find and connect with Indians in your neighborhood. Build meaningful relationships with people who share your cultural background and professional interests.",
      image: "👥",
      link: "/communities"
    },
    {
      icon: <MessageSquare className="w-8 h-8 text-secondary" />,
      title: "Share your experiences",
      description: "Post questions, share recommendations, and get advice from community members. From the best Indian restaurants to career guidance.",
      image: "💬",
      link: "/posts"
    },
    {
      icon: <Calendar className="w-8 h-8 text-accent" />,
      title: "Join cultural events",
      description: "Discover and attend Diwali celebrations, Garba nights, professional meetups, and family gatherings in your city.",
      image: "🎉",
      link: "/events"
    }
  ];

  const additionalFeatures = [
    {
      icon: <ShoppingBag className="w-6 h-6 text-primary" />,
      title: "Local Marketplace",
      description: "Buy and sell within your community"
    },
    {
      icon: <Building2 className="w-6 h-6 text-secondary" />,
      title: "Business Directory",
      description: "Discover Indian-owned businesses"
    },
    {
      icon: <Heart className="w-6 h-6 text-accent" />,
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
                  <div className="flex items-center space-x-3 mb-4">
                    {feature.icon}
                    <span className="text-4xl">{feature.image}</span>
                  </div>
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
                <div className="relative group">
                  <div className="bg-gradient-cultural rounded-2xl p-8 h-80 flex items-center justify-center overflow-hidden relative">
                    {/* Animated background pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-4 left-4 w-16 h-16 bg-primary/20 rounded-full animate-pulse"></div>
                      <div className="absolute top-12 right-8 w-8 h-8 bg-secondary/30 rounded-full animate-bounce"></div>
                      <div className="absolute bottom-8 left-12 w-12 h-12 bg-accent/25 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                      <div className="absolute bottom-4 right-4 w-6 h-6 bg-primary/20 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
                    </div>
                    
                    {/* Main content */}
                    <div className="relative z-10 text-center">
                      <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                        {feature.image}
                      </div>
                      <div className="text-sm font-medium text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {feature.title}
                      </div>
                    </div>
                    
                    {/* Floating elements */}
                    <div className="absolute top-6 right-6 w-3 h-3 bg-white/50 rounded-full animate-ping"></div>
                    <div className="absolute bottom-6 left-6 w-2 h-2 bg-white/30 rounded-full animate-pulse"></div>
                  </div>
                  
                  {/* Interactive border */}
                  <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary/30 transition-colors duration-300"></div>
                  
                  {/* Professional showcase mockup */}
                  <div className="absolute inset-0 rounded-2xl bg-white/90 p-6 opacity-0 group-hover:opacity-100 transition-all duration-500 backdrop-blur-sm">
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
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                  {feature.icon}
                </div>
              </div>
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