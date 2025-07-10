import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-community.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Mohallaa Community"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-6">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
          Your Indian Community in{" "}
          <span className="bg-gradient-hero bg-clip-text text-transparent">
            America
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl mb-4 text-white/90 max-w-3xl mx-auto leading-relaxed animate-fade-in">
          Mohallaa connects Indians across America through location-based communities, 
          cultural events, and local business networks.
        </p>
        
        <p className="text-lg md:text-xl mb-8 text-white/80 max-w-2xl mx-auto leading-relaxed animate-fade-in">
          Find your neighborhood. Build meaningful connections. Create home away from home.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-float-gentle">
          <Button variant="hero" size="lg" className="text-lg px-8 py-6">
            Join Your Community
          </Button>
          <Button variant="cultural" size="lg" className="text-lg px-8 py-6">
            Explore Features
          </Button>
        </div>

        {/* Community Stats */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="animate-glow-pulse">
            <div className="text-3xl font-bold text-primary-glow">50,000+</div>
            <div className="text-white/80">Community Members</div>
          </div>
          <div className="animate-glow-pulse">
            <div className="text-3xl font-bold text-primary-glow">150+</div>
            <div className="text-white/80">Cities Connected</div>
          </div>
          <div className="animate-glow-pulse">
            <div className="text-3xl font-bold text-primary-glow">10,000+</div>
            <div className="text-white/80">Events & Meetups</div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default Hero;