import Header from "@/components/Header";
import Hero from "@/components/Hero";
import WhyMohallaa from "@/components/WhyMohallaa";
import Features from "@/components/Features";
import Communities from "@/components/Communities";
import Testimonials from "@/components/Testimonials";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <WhyMohallaa />
      <Features />
      <Communities />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  );
};

export default Index;
