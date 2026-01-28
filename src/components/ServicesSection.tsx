import { useEffect, useRef } from "react";
import { Code, Palette, Brain, LayoutGrid, ArrowRight, Sparkles } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link } from "react-router-dom";
import { FadeReveal, ScaleReveal } from "./animations/TextReveal";
import { GlowButton } from "./animations/MagneticButton";

gsap.registerPlugin(ScrollTrigger);

interface ServiceCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
  index: number;
  link: string;
}

const ServiceCard = ({ icon, title, description, features, index, link }: ServiceCardProps) => (
  <FadeReveal direction="up" duration={0.8} delay={index * 0.1}>
    <Link
      to={link}
      className="service-card group relative p-8 rounded-2xl glass border-glow hover:scale-[1.02] transition-all duration-500 block h-full"
    >
      {/* Hover Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-gold/10 via-transparent to-cyan/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Animated Corner Accents */}
      <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-gold/0 group-hover:border-gold/50 rounded-tl-2xl transition-all duration-500" />
      <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-cyan/0 group-hover:border-cyan/50 rounded-br-2xl transition-all duration-500" />

      <div className="relative z-10">
        <ScaleReveal delay={index * 0.1 + 0.2}>
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gold/20 to-cyan/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg">
            <div className="text-gold group-hover:text-cyan transition-colors duration-500">
              {icon}
            </div>
          </div>
        </ScaleReveal>
        <h3 className="text-xl font-display font-bold text-foreground mb-3 group-hover:text-gold transition-colors duration-300">
          {title}
        </h3>
        <p className="text-muted-foreground leading-relaxed mb-6">
          {description}
        </p>

        {/* Features List */}
        <ul className="space-y-2 mb-6">
          {features.map((feature, i) => (
            <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="w-3 h-3 text-gold" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2 text-gold opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          <span className="text-sm font-medium">Learn more</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
        </div>
      </div>
    </Link>
  </FadeReveal>
);

const services = [
  {
    icon: <Code className="w-7 h-7" />,
    title: "Web Development",
    description: "Custom SaaS platforms, landing pages, and e-commerce solutions with native Telebirr integration.",
    features: ["React & Next.js", "Telebirr & Chapa", "Responsive Design"],
    link: "/web-development",
  },
  {
    icon: <Palette className="w-7 h-7" />,
    title: "3D & Architecture",
    description: "Photorealistic ArchViz, product rendering, and immersive virtual tours that bring vision to life.",
    features: ["High-Fidelity Renders", "Virtual Tours", "Product Visualization"],
    link: "/3d-architecture",
  },
  {
    icon: <Brain className="w-7 h-7" />,
    title: "AI Automation",
    description: "Intelligent Telegram bots, AI coding agents, and business process automation powered by cutting-edge tech.",
    features: ["Custom AI Agents", "Process Automation", "Smart Integrations"],
    link: "/ai-automation",
  },
  {
    icon: <LayoutGrid className="w-7 h-7" />,
    title: "G-Nexus Platform",
    description: "All-in-one business management SaaS designed specifically for Ethiopian SMEs to thrive digitally.",
    features: ["ERP & CRM", "Website Builder", "AI Assistant"],
    link: "/gnexus",
  },
];

export const ServicesSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const orb1Ref = useRef<HTMLDivElement>(null);
  const orb2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Header animations
      const headerElements = headerRef.current?.querySelectorAll(".header-anim");
      if (headerElements) {
        gsap.fromTo(
          headerElements,
          { opacity: 0, y: 60, filter: "blur(10px)" },
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 1,
            stagger: 0.15,
            ease: "expo.out",
            scrollTrigger: {
              trigger: headerRef.current,
              start: "top 80%",
              toggleActions: "play none none none",
            },
          }
        );
      }

      // Cards wave animation
      const cards = cardsRef.current?.querySelectorAll(".service-card");
      if (cards) {
        cards.forEach((card, index) => {
          const row = Math.floor(index / 2);
          const col = index % 2;
          const delay = (row + col) * 0.1;

          gsap.fromTo(
            card,
            { opacity: 0, y: 80, scale: 0.9, rotateY: 15 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              rotateY: 0,
              duration: 0.8,
              delay,
              ease: "power3.out",
              scrollTrigger: {
                trigger: cardsRef.current,
                start: "top 85%",
                toggleActions: "play none none none",
              },
            }
          );
        });
      }

      // Parallax orbs with refs
      if (orb1Ref.current) {
        gsap.to(orb1Ref.current, {
          yPercent: 30,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 2,
          },
        });
      }

      if (orb2Ref.current) {
        gsap.to(orb2Ref.current, {
          yPercent: -20,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 2,
          },
        });
      }

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-32 px-6 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/30 to-background" />

      {/* Animated Orbs with Parallax */}
      <div ref={orb1Ref} className="absolute top-1/4 right-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl will-change-transform" />
      <div ref={orb2Ref} className="absolute bottom-1/4 left-0 w-96 h-96 bg-cyan/5 rounded-full blur-3xl will-change-transform" />


      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <div ref={headerRef} className="text-center mb-20">
          <span className="header-anim inline-block px-4 py-2 rounded-full bg-gold/10 text-gold text-sm font-medium mb-6">
            Our Services
          </span>
          <h2 className="header-anim text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground mb-6">
            Building Ethiopia's{" "}
            <span className="text-gradient-gold">Digital Future</span>
          </h2>
          <p className="header-anim text-xl text-muted-foreground max-w-2xl mx-auto">
            From web development to AI automation, we deliver premium digital solutions
            that blend ancient wisdom with futuristic technology.
          </p>
        </div>

        {/* Services Grid */}
        <div ref={cardsRef} className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <ServiceCard key={service.title} {...service} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};
