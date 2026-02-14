import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Hero } from "@/components/landing/hero";
import {
  ProblemStatement,
  HowItWorks,
} from "@/components/landing/problem-and-how";
import { Features } from "@/components/landing/features";
import { EcosystemPosition } from "@/components/landing/ecosystem";
import { CodePreview } from "@/components/landing/code-preview";
import { CallToAction } from "@/components/landing/cta";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <ProblemStatement />
        <HowItWorks />
        <Features />
        <EcosystemPosition />
        <CodePreview />
        <CallToAction />
      </main>
      <Footer />
    </>
  );
}
