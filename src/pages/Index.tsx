import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Communities from "@/components/Communities";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <Features />
      <Communities />
      <Footer />
    </div>
  );
};

export default Index;
