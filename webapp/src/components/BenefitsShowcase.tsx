import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Heart, Umbrella, GraduationCap } from "lucide-react";

const benefitTypes = [
  {
    icon: Heart,
    title: "Health Insurance",
    amount: "$2,500",
    status: "Active",
    color: "text-red-500",
  },
  {
    icon: DollarSign,
    title: "Wellness Stipend",
    amount: "$500",
    status: "Available",
    color: "text-green-500",
  },
  {
    icon: Umbrella,
    title: "Emergency Fund",
    amount: "$1,000",
    status: "Active",
    color: "text-blue-500",
  },
  {
    icon: GraduationCap,
    title: "Education Subsidy",
    amount: "$3,000",
    status: "Pending",
    color: "text-purple-500",
  },
];

const BenefitsShowcase = () => {
  return (
    <section id="benefits" className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Benefits Dashboard Preview
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            See how employees view and manage their benefits securely
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {benefitTypes.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <Card key={index} className="border-2 hover:border-primary/50 transition-all shadow-sm hover:shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center ${benefit.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <CardTitle className="text-lg">{benefit.title}</CardTitle>
                    </div>
                    <Badge variant={benefit.status === "Active" ? "default" : "secondary"}>
                      {benefit.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">{benefit.amount}</span>
                    <span className="text-muted-foreground">allocated</span>
                  </div>
                  <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                      style={{ width: `${Math.random() * 40 + 60}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default BenefitsShowcase;
