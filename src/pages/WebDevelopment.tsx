import { useEffect, useRef } from "react";
import { PageLayout } from "@/components/PageLayout";
import { PageHero } from "@/components/PageHero";
import { AnimatedSection } from "@/components/AnimatedSection";
import { Button } from "@/components/ui/button";
import { Code, Smartphone, Globe, Zap, Database, Shield, ArrowRight, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const technologies = [
  { name: "React", icon: "⚛️" },
  { name: "Next.js", icon: "▲" },
  { name: "Node.js", icon: "🟢" },
  { name: "Python", icon: "🐍" },
  { name: "TypeScript", icon: "📘" },
  { name: "PostgreSQL", icon: "🐘" },
  { name: "MongoDB", icon: "🍃" },
  { name: "AWS", icon: "☁️" },
];

const services = [
  {
    icon: <Globe className="w-8 h-8" />,
    title: "Custom Web Applications",
    description: "Tailored solutions built from scratch to meet your unique business requirements with scalable architecture.",
    features: ["Custom UI/UX Design", "API Development", "Third-party Integrations", "Performance Optimization"],
  },
  {
    icon: <Smartphone className="w-8 h-8" />,
    title: "Progressive Web Apps",
    description: "Native-like experiences that work offline, load instantly, and engage users across all devices.",
    features: ["Offline Functionality", "Push Notifications", "App-like Interface", "Cross-platform"],
  },
  {
    icon: <Database className="w-8 h-8" />,
    title: "SaaS Development",
    description: "End-to-end SaaS platforms with subscription management, multi-tenancy, and analytics dashboards.",
    features: ["Multi-tenant Architecture", "Subscription Billing", "Admin Dashboards", "Analytics Integration"],
  },
  {
    icon: <Shield className="w-8 h-8" />,
    title: "E-commerce Solutions",
    description: "Secure online stores with Telebirr, Chapa, and international payment gateway integrations.",
    features: ["Telebirr Integration", "Inventory Management", "Order Tracking", "Customer Analytics"],
  },
];

const process = [
  { step: "01", title: "Discovery", description: "We dive deep into your business goals and technical requirements." },
  { step: "02", title: "Design", description: "Creating wireframes and prototypes for your approval." },
  { step: "03", title: "Development", description: "Building your application with clean, scalable code." },
  { step: "04", title: "Testing", description: "Rigorous QA to ensure everything works perfectly." },
  { step: "05", title: "Launch", description: "Deploying to production with monitoring and support." },
];

export default function WebDevelopment() {
  const containerRef = useRef<HTMLDivElement>(null);
  const techRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const processRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Technologies section - wave stagger animation
      const techItems = techRef.current?.querySelectorAll('.tech-item');
      if (techItems) {
        gsap.fromTo(
          techItems,
          { opacity: 0, scale: 0.8, y: 30 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.08,
            ease: "back.out(1.4)",
            scrollTrigger: {
              trigger: techRef.current,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          }
        );
      }

      // Services cards - 3D flip reveal
      const serviceCards = servicesRef.current?.querySelectorAll('.service-card');
      if (serviceCards) {
        serviceCards.forEach((card, index) => {
          gsap.fromTo(
            card,
            { opacity: 0, rotateY: 15, y: 60 },
            {
              opacity: 1,
              rotateY: 0,
              y: 0,
              duration: 0.8,
              delay: index * 0.15,
              ease: "power3.out",
              scrollTrigger: {
                trigger: servicesRef.current,
                start: "top 80%",
                toggleActions: "play none none none",
              },
            }
          );
        });
      }

      // Process steps - sequential reveal with parallax
      const processItems = processRef.current?.querySelectorAll('.process-item');
      if (processItems) {
        gsap.fromTo(
          processItems,
          { opacity: 0, y: 50, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.7,
            stagger: 0.12,
            ease: "power2.out",
            scrollTrigger: {
              trigger: processRef.current,
              start: "top 75%",
              toggleActions: "play none none none",
            },
          }
        );
      }

      // Floating parallax effect for CTA section with ref
      if (ctaRef.current) {
        gsap.to(ctaRef.current, {
          y: -20,
          duration: 2,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
      }

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef}>
      <PageLayout>
        <PageHero
          badge="🚀 Web Development"
          title="Build Your Digital Future"
          subtitle="From custom web applications to enterprise SaaS platforms, we craft production-ready solutions that scale with your business and delight your users."
        >
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/contact">
              <Button variant="gold" size="lg" className="group">
                Start Your Project
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/portfolio">
              <Button variant="glass" size="lg">View Our Work</Button>
            </Link>
          </div>
        </PageHero>

        {/* Technologies */}
        <section className="py-16 px-6 border-y border-border/30">
          <div className="max-w-6xl mx-auto">
            <AnimatedSection>
              <p className="text-center text-muted-foreground mb-8">Technologies We Master</p>
            </AnimatedSection>
            <div ref={techRef} className="flex flex-wrap justify-center gap-6">
              {technologies.map((tech, index) => (
                <AnimatedSection key={tech.name} delay={index * 50} animation="scaleUp">
                  <div className="tech-item flex items-center gap-2 px-6 py-3 rounded-full bg-muted/30 border border-border/50 hover:border-gold/50 hover:bg-gold/5 transition-all duration-300 group">
                    <span className="text-xl group-hover:scale-125 transition-transform">{tech.icon}</span>
                    <span className="text-sm font-medium">{tech.name}</span>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-24 px-6">
          <div ref={servicesRef} className="max-w-7xl mx-auto">
            <AnimatedSection>
              <div className="text-center mb-16">
                <span className="text-gold text-sm font-medium tracking-wider uppercase">Our Services</span>
                <h2 className="font-display font-bold text-3xl md:text-5xl mt-4 mb-6">
                  Web Solutions That <span className="text-gradient-cyber">Deliver Results</span>
                </h2>
              </div>
            </AnimatedSection>

            <div className="grid md:grid-cols-2 gap-8">
              {services.map((service, index) => (
                <AnimatedSection key={service.title} delay={index * 100} animation="fadeUp">
                  <div className="service-card group relative p-8 rounded-3xl bg-gradient-to-br from-muted/50 to-muted/20 border border-border/50 hover:border-gold/50 transition-all duration-500 h-full">
                    {/* Glow effect */}
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-gold/5 to-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="relative z-10">
                      <div className="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center text-gold mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                        {service.icon}
                      </div>

                      <h3 className="font-display font-bold text-xl mb-3">{service.title}</h3>
                      <p className="text-muted-foreground mb-6">{service.description}</p>

                      <ul className="space-y-2">
                        {service.features.map((feature) => (
                          <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 className="w-4 h-4 text-gold shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* Process */}
        <section className="py-24 px-6 bg-gradient-to-b from-background via-muted/20 to-background">
          <div ref={processRef} className="max-w-6xl mx-auto">
            <AnimatedSection>
              <div className="text-center mb-16">
                <span className="text-cyan text-sm font-medium tracking-wider uppercase">Our Process</span>
                <h2 className="font-display font-bold text-3xl md:text-5xl mt-4">
                  From Concept to <span className="text-gradient-gold">Launch</span>
                </h2>
              </div>
            </AnimatedSection>

            <div className="relative">
              {/* Connection line */}
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-gold/20 via-cyan/40 to-gold/20 hidden lg:block" />

              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
                {process.map((item, index) => (
                  <AnimatedSection key={item.step} delay={index * 100} animation="scaleUp">
                    <div className="process-item relative text-center group">
                      <div className="w-16 h-16 rounded-full bg-background border-2 border-gold/50 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:border-gold transition-all duration-300 relative z-10">
                        <span className="font-display font-bold text-gold">{item.step}</span>
                      </div>
                      <h3 className="font-display font-bold text-lg mb-2">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </AnimatedSection>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-6">
          <AnimatedSection>
            <div className="max-w-4xl mx-auto text-center">
              <div className="relative p-12 rounded-3xl bg-gradient-to-br from-gold/10 via-background to-cyan/10 border border-gold/30 overflow-hidden">
                <div className="absolute inset-0 tibeb-pattern opacity-20" />
                <div className="relative z-10">
                  <Code ref={ctaRef} className="w-12 h-12 text-gold mx-auto mb-6" />
                  <h2 className="font-display font-bold text-3xl md:text-4xl mb-4">
                    Ready to Build Something <span className="text-gradient-cyber">Extraordinary</span>?
                  </h2>
                  <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                    Let's discuss your project and create a digital solution that sets you apart from the competition.
                  </p>
                  <Link to="/contact">
                    <Button variant="gold" size="lg" className="group">
                      Get Free Consultation
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </section>
      </PageLayout>
    </div>
  );
}
