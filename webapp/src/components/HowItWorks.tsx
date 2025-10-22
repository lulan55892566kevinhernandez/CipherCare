import { ArrowRight } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Connect Wallet",
    description: "Employees securely connect their Web3 wallet to access the platform",
  },
  {
    number: "02",
    title: "Verify Identity",
    description: "Privacy-preserving identity verification ensures only eligible employees access benefits",
  },
  {
    number: "03",
    title: "View Benefits",
    description: "Employees see their allocated benefits without exposing sensitive personal data",
  },
  {
    number: "04",
    title: "Claim & Receive",
    description: "Smart contracts automatically process claims and distribute funds instantly",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Simple, secure, and transparent benefit distribution in four steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground text-2xl font-bold shadow-lg">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-[calc(50%+2rem)] right-[-50%]">
                  <ArrowRight className="w-6 h-6 text-primary/30 mx-auto" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
