import { useEffect, useRef } from "react";
import { PageLayout } from "@/components/PageLayout";
import { PageHero } from "@/components/PageHero";
import { AnimatedSection } from "@/components/AnimatedSection";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Users, Package, CreditCard, Globe, Bot, BarChart3, ArrowRight, Check, Sparkles, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: <LayoutDashboard className="w-6 h-6" />,
    title: "Smart Dashboard",
    description: "Real-time insights into your business performance with customizable widgets.",
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "CRM System",
    description: "Manage customer relationships, track leads, and automate follow-ups.",
  },
  {
    icon: <Package className="w-6 h-6" />,
    title: "Inventory Management",
    description: "Track stock levels, set reorder alerts, and manage suppliers.",
  },
  {
    icon: <CreditCard className="w-6 h-6" />,
    title: "Local Payments",
    description: "Accept Telebirr, Chapa, and SantimPay with one-click integration.",
  },
  {
    icon: <Globe className="w-6 h-6" />,
    title: "Website Builder",
    description: "Drag-and-drop builder to create your online presence in minutes.",
  },
  {
    icon: <Bot className="w-6 h-6" />,
    title: "AI Assistant",
    description: "Built-in AI to help write posts, analyze data, and automate tasks.",
  },
];

const plans = [
  {
    name: "Starter",
    price: "Free",
    description: "Perfect for small businesses just getting started",
    features: ["Up to 100 customers", "Basic CRM", "Invoice generation", "Email support"],
    popular: false,
  },
  {
    name: "Professional",
    price: "1,500 ETB",
    period: "/month",
    description: "For growing businesses that need more power",
    features: ["Unlimited customers", "Full CRM & ERP", "Payment integration", "AI Assistant", "Priority support", "Custom domain"],
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For large organizations with specific needs",
    features: ["Everything in Pro", "White-label solution", "API access", "Dedicated support", "On-premise option", "SLA guarantee"],
    popular: false,
  },
];

const testimonials = [
  {
    quote: "G-Nexus transformed how we manage our restaurant. Orders, inventory, customers - all in one place!",
    author: "Makeda T.",
    role: "Restaurant Owner, Addis Ababa",
    rating: 5,
  },
  {
    quote: "The Telebirr integration was seamless. Our customers love paying with their phones now.",
    author: "Yohannes K.",
    role: "Retail Shop Owner",
    rating: 5,
  },
  {
    quote: "Finally, a business tool built for Ethiopian businesses! The AI features save me hours every week.",
    author: "Sara M.",
    role: "Fashion Boutique",
    rating: 5,
  },
];

export default function GNexusPlatform() {
  const containerRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const pricingRef = useRef<HTMLDivElement>(null);
  const testimonialsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Feature cards - grid stagger
      const featureCards = featuresRef.current?.querySelectorAll('.feature-card');
      if (featureCards) {
        gsap.fromTo(
          featureCards,
          { opacity: 0, y: 60, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.7,
            stagger: { amount: 0.6, grid: [2, 3], from: 'start' },
            ease: 'back.out(1.2)',
            scrollTrigger: {
              trigger: featuresRef.current,
              start: 'top 75%',
              toggleActions: 'play none none none',
            },
          }
        );
      }

      // Pricing cards - scale with center emphasis
      const pricingCards = pricingRef.current?.querySelectorAll('.pricing-card');
      if (pricingCards) {
        pricingCards.forEach((card, index) => {
          const isCenter = index === 1; // Center card (Pro plan)
          gsap.fromTo(
            card,
            { opacity: 0, scale: 0.8, y: 50 },
            {
              opacity: 1,
              scale: 1,
              y: 0,
              duration: isCenter ? 0.9 : 0.7,
              delay: isCenter ? 0.1 : index * 0.1,
              ease: 'back.out(1.3)',
              scrollTrigger: {
                trigger: pricingRef.current,
                start: 'top 80%',
                toggleActions: 'play none none none',
              },
            }
          );
        });
      }

      // Testimonials - alternating slides
      const testimonialCards = testimonialsRef.current?.querySelectorAll('.testimonial-card');
      if (testimonialCards) {
        testimonialCards.forEach((card, index) => {
          const isEven = index % 2 === 0;
          gsap.fromTo(
            card,
            { opacity: 0, x: isEven ? -50 : 50, y: 30 },
            {
              opacity: 1,
              x: 0,
              y: 0,
              duration: 0.8,
              delay: index * 0.1,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: testimonialsRef.current,
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
          badge="⚡ G-Nexus Platform"
          title="Your Business Operating System"
          subtitle="The all-in-one digital platform built for Ethiopian SMEs. Manage customers, inventory, payments, and marketing from a single dashboard."
        >
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="gold" size="lg" className="group">
              Start Free Trial
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="glass" size="lg">Watch Demo</Button>
          </div>
        </PageHero>

        {/* Features Grid */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <AnimatedSection>
              <div className="text-center mb-16">
                <span className="text-gold text-sm font-medium tracking-wider uppercase">Features</span>
                <h2 className="font-display font-bold text-3xl md:text-5xl mt-4 mb-6">
                  Everything You Need to <span className="text-gradient-cyber">Grow</span>
                </h2>
              </div>
            </AnimatedSection>

            <div ref={featuresRef} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <AnimatedSection key={feature.title} delay={index * 100} animation="fadeUp">
                  <div className="feature-card group p-6 rounded-2xl bg-muted/30 border border-border/50 hover:border-gold/50 transition-all duration-300 h-full">
                    <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center text-gold mb-4 group-hover:scale-110 transition-transform">
                      {feature.icon}
                    </div>
                    <h3 className="font-display font-bold text-lg mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* Dashboard Preview */}
        <section className="py-24 px-6 bg-gradient-to-b from-background via-muted/20 to-background overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <AnimatedSection>
              <div className="text-center mb-16">
                <span className="text-cyan text-sm font-medium tracking-wider uppercase">Preview</span>
                <h2 className="font-display font-bold text-3xl md:text-5xl mt-4">
                  Beautiful & <span className="text-gradient-gold">Intuitive</span>
                </h2>
              </div>
            </AnimatedSection>

            <AnimatedSection animation="scaleUp" delay={200}>
              <div className="relative rounded-3xl border border-border/50 bg-gradient-to-br from-muted/50 to-background p-4 md:p-8 overflow-hidden">
                {/* Mock Dashboard */}
                <div className="grid grid-cols-12 gap-4">
                  {/* Sidebar */}
                  <div className="col-span-2 hidden md:block">
                    <div className="space-y-3">
                      <div className="w-full h-8 rounded-lg bg-gold/20" />
                      <div className="w-full h-6 rounded-lg bg-muted/50" />
                      <div className="w-full h-6 rounded-lg bg-muted/50" />
                      <div className="w-full h-6 rounded-lg bg-muted/50" />
                      <div className="w-full h-6 rounded-lg bg-cyan/20" />
                    </div>
                  </div>

                  {/* Main content */}
                  <div className="col-span-12 md:col-span-10 space-y-4">
                    {/* Stats row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {["12,450 ETB", "45 Orders", "128 Customers", "4.8 Rating"].map((stat, i) => (
                        <div key={i} className="p-4 rounded-xl bg-muted/50 border border-border/30">
                          <div className="text-xs text-muted-foreground mb-1">Metric</div>
                          <div className="font-display font-bold text-lg">{stat}</div>
                        </div>
                      ))}
                    </div>

                    {/* Chart placeholder */}
                    <div className="p-6 rounded-xl bg-muted/50 border border-border/30">
                      <div className="flex items-end justify-between h-32 gap-2">
                        {[40, 60, 45, 80, 55, 90, 70, 85].map((height, i) => (
                          <div
                            key={i}
                            className="flex-1 bg-gradient-to-t from-gold/50 to-gold/20 rounded-t-lg animate-pulse"
                            style={{ height: `${height}%`, animationDelay: `${i * 100}ms` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Decorative glow */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-gold/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-cyan/20 rounded-full blur-3xl" />
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <AnimatedSection>
              <div className="text-center mb-16">
                <span className="text-gold text-sm font-medium tracking-wider uppercase">Pricing</span>
                <h2 className="font-display font-bold text-3xl md:text-5xl mt-4 mb-6">
                  Simple, <span className="text-gradient-cyber">Transparent</span> Pricing
                </h2>
              </div>
            </AnimatedSection>

            <div ref={pricingRef} className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {plans.map((plan, index) => (
                <AnimatedSection key={plan.name} delay={index * 100} animation="scaleUp">
                  <div className={`pricing-card relative p-8 rounded-3xl h-full flex flex-col ${plan.popular ? 'bg-gradient-to-br from-gold/20 via-background to-cyan/10 border-2 border-gold/50' : 'bg-muted/30 border border-border/50'}`}>
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gold text-background text-sm font-bold flex items-center gap-1">
                        <Sparkles className="w-4 h-4" /> Most Popular
                      </div>
                    )}

                    <h3 className="font-display font-bold text-xl mb-2">{plan.name}</h3>
                    <div className="mb-4">
                      <span className="font-display font-bold text-4xl">{plan.price}</span>
                      {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                    </div>
                    <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>

                    <ul className="space-y-3 mb-8 flex-grow">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm">
                          <Check className={`w-4 h-4 shrink-0 ${plan.popular ? 'text-gold' : 'text-cyan'}`} />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <Button variant={plan.popular ? "gold" : "glass"} className="w-full">
                      {plan.price === "Free" ? "Get Started" : plan.price === "Custom" ? "Contact Sales" : "Start Trial"}
                    </Button>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24 px-6 bg-gradient-to-b from-background via-muted/20 to-background">
          <div className="max-w-7xl mx-auto">
            <AnimatedSection>
              <div className="text-center mb-16">
                <span className="text-cyan text-sm font-medium tracking-wider uppercase">Testimonials</span>
                <h2 className="font-display font-bold text-3xl md:text-5xl mt-4">
                  Loved by <span className="text-gradient-gold">Ethiopian Businesses</span>
                </h2>
              </div>
            </AnimatedSection>

            <div ref={testimonialsRef} className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <AnimatedSection key={testimonial.author} delay={index * 100} animation="fadeUp">
                  <div className="testimonial-card p-6 rounded-2xl bg-muted/30 border border-border/50 h-full flex flex-col">
                    <div className="flex gap-0.5 mb-4">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-gold fill-gold" />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-6 flex-grow">"{testimonial.quote}"</p>
                    <div>
                      <div className="font-bold">{testimonial.author}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
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
                  <BarChart3 className="w-12 h-12 text-gold mx-auto mb-6" />
                  <h2 className="font-display font-bold text-3xl md:text-4xl mb-4">
                    Ready to <span className="text-gradient-cyber">Transform</span> Your Business?
                  </h2>
                  <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                    Join hundreds of Ethiopian businesses already using G-Nexus to streamline their operations.
                  </p>
                  <Button variant="gold" size="lg" className="group">
                    Start Your Free Trial
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </section>
      </PageLayout>
    </div>
  );
}
