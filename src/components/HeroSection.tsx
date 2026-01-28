import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Zap, Shield, Globe, MessageSquare, Bot } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import heroPattern from "@/assets/hero-pattern.jpg";
import { ParallaxLayer } from "./animations/ParallaxContainer";
import { MeshGradient } from "./animations/MeshGradient";
import { MagneticButton } from "./animations/MagneticButton";

gsap.registerPlugin(ScrollTrigger);

const floatingFeatures = [
  { icon: <Zap className="w-5 h-5" />, label: "Lightning Fast", delay: "0ms" },
  { icon: <Shield className="w-5 h-5" />, label: "Secure", delay: "200ms" },
  { icon: <Globe className="w-5 h-5" />, label: "Global Ready", delay: "400ms" },
];

export const HeroSection = () => {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subheadlineRef = useRef<HTMLParagraphElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    // Use requestAnimationFrame to ensure DOM is ready
    const animationFrame = requestAnimationFrame(() => {
      if (!sectionRef.current) return;

      const ctx = gsap.context(() => {
        // Create master timeline with small delay
        const tl = gsap.timeline({
          defaults: { ease: "power3.out" },
          delay: 0.1 // Ensure refs are populated
        });

        // Badge animation - set initial state first
        if (badgeRef.current) {
          gsap.set(badgeRef.current, { opacity: 0 });
          tl.fromTo(
            badgeRef.current,
            { opacity: 0, y: 30, scale: 0.9 },
            { opacity: 1, y: 0, scale: 1, duration: 0.8 }
          );
        }

        // Headline split animation - set initial state first
        if (headlineRef.current) {
          const words = headlineRef.current.querySelectorAll(".word");
          if (words.length > 0) {
            gsap.set(words, { opacity: 0 });
            tl.fromTo(
              words,
              { opacity: 0, y: 80, rotateX: 45 },
              {
                opacity: 1,
                y: 0,
                rotateX: 0,
                duration: 1,
                stagger: 0.1,
                ease: "expo.out"
              },
              "-=0.4"
            );
          }
        }

        // Subheadline - set initial state first
        if (subheadlineRef.current) {
          gsap.set(subheadlineRef.current, { opacity: 0 });
          tl.fromTo(
            subheadlineRef.current,
            { opacity: 0, y: 40, filter: "blur(10px)" },
            { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.8 },
            "-=0.6"
          );
        }

        // Features - set initial state first
        if (featuresRef.current) {
          const pills = featuresRef.current.querySelectorAll(".feature-pill");
          if (pills.length > 0) {
            gsap.set(pills, { opacity: 0 });
            tl.fromTo(
              pills,
              { opacity: 0, scale: 0.8, y: 20 },
              { opacity: 1, scale: 1, y: 0, duration: 0.6, stagger: 0.1 },
              "-=0.4"
            );
          }
        }

        // CTAs - set initial state first
        if (ctaRef.current) {
          gsap.set(ctaRef.current, { opacity: 0 });
          tl.fromTo(
            ctaRef.current,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.6 },
            "-=0.3"
          );
        }

        // Stats - set initial state first
        if (statsRef.current) {
          gsap.set(statsRef.current, { opacity: 0 });
          tl.fromTo(
            statsRef.current,
            { opacity: 0, y: 40 },
            { opacity: 1, y: 0, duration: 0.8 },
            "-=0.2"
          );
        }

        // Fallback: ensure all content is visible after 2 seconds
        const fallbackTimer = setTimeout(() => {
          if (badgeRef.current) gsap.set(badgeRef.current, { opacity: 1 });
          if (headlineRef.current) {
            const words = headlineRef.current.querySelectorAll(".word");
            gsap.set(words, { opacity: 1, y: 0, rotateX: 0 });
          }
          if (subheadlineRef.current) gsap.set(subheadlineRef.current, { opacity: 1, filter: "blur(0px)" });
          if (featuresRef.current) {
            const pills = featuresRef.current.querySelectorAll(".feature-pill");
            gsap.set(pills, { opacity: 1 });
          }
          if (ctaRef.current) gsap.set(ctaRef.current, { opacity: 1 });
          if (statsRef.current) gsap.set(statsRef.current, { opacity: 1 });
        }, 2000);

        // Floating particles parallax - only if elements exist
        const floatingParticles = document.querySelectorAll(".floating-particle");
        if (floatingParticles.length > 0) {
          gsap.to(floatingParticles, {
            y: "-=100",
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top top",
              end: "bottom top",
              scrub: 1,
            },
          });
        }

        // Background parallax - only if element exists
        const heroBg = document.querySelector(".hero-bg");
        if (heroBg) {
          gsap.to(heroBg, {
            yPercent: 30,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top top",
              end: "bottom top",
              scrub: 1.5,
            },
          });
        }

        return () => clearTimeout(fallbackTimer);
      }, sectionRef);

      return () => ctx.revert();
    });

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Parallax */}
      <div
        className="hero-bg absolute inset-0 bg-cover bg-center opacity-30 will-change-transform"
        style={{ backgroundImage: `url(${heroPattern})` }}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-hero-gradient" />

      {/* Advanced Mesh Gradient Background */}
      <MeshGradient
        colors={[
          'hsla(var(--gold), 0.15)',
          'hsla(var(--cyan), 0.12)',
          'hsla(var(--gold-glow), 0.1)',
        ]}
        speed={25}
      />

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="floating-particle absolute w-1 h-1 bg-gold/30 rounded-full will-change-transform"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center pt-20">
        {/* Badge */}
        <div
          ref={badgeRef}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gold/10 border border-gold/30 text-gold text-sm font-medium mb-8 opacity-0 hover:bg-gold/20 hover:scale-105 transition-all duration-300 cursor-default"
        >
          <Sparkles className="w-4 h-4" />
          <span>Habesha Futurism • Digital Excellence</span>
        </div>

        {/* Headline with character reveal animation */}
        <h1
          ref={headlineRef}
          className="text-5xl md:text-6xl lg:text-8xl font-display font-bold mb-6 leading-tight"
        >
          <div className="text-foreground">
            <span className="word inline-block">Ancient</span>{' '}
            <span className="word inline-block">Wisdom</span>
          </div>
          <div className="text-gradient-gold text-glow-gold" style={{ color: 'hsl(var(--gold))', WebkitTextFillColor: 'hsl(var(--gold))' }}>
            <span className="word inline-block">Futuristic</span>{' '}
            <span className="word inline-block">Technology</span>
          </div>
        </h1>

        {/* Subheadline */}
        <p
          ref={subheadlineRef}
          className="text-xl md:text-2xl max-w-3xl mx-auto mb-12 leading-relaxed text-foreground"
        >
          We are G-Nexus — Ethiopia's premier digital platform building the future through web, 3D, and AI innovation.
        </p>

        {/* Floating Feature Pills */}
        <div ref={featuresRef} className="flex flex-wrap justify-center gap-4 mb-12">
          {floatingFeatures.map((feature) => (
            <div
              key={feature.label}
              className="feature-pill flex items-center gap-2 px-4 py-2 rounded-full glass text-foreground text-sm hover:scale-110 hover:bg-gold/10 transition-all duration-300 cursor-default opacity-0"
            >
              <span className="text-cyan">{feature.icon}</span>
              <span>{feature.label}</span>
            </div>
          ))}
        </div>

        {/* CTAs with magnetic effects */}
        <div ref={ctaRef} className="flex flex-wrap gap-4 justify-center opacity-0 group/ctas">
          <MagneticButton strength={0.4} className="magnetic">
            <Button
              variant="hero"
              size="xl"
              className="group w-full min-w-[200px]"
              onClick={() => navigate('/contact')}
            >
              Start Your Project
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
          </MagneticButton>

          <MagneticButton strength={0.3} className="magnetic">
            <Button
              variant="hero"
              size="xl"
              className="group w-full min-w-[200px] border-cyan/50 hover:border-cyan text-foreground bg-cyan/10 hover:bg-cyan/20"
              onClick={() => navigate('/chat')}
            >
              <MessageSquare className="w-5 h-5 mr-2 text-cyan group-hover:scale-110 transition-transform" />
              G-Nexus AI
            </Button>
          </MagneticButton>

          <MagneticButton strength={0.3} className="magnetic">
            <Button
              variant="hero"
              size="xl"
              className="group w-full min-w-[200px] border-purple-500/50 hover:border-purple-500 text-foreground bg-purple-500/10 hover:bg-purple-500/20"
              onClick={() => navigate('/agent')}
            >
              <Bot className="w-5 h-5 mr-2 text-purple-400 group-hover:scale-110 transition-transform" />
              Nexus Agent
            </Button>
          </MagneticButton>

          <MagneticButton strength={0.3} className="magnetic">
            <Button
              variant="heroOutline"
              size="xl"
              className="group w-full min-w-[200px]"
              onClick={() => navigate('/gnexus')}
            >
              <span className="group-hover:text-gold transition-colors duration-300">Explore Platform</span>
            </Button>
          </MagneticButton>
        </div>

        {/* Stats */}
        <div
          ref={statsRef}
          className="grid grid-cols-3 gap-8 mt-24 pt-10 border-t border-border/30 max-w-3xl mx-auto opacity-0"
        >
          {[
            { value: "50+", label: "Projects Delivered", color: "text-gold" },
            { value: "2", label: "Expert Founders", color: "text-cyan" },
            { value: "∞", label: "Possibilities", color: "text-foreground" },
          ].map((stat) => (
            <div key={stat.label} className="group cursor-default">
              <div className={`stat-value text-4xl md:text-5xl font-display font-bold ${stat.color} mb-2 group-hover:scale-110 transition-transform duration-300`}>
                {stat.value}
              </div>
              <div className="text-muted-foreground text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className="text-muted-foreground text-sm">Scroll to explore</span>
        <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
          <div className="w-1.5 h-3 rounded-full bg-gold animate-bounce" />
        </div>
      </div>
    </section>
  );
};
