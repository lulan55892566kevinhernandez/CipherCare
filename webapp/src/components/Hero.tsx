import { Button } from "@/components/ui/button";
import { useAccount } from "wagmi";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const { isConnected } = useAccount();
  const navigate = useNavigate();

  return (
    <section className="pt-40 pb-32 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center space-y-10">
          <h1 className="text-6xl md:text-8xl font-bold tracking-tight leading-none">
            <span className="block mb-2">Private</span>
            <span className="block bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Benefits
            </span>
            <span className="block mt-2 text-5xl md:text-7xl text-muted-foreground/80">
              On-Chain
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-light">
            Encrypted benefit distribution using Zama FHE. Your data stays private, always.
          </p>

          <div className="pt-6">
            <Button
              size="lg"
              className="text-lg px-12 py-6 rounded-xl"
              onClick={() => navigate('/dashboard')}
            >
              {isConnected ? "Open Dashboard" : "Launch App"}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
