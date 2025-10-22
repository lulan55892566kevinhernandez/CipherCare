import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import BenefitsShowcase from "@/components/BenefitsShowcase";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <Header />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <BenefitsShowcase />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
