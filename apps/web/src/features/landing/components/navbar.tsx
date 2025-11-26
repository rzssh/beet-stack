import { Button } from "~/components/ui/button";

interface NavbarProps {
  user?: { name?: string; email?: string };
}

export default function Navbar({ user }: NavbarProps) {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded bg-primary" />
          <span className="font-bold text-xl">TanStack</span>
        </div>

        <nav className="hidden items-center gap-6 md:flex">
          <a
            href="#features"
            className="text-muted-foreground hover:text-foreground"
          >
            Features
          </a>
          <a
            href="#pricing"
            className="text-muted-foreground hover:text-foreground"
          >
            Pricing
          </a>
          <a
            href="#about"
            className="text-muted-foreground hover:text-foreground"
          >
            About
          </a>
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <Button asChild>
              <a href="/dashboard">Dashboard</a>
            </Button>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <a href="/signin">Sign In</a>
              </Button>
              <Button asChild>
                <a href="/signup">Get Started</a>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
