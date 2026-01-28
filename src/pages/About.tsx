import { useEffect, useRef } from "react";
import { PageLayout } from "@/components/PageLayout";
import { PageHero } from "@/components/PageHero";
import { AnimatedSection } from "@/components/AnimatedSection";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { TimelineSection } from "@/components/TimelineSection";
import { FloatingParticles } from "@/components/FloatingParticles";
import { Target, Eye, Heart, Award, Users, Globe, Zap, Rocket, Star, Shield, Coffee } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const values = [
  { icon: <Target className="w-8 h-8" />, title: "Our Mission", desc: "Empower Ethiopian SMEs with world-class digital tools that respect local context and enable global reach." },
  { icon: <Eye className="w-8 h-8" />, title: "Our Vision", desc: "To be the backbone of East Africa's digital economy, one business at a time." },
  { icon: <Heart className="w-8 h-8" />, title: "Our Values", desc: "Innovation with integrity. Technology with purpose. Growth with community." },
];

const stats = [
  { value: 150, suffix: "+", label: "Projects Completed" },
  { value: 50, suffix: "+", label: "Happy Clients" },
  { value: 3, suffix: "", label: "Years Experience" },
  { value: 99, suffix: "%", label: "Client Satisfaction" },
];

const timeline = [
  { year: "2023", title: "G-Squad Founded", description: "Two passionate developers in Addis Ababa started with a vision to digitize Ethiopian businesses.", icon: <Rocket className="w-4 h-4 text-gold" /> },
  { year: "2024", title: "G-Nexus Launched", description: "Our flagship platform was born, integrating local payment systems with modern business tools.", icon: <Zap className="w-4 h-4 text-gold" /> },
  { year: "2025", title: "AI Integration", description: "We pioneered AI-powered automation for Ethiopian businesses, setting new industry standards.", icon: <Star className="w-4 h-4 text-gold" /> },
  { year: "2026", title: "Regional Expansion", description: "Expanding our reach across East Africa, bringing digital transformation to the region.", icon: <Globe className="w-4 h-4 text-gold" /> },
];

const partners = [
  { name: "Telebirr", logo: "📱" },
  { name: "Chapa", logo: "💳" },
  { name: "SantimPay", logo: "💰" },
  { name: "CBE", logo: "🏦" },
  { name: "Awash Bank", logo: "🏛️" },
];

const awards = [
  { title: "Best Tech Startup 2024", org: "Ethiopian Innovation Awards" },
  { title: "Digital Innovation Award", org: "East Africa Tech Summit" },
  { title: "Top 10 Fintech Solutions", org: "Africa Fintech Review" },
];

const philosophies = [
  { icon: <Shield className="w-6 h-6" />, title: "Habesha Futurism", desc: "We blend 3,000 years of Ethiopian heritage with cutting-edge technology, creating solutions that honor our past while building the future." },
  { icon: <Coffee className="w-6 h-6" />, title: "Ubuntu Philosophy", desc: "We believe in the power of community. Our success is measured by the success of the businesses we serve." },
  { icon: <Globe className="w-6 h-6" />, title: "Global Standards, Local Heart", desc: "World-class quality with deep understanding of Ethiopian market dynamics and cultural nuances." },
];

export default function About() {
  const containerRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const valuesRef = useRef<HTMLDivElement>(null);
  const partnersRef = useRef<HTMLDivElement>(null);
  const awardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Stats counters animation
      const statValues = statsRef.current?.querySelectorAll('.animated-counter');
      if (statValues) {
        gsap.fromTo(
          statValues,
          { scale: 0.5, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.8,
            stagger: 0.1,
            ease: 'back.out(1.4)',
            scrollTrigger: {
              trigger: statsRef.current,
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
          }
        );
      }

      // Values cards - 3-column reveal
      const valueCards = valuesRef.current?.querySelectorAll('.value-card');
      if (valueCards) {
        gsap.fromTo(
          valueCards,
          { opacity: 0, y: 60, rotateX: 15 },
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            duration: 0.9,
            stagger: 0.15,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: valuesRef.current,
              start: 'top 75%',
              toggleActions: 'play none none none',
            },
          }
        );
      }

      // Partners badges - wave effect
      const partnerBadges = partnersRef.current?.querySelectorAll('.partner-badge');
      if (partnerBadges) {
        gsap.fromTo(
          partnerBadges,
          { opacity: 0, scale: 0.8, rotate: -10 },
          {
            opacity: 1,
            scale: 1,
            rotate: 0,
            duration: 0.6,
            stagger: 0.08,
            ease: 'elastic.out(1, 0.7)',
            scrollTrigger: {
              trigger: partnersRef.current,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          }
        );
      }

      // Awards grid - cascade from center
      const awardCards = awardsRef.current?.querySelectorAll('.award-card');
      if (awardCards) {
        awardCards.forEach((card, index) => {
          const distanceFromCenter = Math.abs(index - 1); // Center is index 1 for 3 items
          const delay = distanceFromCenter * 0.1;

          gsap.fromTo(
            card,
            { opacity: 0, y: 50, scale: 0.9 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.7,
              delay,
              ease: 'back.out(1.2)',
              scrollTrigger: {
                trigger: awardsRef.current,
                start: 'top 80%',
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
    <div ref={containerRef}>
      <PageLayout>
        <PageHero
          badge="🏛️ About Us"
          title="Ancient Wisdom, Future Tech"
          subtitle="We're building Ethiopia's digital infrastructure by blending the wisdom of our ancestors with cutting-edge technology."
        />

        {/* Stats Section */}
        <section className="py-16 px-6 border-y border-border/30 relative overflow-hidden">
          <FloatingParticles count={15} color="gold" />
          <div ref={statsRef} className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <AnimatedSection key={stat.label} delay={i * 100} animation="scaleUp">
                <div className="text-center">
                  <div className="animated-counter font-display font-bold text-4xl md:text-5xl text-gold mb-2">
                    <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                  </div>
                  <p className="text-muted-foreground text-sm">{stat.label}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </section>

        {/* Mission, Vision, Values */}
        <section className="py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <AnimatedSection>
              <h2 className="font-display font-bold text-3xl md:text-4xl text-center mb-4">What Drives Us</h2>
              <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-16">Our foundation is built on three pillars that guide every decision we make.</p>
            </AnimatedSection>
            <div ref={valuesRef} className="grid md:grid-cols-3 gap-8">
              {values.map((item, i) => (
                <AnimatedSection key={item.title} delay={i * 100} animation="fadeUp">
                  <div className="value-card group p-8 rounded-3xl bg-muted/30 border border-border/50 hover:border-gold/50 text-center h-full transition-all duration-300 hover:-translate-y-2">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold/20 to-cyan/10 flex items-center justify-center text-gold mx-auto mb-6 group-hover:scale-110 transition-transform">
                      {item.icon}
                    </div>
                    <h3 className="font-display font-bold text-xl mb-3">{item.title}</h3>
                    <p className="text-muted-foreground">{item.desc}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* Our Story / Timeline */}
        <section className="py-24 px-6 bg-muted/10">
          <div className="max-w-4xl mx-auto">
            <AnimatedSection>
              <h2 className="font-display font-bold text-3xl md:text-4xl text-center mb-4">Our Journey</h2>
              <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-16">From a small startup to East Africa's emerging tech leader.</p>
            </AnimatedSection>
            <TimelineSection items={timeline} />
          </div>
        </section>

        {/* Philosophy Section */}
        <section className="py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <AnimatedSection>
              <h2 className="font-display font-bold text-3xl md:text-4xl text-center mb-4">Our Philosophy</h2>
              <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-16">The principles that make G-Nexus uniquely Ethiopian and globally competitive.</p>
            </AnimatedSection>
            <div className="grid md:grid-cols-3 gap-6">
              {philosophies.map((item, i) => (
                <AnimatedSection key={item.title} delay={i * 100} animation="fadeUp">
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/20 border border-border/50 h-full">
                    <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center text-gold mb-4">
                      {item.icon}
                    </div>
                    <h3 className="font-display font-bold text-lg mb-2">{item.title}</h3>
                    <p className="text-muted-foreground text-sm">{item.desc}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* Partners */}
        <section className="py-16 px-6 border-y border-border/30">
          <div className="max-w-4xl mx-auto">
            <AnimatedSection>
              <p className="text-center text-muted-foreground mb-8">Trusted by leading Ethiopian financial institutions</p>
            </AnimatedSection>
            <div ref={partnersRef} className="flex flex-wrap justify-center gap-8">
              {partners.map((partner, i) => (
                <AnimatedSection key={partner.name} delay={i * 100} animation="scaleUp">
                  <div className="partner-badge flex items-center gap-2 px-6 py-3 rounded-full bg-muted/30 border border-border/50 hover:border-gold/30 transition-colors">
                    <span className="text-2xl">{partner.logo}</span>
                    <span className="font-medium">{partner.name}</span>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* Awards */}
        <section className="py-24 px-6">
          <div className="max-w-4xl mx-auto">
            <AnimatedSection>
              <div className="flex items-center justify-center gap-2 mb-4">
                <Award className="w-6 h-6 text-gold" />
                <h2 className="font-display font-bold text-3xl">Recognition & Awards</h2>
              </div>
              <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">Our work has been recognized across the African tech ecosystem.</p>
            </AnimatedSection>
            <div ref={awardsRef} className="grid md:grid-cols-3 gap-6">
              {awards.map((award, i) => (
                <AnimatedSection key={award.title} delay={i * 100} animation="fadeUp">
                  <div className="award-card p-6 rounded-2xl bg-gradient-to-br from-gold/10 to-transparent border border-gold/20 text-center hover:border-gold/40 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-4">
                      <Award className="w-6 h-6 text-gold" />
                    </div>
                    <h3 className="font-display font-bold mb-1">{award.title}</h3>
                    <p className="text-sm text-muted-foreground">{award.org}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
      </PageLayout>
    </div>
  );
}
