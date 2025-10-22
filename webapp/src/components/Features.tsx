import { Eye, FileCheck, Users, Wallet, Activity, CheckCircle } from "lucide-react";

const features = [
  {
    icon: Eye,
    title: "Privacy-Preserving Technology",
    description: "Advanced cryptographic protocols ensure employee data remains confidential while maintaining audit trails",
  },
  {
    icon: FileCheck,
    title: "Compliance Ready",
    description: "Built-in compliance with GDPR, HIPAA, and other data protection regulations",
  },
  {
    icon: Users,
    title: "Role-Based Access",
    description: "Granular permissions ensure only authorized personnel can access sensitive information",
  },
  {
    icon: Wallet,
    title: "Multi-Asset Support",
    description: "Distribute benefits in various cryptocurrencies or stablecoins with automatic conversion",
  },
  {
    icon: Activity,
    title: "Real-Time Tracking",
    description: "Monitor benefit distribution status and employee claims in real-time",
  },
  {
    icon: CheckCircle,
    title: "Automated Verification",
    description: "Smart contracts automatically verify eligibility and process claims",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Enterprise-Grade Features
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to manage employee benefits securely on the blockchain
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="p-8 rounded-2xl bg-card border border-border hover:border-primary/50 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
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
