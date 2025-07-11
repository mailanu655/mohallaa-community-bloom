import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Play } from "lucide-react";

const Hero = () => {
  return (
    <section className="bg-white py-20 md:py-32">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="max-w-2xl">
            <div className="mb-6">
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                🇮🇳 The Indian Community Network
              </span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              The Professional Network
              <br />
              <span className="bg-gradient-hero bg-clip-text text-transparent">
                for Indians to connect & grow
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Discover your local Indian community, connect with professionals in your field, 
              and build meaningful relationships across America. From networking to cultural events, 
              find your home away from home.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button asChild size="lg" className="text-lg px-8 py-6 shadow-warm">
                <Link to="/communities" className="flex items-center">
                  Join Your Community
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6 group">
                <Link to="#" className="flex items-center">
                  <Play className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform" />
                  Watch Demo
                </Link>
              </Button>
            </div>

            {/* Community Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-border/50">
              <div>
                <div className="text-2xl font-bold text-foreground">50,000+</div>
                <div className="text-sm text-muted-foreground">Members</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">150+</div>
                <div className="text-sm text-muted-foreground">Cities</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">10,000+</div>
                <div className="text-sm text-muted-foreground">Events</div>
              </div>
            </div>
          </div>

          {/* Right Content - Community Grid */}
          <div className="relative">
            <div className="grid grid-cols-6 gap-4 p-8 bg-gradient-cultural rounded-2xl">
              {/* Profile avatars grid */}
              {Array.from({ length: 24 }).map((_, i) => (
                <div
                  key={i}
                  className={`
                    w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-sm
                    ${i % 6 === 0 ? 'bg-primary' : 
                      i % 6 === 1 ? 'bg-secondary' : 
                      i % 6 === 2 ? 'bg-accent' : 
                      i % 6 === 3 ? 'bg-primary-glow' : 
                      i % 6 === 4 ? 'bg-muted' : 'bg-primary/80'}
                    animate-fade-in
                  `}
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  {String.fromCharCode(65 + (i % 26))}
                </div>
              ))}
            </div>
            
            {/* Floating cards */}
            <div className="absolute -right-4 -top-4 bg-white rounded-xl shadow-elegant p-4 animate-float-gentle">
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-medium">2,847 online now</span>
              </div>
            </div>
            
            <div className="absolute -left-4 -bottom-4 bg-white rounded-xl shadow-elegant p-4 animate-float-gentle" style={{ animationDelay: '0.5s' }}>
              <div className="text-sm">
                <div className="font-semibold text-foreground">New Connection</div>
                <div className="text-muted-foreground">Priya joined your community</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;