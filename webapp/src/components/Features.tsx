import { Lock, Zap, Shield } from "lucide-react";

const features = [
  {
    icon: Lock,
    title: "Fully Encrypted",
    description: "FHE keeps your benefit data encrypted end-to-end",
  },
  {
    icon: Zap,
    title: "Instant Claims",
    description: "Submit and process benefit claims in seconds",
  },
  {
    icon: Shield,
    title: "On-Chain Security",
    description: "Immutable records on Ethereum blockchain",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-24 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10">
                  <Icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold">{feature.title}</h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
