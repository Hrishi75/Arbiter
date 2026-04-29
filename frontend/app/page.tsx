import { Nav } from "@/components/landing/nav";
import { Hero } from "@/components/landing/hero";
import { ProtocolSteps } from "@/components/landing/protocol-steps";
import { ReputationTiers } from "@/components/landing/reputation-tiers";
import { Footer } from "@/components/landing/footer";

export default function LandingPage() {
  return (
    <main id="top" className="relative isolate min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-20 h-[36rem] bg-[radial-gradient(circle_at_top,rgba(201,100,66,0.22),transparent_58%)]" />
      <div className="pointer-events-none absolute left-1/2 top-24 -z-20 h-[32rem] w-[52rem] -translate-x-1/2 rounded-full bg-accent/10 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 -z-30 landing-grid opacity-60" />
      <Nav />
      <Hero />
      <ProtocolSteps />
      <ReputationTiers />
      <Footer />
    </main>
  );
}
