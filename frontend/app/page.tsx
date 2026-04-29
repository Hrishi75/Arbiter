import { Nav } from "@/components/landing/nav";
import { Hero } from "@/components/landing/hero";
import { ProtocolSteps } from "@/components/landing/protocol-steps";
import { ReputationTiers } from "@/components/landing/reputation-tiers";
import { Footer } from "@/components/landing/footer";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background">
      <Nav />
      <Hero />
      <ProtocolSteps />
      <ReputationTiers />
      <Footer />
    </main>
  );
}
