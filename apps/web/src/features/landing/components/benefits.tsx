import { Code, Rocket, Shield, Zap } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

export default function Benefits() {
  const benefits = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Built with Bun runtime for maximum performance",
    },
    {
      icon: Shield,
      title: "Type Safe",
      description: "End-to-end type safety with Eden Treaty",
    },
    {
      icon: Code,
      title: "Developer Experience",
      description: "Hot reloading, great tooling, and modern patterns",
    },
    {
      icon: Rocket,
      title: "Production Ready",
      description: "Battle-tested patterns for scalable applications",
    },
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto">
        <div className="mb-12 text-center">
          <h2 className="mb-4 font-bold text-3xl">
            Why Choose TanStack Start?
          </h2>
          <p className="text-muted-foreground">
            Built for modern development with the latest technologies
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit, index) => (
            <Card key={index}>
              <CardHeader>
                <benefit.icon className="h-8 w-8 text-primary" />
                <CardTitle>{benefit.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{benefit.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
