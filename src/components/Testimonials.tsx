import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const Testimonials = () => {
  const testimonials = [
    {
      name: "Priya Sharma",
      role: "Software Engineer, San Francisco",
      content: "Mohallaa helped me find my community when I moved to the Bay Area. I've made lifelong friends and found the best Indian grocery stores through the platform.",
      avatar: "P",
      rating: 5
    },
    {
      name: "Rahul Patel",
      role: "Product Manager, Seattle",
      content: "The professional networking aspect is incredible. I've connected with other Indian professionals in tech and even found my current job through a community member's referral.",
      avatar: "R",
      rating: 5
    },
    {
      name: "Anita Kumar",
      role: "Doctor, Houston",
      content: "As a working mom, Mohallaa has been a lifesaver. From finding babysitters to organizing playdates, the community support has been amazing.",
      avatar: "A",
      rating: 5
    },
    {
      name: "Vikram Singh",
      role: "Entrepreneur, New York",
      content: "I started my Indian catering business through connections I made on Mohallaa. The local marketplace feature helped me reach my target customers easily.",
      avatar: "V",
      rating: 5
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            What our <span className="bg-gradient-hero bg-clip-text text-transparent">community</span> says
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Stories from Indians across America who've found their home away from home through Mohallaa.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="hover:shadow-elegant transition-all duration-300 bg-white border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center space-x-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                
                <p className="text-muted-foreground mb-6 leading-relaxed text-sm">
                  "{testimonial.content}"
                </p>
                
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground text-sm">{testimonial.name}</div>
                    <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-16 text-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">4.9/5</div>
              <div className="text-sm text-muted-foreground">Average Rating</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-secondary mb-2">95%</div>
              <div className="text-sm text-muted-foreground">User Satisfaction</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent mb-2">85%</div>
              <div className="text-sm text-muted-foreground">Made New Friends</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-glow mb-2">70%</div>
              <div className="text-sm text-muted-foreground">Career Growth</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;