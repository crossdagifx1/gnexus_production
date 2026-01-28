import { useEffect, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { ServicesSection } from "@/components/ServicesSection";
import { TeamSection } from "@/components/TeamSection";
import { GNexusSection } from "@/components/GNexusSection";
import { ContactSection } from "@/components/ContactSection";
import { Footer } from "@/components/Footer";
import { FloatingNav } from "@/components/animations/FloatingNav";
import { CursorFollow } from "@/components/animations/CursorFollow";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const Index = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Smooth scroll progress indicator (optional enhancement)
      // Page sections fade-in coordination
      const sections = containerRef.current?.querySelectorAll('main > div');
      if (sections) {
        sections.forEach((section) => {
          gsap.fromTo(
            section,
            { opacity: 0, y: 30 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: section,
                start: 'top 85%',
                toggleActions: 'play none none none',
              },
            }
          );
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-background text-foreground">
      <CursorFollow />
      <FloatingNav />
      <Navbar />
      <main id="home">
        <HeroSection />
        <div id="services">
          <ServicesSection />
        </div>
        <div id="team">
          <TeamSection />
        </div>
        <div id="gnexus">
          <GNexusSection />
        </div>
        <div id="contact">
          <ContactSection />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
