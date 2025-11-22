import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { ThemeToggle } from "~/components/ThemeToggle";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { getSessionFn } from "~/lib/better-auth/auth-session";
import { authClientRepo } from "~/lib/better-auth/auth-client-repo";
import { 
  Code2, 
  Zap, 
  Shield, 
  Database, 
  Smartphone,
  Server,
  ArrowRight,
  CheckCircle2,
  Github,
  LogOut
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Home,
  loader: async () => {
    // Get session data for conditional rendering (non-blocking)
    try {
      const session = await getSessionFn();
      return { user: session?.user || null };
    } catch {
      return { user: null };
    }
  },
});

function Home() {
  const { queryClient } = Route.useRouteContext();
  // Use loader data instead of useSession hook to eliminate flicker
  const { user } = Route.useLoaderData();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Navigation Bar */}
      <nav className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Code2 className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl text-foreground">TanStack × Elysia</span>
          </div>
          
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  Welcome, {user.name}
                </span>
                <Button asChild variant="outline">
                  <Link to="/dashboard">Dashboard</Link>
                </Button>
                <Button
                  onClick={async () => {
                    await authClientRepo.signOut();
                    await router.invalidate();
                    window.location.href = "/";
                  }}
                  variant="ghost"
                  size="icon"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button asChild variant="ghost">
                  <Link to="/signin">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link to="/signup">Get Started</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container py-20">
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
            <Zap className="h-4 w-4" />
            Production-Ready Full-Stack Boilerplate
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-foreground">
            Build <span className="text-primary">blazing fast</span> apps
            <br />with modern tech
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            TanStack Start + Elysia.js + Better Auth + Drizzle ORM. 
            Everything you need to ship production apps with confidence.
          </p>
          
          <div className="flex gap-4 justify-center pt-4">
            <Button asChild size="lg" className="gap-2">
              <Link to="/count">
                Live Demo
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="gap-2">
              <a href="https://github.com/yourusername/yourrepo" target="_blank" rel="noopener noreferrer">
                <Github className="h-4 w-4" />
                View on GitHub
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container py-20">
        <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
          Everything included, zero configuration
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon={<Server className="h-6 w-6" />}
            title="TanStack Start + Elysia"
            description="Full-stack React with file-based routing and type-safe Elysia backend"
          />
          <FeatureCard
            icon={<Shield className="h-6 w-6" />}
            title="Better Auth"
            description="Complete authentication with OAuth, magic links, and session management"
          />
          <FeatureCard
            icon={<Database className="h-6 w-6" />}
            title="Drizzle + PostgreSQL"
            description="Type-safe database with migrations and automatic schema generation"
          />
          <FeatureCard
            icon={<Smartphone className="h-6 w-6" />}
            title="React Native Ready"
            description="Expo app with shared API types via Eden Treaty"
          />
          <FeatureCard
            icon={<Zap className="h-6 w-6" />}
            title="Bun Runtime"
            description="Lightning-fast development with native TypeScript support"
          />
          <FeatureCard
            icon={<Code2 className="h-6 w-6" />}
            title="Eden Treaty"
            description="End-to-end type safety from backend to frontend"
          />
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="container py-20">
        <div className="bg-card rounded-2xl border p-8 md:p-12">
          <h2 className="text-3xl font-bold mb-8 text-card-foreground">Modern Tech Stack</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold mb-4 text-primary">Frontend</h3>
              <ul className="space-y-2">
                {[
                  "TanStack Start (React + SSR)",
                  "TanStack Query for data fetching",
                  "Tailwind CSS v4 + shadcn/ui",
                  "Jotai for state management",
                  "PostHog analytics"
                ].map(item => (
                  <li key={item} className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-primary">Backend & Infrastructure</h3>
              <ul className="space-y-2">
                {[
                  "Elysia.js with Better Auth",
                  "Drizzle ORM + PostgreSQL",
                  "Eden Treaty for type-safe APIs",
                  "Stripe payments integration",
                  "AWS S3 file storage"
                ].map(item => (
                  <li key={item} className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-20 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-3xl font-bold text-foreground">
            Ready to build something amazing?
          </h2>
          <p className="text-muted-foreground">
            Get started in minutes with our production-ready boilerplate
          </p>
          <div className="flex gap-4 justify-center">
            {user ? (
              <Button asChild size="lg" className="gap-2">
                <Link to="/dashboard">
                  Go to Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button asChild size="lg" className="gap-2">
                <Link to="/signup">
                  Start Building
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) {
  return (
    <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-200">
      <CardHeader>
        <div className="p-2 bg-primary/10 rounded-lg w-fit mb-2 text-primary">
          {icon}
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
    </Card>
  );
}
