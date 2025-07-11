import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Users, MapPin } from "lucide-react";

const CTA = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-gradient-hero rounded-3xl p-12 md:p-16 text-center text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10">
              <Users className="w-16 h-16" />
            </div>
            <div className="absolute top-20 right-20">
              <MapPin className="w-12 h-12" />
            </div>
            <div className="absolute bottom-16 left-20">
              <MapPin className="w-14 h-14" />
            </div>
            <div className="absolute bottom-10 right-16">
              <Users className="w-18 h-18" />
            </div>
          </div>

          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Ready to find your community?
            </h2>
            <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto leading-relaxed">
              Join thousands of Indians building connections, sharing experiences, and creating 
              their home away from home across America.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-6 shadow-lg">
                <Link to="/communities" className="flex items-center">
                  Find Your Community
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-lg px-8 py-6 bg-white/10 border-white/30 text-white hover:bg-white hover:text-primary">
                <Link to="/auth">
                  Sign Up Free
                </Link>
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-8 text-white/80">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Free to join</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>No hidden fees</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Privacy protected</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;