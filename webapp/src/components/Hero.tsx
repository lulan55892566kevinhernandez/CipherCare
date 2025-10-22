import { Button } from "@/components/ui/button";
import { Shield, Lock, Zap } from "lucide-react";
import { useAccount } from "wagmi";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const { isConnected } = useAccount();
  const navigate = useNavigate();

  return (
    <section className="pt-32 pb-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <Lock className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              Privacy-First Blockchain Solution
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              CipherCare
            </span>
            <br />
            <span className="text-foreground">Network</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Privacy-preserving benefit distribution platform powered by Fully Homomorphic Encryption (FHE) 
            for secure employee benefits and medical subsidies on-chain
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button 
              size="lg" 
              className="text-lg px-8 rounded-full shadow-lg hover:shadow-xl transition-all"
              onClick={() => navigate('/dashboard')}
            >
              {isConnected ? "Access Dashboard" : "Get Started"}
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 rounded-full">
              Learn More
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 max-w-4xl mx-auto">
            <div className="p-6 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-all">
              <Shield className="w-10 h-10 text-primary mb-4 mx-auto" />
              <h3 className="font-semibold mb-2">FHE Privacy Protection</h3>
              <p className="text-sm text-muted-foreground">
                Fully Homomorphic Encryption ensures data remains encrypted during computation
              </p>
            </div>
            
            <div className="p-6 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-all">
              <Zap className="w-10 h-10 text-accent mb-4 mx-auto" />
              <h3 className="font-semibold mb-2">Instant Distribution</h3>
              <p className="text-sm text-muted-foreground">
                Automated smart contracts ensure immediate benefit allocation
              </p>
            </div>
            
            <div className="p-6 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-all">
              <Lock className="w-10 h-10 text-primary mb-4 mx-auto" />
              <h3 className="font-semibold mb-2">Blockchain Security</h3>
              <p className="text-sm text-muted-foreground">
                Immutable records and tamper-proof benefit tracking
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
