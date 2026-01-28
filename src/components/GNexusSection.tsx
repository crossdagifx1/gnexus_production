import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Zap, Shield, TrendingUp, ArrowRight, Sparkles, BarChart3, Users, ShoppingCart } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link } from "react-router-dom";

gsap.registerPlugin(ScrollTrigger);

const features = [
  { icon: <Zap className="w-5 h-5" />, text: "ERP & CRM for SMEs" },
  { icon: <Shield className="w-5 h-5" />, text: "Telebirr & Chapa Integration" },
  { icon: <TrendingUp className="w-5 h-5" />, text: "AI-Powered Insights" },
  { icon: <CheckCircle className="w-5 h-5" />, text: "Drag-and-Drop Builder" },
];

const dashboardStats = [
  { icon: <ShoppingCart className="w-5 h-5" />, value: "147", label: "Orders", color: "text-gold" },
  { icon: <TrendingUp className="w-5 h-5" />, value: "89%", label: "Growth", color: "text-cyan" },
  { icon: <Users className="w-5 h-5" />, value: "1.2K", label: "Customers", color: "text-foreground" },
];

export const GNexusSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const orb1Ref = useRef<HTMLDivElement>(null);
  const orb2Ref = useRef<HTMLDivElement>(null);
  const decoRingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Content slide in from left
      const contentElements = contentRef.current?.querySelectorAll(".content-anim");
      if (contentElements) {
        gsap.fromTo(
          contentElements,
          { opacity: 0, x: -80, filter: "blur(10px)" },
          {
            opacity: 1,
            x: 0,
            filter: "blur(0px)",
            duration: 1,
            stagger: 0.1,
            ease: "expo.out",
            scrollTrigger: {
              trigger: contentRef.current,
              start: "top 80%",
              toggleActions: "play none none none",
            },
          }
        );
      }

      // Features stagger
      const featureItems = featuresRef.current?.querySelectorAll(".feature-item");
      if (featureItems) {
        gsap.fromTo(
          featureItems,
          { opacity: 0, x: -30, scale: 0.9 },
          {
            opacity: 1,
            x: 0,
            scale: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: "back.out(1.5)",
            scrollTrigger: {
              trigger: featuresRef.current,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          }
        );
      }

      // Visual card animation
      gsap.fromTo(
        visualRef.current,
        { opacity: 0, x: 100, rotateY: -15, scale: 0.9 },
        {
          opacity: 1,
          x: 0,
          rotateY: 0,
          scale: 1,
          duration: 1.2,
          ease: "expo.out",
          scrollTrigger: {
            trigger: visualRef.current,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        }
      );

      // Dashboard stats counting animation
      const statElements = visualRef.current?.querySelectorAll(".stat-value");
      if (statElements) {
        statElements.forEach((stat) => {
          const value = stat.textContent || "";
          gsap.fromTo(
            stat,
            { opacity: 0, scale: 0.5 },
            {
              opacity: 1,
              scale: 1,
              duration: 0.8,
              ease: "elastic.out(1, 0.5)",
              scrollTrigger: {
                trigger: stat,
                start: "top 90%",
                toggleActions: "play none none none",
              },
            }
          );
        });
      }

      // Chart bars animation
      const chartBars = visualRef.current?.querySelectorAll(".chart-bar");
      if (chartBars) {
        gsap.fromTo(
          chartBars,
          { scaleY: 0, transformOrigin: "bottom" },
          {
            scaleY: 1,
            duration: 0.8,
            stagger: 0.1,
            ease: "elastic.out(1, 0.5)",
            scrollTrigger: {
              trigger: chartBars[0]?.parentElement,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          }
        );
      }

      // Parallax effects with refs
      if (orb1Ref.current) {
        gsap.to(orb1Ref.current, {
          yPercent: 50,
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
          yPercent: -30,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 2,
          },
        });
      }

      // Decorative ring rotation with ref
      if (decoRingRef.current) {
        gsap.to(decoRingRef.current, {
          rotation: 360,
          duration: 30,
          ease: "none",
          repeat: -1,
        });
      }

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-32 px-6 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-background to-cyan/5" />

      {/* Floating Elements with Parallax */}
      <div ref={orb1Ref} className="absolute top-20 left-10 w-72 h-72 bg-gold/10 rounded-full blur-3xl will-change-transform" />
      <div ref={orb2Ref} className="absolute bottom-20 right-10 w-96 h-96 bg-cyan/10 rounded-full blur-3xl will-change-transform" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div ref={contentRef}>
            <span className="content-anim inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 text-gold text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Flagship Product
            </span>
            <h2 className="content-anim text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground mb-6 leading-tight">
              <span className="text-gradient-gold text-glow-gold">G-Nexus</span>
              <br />
              <span className="text-2xl md:text-3xl lg:text-4xl text-muted-foreground font-normal">
                Ethiopia's Digital Operating System
              </span>
            </h2>
            <p className="content-anim text-lg text-muted-foreground mb-8 leading-relaxed">
              The all-in-one platform designed for Ethiopian SMEs. Manage customers,
              inventory, websites, and payments from a single beautiful dashboard —
              powered by AI that understands your business.
            </p>

            {/* Features */}
            <div ref={featuresRef} className="grid grid-cols-2 gap-4 mb-10">
              {features.map((feature, index) => (
                <div
                  key={feature.text}
                  className="feature-item flex items-center gap-3 group cursor-default"
                >
                  <div className="text-gold group-hover:text-cyan group-hover:scale-110 transition-all duration-300">{feature.icon}</div>
                  <span className="text-foreground text-sm group-hover:text-gold transition-colors duration-300">{feature.text}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="content-anim flex flex-col sm:flex-row gap-4">
              <Link to="/gnexus">
                <Button variant="hero" size="xl" className="group">
                  Get Early Access
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </Link>
              <Button variant="heroOutline" size="xl">
                Watch Demo
              </Button>
            </div>
          </div>

          {/* Visual */}
          <div ref={visualRef} className="relative opacity-0" style={{ perspective: "1000px" }}>
            <div className="relative aspect-square max-w-lg mx-auto">
              {/* Main Card */}
              <div className="absolute inset-4 rounded-3xl glass border-glow p-8 flex flex-col justify-between hover:scale-[1.02] transition-transform duration-500">
                <div>
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold to-gold-glow flex items-center justify-center shadow-lg">
                      <span className="text-background font-bold text-xl">G</span>
                    </div>
                    <div>
                      <span className="font-display font-bold text-xl text-foreground">G-Nexus</span>
                      <p className="text-xs text-muted-foreground">Dashboard v2.0</p>
                    </div>
                  </div>

                  {/* Mini Chart */}
                  <div className="mb-6 p-4 rounded-xl bg-muted/30">
                    <div className="flex items-center gap-2 mb-3">
                      <BarChart3 className="w-4 h-4 text-gold" />
                      <span className="text-sm text-muted-foreground">Revenue Overview</span>
                    </div>
                    <div className="flex items-end gap-1 h-16">
                      {[40, 65, 45, 80, 55, 90, 70].map((height, i) => (
                        <div
                          key={i}
                          className="chart-bar flex-1 bg-gradient-to-t from-gold/50 to-gold rounded-t"
                          style={{ height: `${height}%` }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="h-3 bg-muted rounded-full w-3/4" />
                    <div className="h-3 bg-muted rounded-full w-1/2" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-8">
                  {dashboardStats.map((stat, index) => (
                    <div
                      key={stat.label}
                      className="p-4 rounded-xl bg-muted/50 text-center group hover:bg-muted/70 transition-all duration-300 cursor-default"
                    >
                      <div className={`stat-value text-2xl font-bold ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                        {stat.value}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-1">
                        {stat.icon}
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Decorative Ring */}
              <div ref={decoRingRef} className="absolute inset-0 border-2 border-dashed border-gold/20 rounded-3xl" />

              {/* Floating Badges */}
              <div className="absolute -top-4 -right-4 px-3 py-1.5 rounded-full bg-cyan/20 text-cyan text-xs font-medium">
                <Sparkles className="w-3 h-3 inline mr-1" />
                AI Powered
              </div>
              <div className="absolute -bottom-4 -left-4 px-3 py-1.5 rounded-full bg-gold/20 text-gold text-xs font-medium">
                🇪🇹 Made in Ethiopia
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
