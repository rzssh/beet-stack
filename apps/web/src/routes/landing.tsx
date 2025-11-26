import { createFileRoute } from "@tanstack/react-router";
import Benefits from "~/features/landing/components/benefits";
import Community from "~/features/landing/components/community";
import Contact from "~/features/landing/components/contact";
import FAQ from "~/features/landing/components/faq";
import Features from "~/features/landing/components/features";
import Footer from "~/features/landing/components/footer";
import Hero from "~/features/landing/components/hero";
import HowItWorks from "~/features/landing/components/how-it-works";
import Navbar from "~/features/landing/components/navbar";
import Pricing from "~/features/landing/components/pricing";
import Services from "~/features/landing/components/services";
import Sponsors from "~/features/landing/components/sponsors";
import Team from "~/features/landing/components/team";
import Testimonials from "~/features/landing/components/testimonials";
// Remove unused import - now using context.api for session data

export const Route = createFileRoute("/landing")({
  component: RouteComponent,
  loader: async ({ context }) => {
    return { user: context.user };
  },
});

function RouteComponent() {
  // Use loader data instead of useSession hook to eliminate flicker
  const { user } = Route.useLoaderData();

  return (
    <>
      <Navbar user={user ?? undefined} />
      <Hero />
      <Sponsors />
      <Benefits />
      <Features />
      <Services />
      <HowItWorks />
      <Testimonials />
      <Team />
      <Community />
      <Pricing />
      <Contact />
      <FAQ />
      <Footer />
    </>
  );
}
