import { useEffect, useRef } from "react";
import { PageLayout } from "@/components/PageLayout";
import { PageHero } from "@/components/PageHero";
import { AnimatedSection } from "@/components/AnimatedSection";
import { Button } from "@/components/ui/button";
import { Box, Eye, Layers, Camera, ArrowRight, Play, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const services = [
  {
    icon: <Box className="w-8 h-8" />,
    title: "Architectural Visualization",
    description: "Photorealistic 3D renders that bring architectural concepts to life before a single brick is laid.",
    image: "🏛️",
  },
  {
    icon: <Eye className="w-8 h-8" />,
    title: "Virtual Tours",
    description: "Immersive 360° virtual experiences that let clients walk through spaces from anywhere in the world.",
    image: "🌐",
  },
  {
    icon: <Layers className="w-8 h-8" />,
    title: "Product Rendering",
    description: "Studio-quality 3D product visualizations that showcase your products in their best light.",
    image: "💎",
  },
  {
    icon: <Camera className="w-8 h-8" />,
    title: "Animation & Motion",
    description: "Cinematic architectural flythrough animations and product reveal videos that captivate audiences.",
    image: "🎬",
  },
];

const portfolio = [
  { title: "Luxury Villa Complex", category: "Residential", rating: 5 },
  { title: "Modern Office Tower", category: "Commercial", rating: 5 },
  { title: "Retail Shopping Center", category: "Commercial", rating: 5 },
  { title: "Heritage Hotel Renovation", category: "Hospitality", rating: 5 },
  { title: "Urban Apartment Block", category: "Residential", rating: 5 },
  { title: "Tech Startup Headquarters", category: "Commercial", rating: 5 },
];

const stats = [
  { value: "500+", label: "Projects Rendered" },
  { value: "50+", label: "Architecture Firms" },
  { value: "4K+", label: "Resolution Standard" },
  { value: "24hr", label: "Fastest Turnaround" },
];

export default function ThreeDArchitecture() {
  const containerRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const portfolioRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Stats animated counters
      const statNumbers = statsRef.current?.querySelectorAll('.stat-value');
      if (statNumbers) {
        statNumbers.forEach((stat) => {
          const text = stat.textContent || '0';
          const hasPlus = text.includes('+');
          const isTime = text.includes('hr');
          const isResolution = text.includes('K+');

          let target = 0;
          if (isTime) {
            target = parseInt(text);
          } else if (isResolution) {
            target = parseInt(text);
          } else {
            target = parseInt(text.replace(/\D/g, ''));
          }

          gsap.fromTo(stat,
            { innerText: 0 },
            {
              innerText: target,
              duration: 2.5,
              ease: 'power2.out',
              snap: { innerText: 1 },
              scrollTrigger: {
                trigger: statsRef.current,
                start: 'top 80%',
              },
              onUpdate: function () {
                const val = Math.ceil(this.targets()[0].innerText);
                if (isTime) {
                  stat.textContent = `${val}hr`;
                } else if (isResolution) {
                  stat.textContent = `${val}K+`;
                } else if (hasPlus) {
                  stat.textContent = `${val}+`;
                } else {
                  stat.textContent = `${val}`;
                }
              },
            }
          );
        });
      }

      // Service cards - cascading 3D reveal
      const serviceCards = servicesRef.current?.querySelectorAll('.service-card-3d');
      if (serviceCards) {
        gsap.fromTo(
          serviceCards,
          { opacity: 0, rotateX: -15, y: 80, scale: 0.9 },
          {
            opacity: 1,
            rotateX: 0,
            y: 0,
            scale: 1,
            duration: 0.9,
            stagger: 0.15,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: servicesRef.current,
              start: 'top 75%',
              toggleActions: 'play none none none',
            },
          }
        );
      }

      // Portfolio grid - masonry reveal effect
      const portfolioItems = portfolioRef.current?.querySelectorAll('.portfolio-item');
      if (portfolioItems) {
        portfolioItems.forEach((item, index) => {
          const row = Math.floor(index / 3);
          const col = index % 3;
          const delay = (row * 0.1) + (col * 0.05);

          gsap.fromTo(
            item,
            { opacity: 0, scale: 0.85, y: 40 },
            {
              opacity: 1,
              scale: 1,
              y: 0,
              duration: 0.7,
              delay,
              ease: 'back.out(1.2)',
              scrollTrigger: {
                trigger: portfolioRef.current,
                start: 'top 80%',
                toggleActions: 'play none none none',
              },
            }
          );
        });
      }

      // Workflow steps - sequential pulse
      const workflowSteps = containerRef.current?.querySelectorAll('.workflow-step');
      if (workflowSteps) {
        gsap.fromTo(
          workflowSteps,
          { opacity: 0, scale: 0.8, rotate: -5 },
          {
            opacity: 1,
            scale: 1,
            rotate: 0,
            duration: 0.6,
            stagger: 0.15,
            ease: 'elastic.out(1, 0.5)',
            scrollTrigger: {
              trigger: '.workflow-container',
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
          }
        );
      }

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef}>
      <PageLayout>
        <PageHero
          badge="🎨 3D & Architecture"
          title="Visualize Before You Build"
          subtitle="Transform architectural concepts into stunning photorealistic visualizations. Our 3D experts bring your designs to life with cinema-quality rendering and immersive virtual experiences."
        >
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/contact">
              <Button variant="gold" size="lg" className="group">
                Get a Quote
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button variant="glass" size="lg" className="group">
              <Play className="w-4 h-4 mr-2" />
              Watch Showreel
            </Button>
          </div>
        </PageHero>

        {/* Stats */}
        <section className="py-16 px-6 border-y border-border/30">
          <div className="max-w-6xl mx-auto">
            <div ref={statsRef} className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <AnimatedSection key={stat.label} delay={index * 100} animation="scaleUp">
                  <div className="text-center">
                    <div className="stat-value font-display font-bold text-4xl md:text-5xl text-gradient-gold mb-2">
                      {stat.value}
                    </div>
                    <div className="text-muted-foreground text-sm">{stat.label}</div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="py-24 px-6">
          <div ref={servicesRef} className="max-w-7xl mx-auto">
            <AnimatedSection>
              <div className="text-center mb-16">
                <span className="text-gold text-sm font-medium tracking-wider uppercase">Our Expertise</span>
                <h2 className="font-display font-bold text-3xl md:text-5xl mt-4 mb-6">
                  Premium <span className="text-gradient-cyber">3D Services</span>
                </h2>
              </div>
            </AnimatedSection>

            <div className="grid md:grid-cols-2 gap-8">
              {services.map((service, index) => (
                <AnimatedSection key={service.title} delay={index * 100} animation="fadeUp">
                  <div className="service-card-3d group relative p-8 rounded-3xl bg-gradient-to-br from-muted/50 to-muted/20 border border-border/50 hover:border-cyan/50 transition-all duration-500 overflow-hidden">
                    {/* Decorative element */}
                    <div className="absolute top-4 right-4 text-6xl opacity-20 group-hover:opacity-40 group-hover:scale-110 transition-all duration-500">
                      {service.image}
                    </div>

                    <div className="relative z-10">
                      <div className="w-16 h-16 rounded-2xl bg-cyan/10 flex items-center justify-center text-cyan mb-6 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300">
                        {service.icon}
                      </div>

                      <h3 className="font-display font-bold text-xl mb-3">{service.title}</h3>
                      <p className="text-muted-foreground">{service.description}</p>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* Portfolio Preview */}
        <section className="py-24 px-6 bg-gradient-to-b from-background via-muted/20 to-background">
          <div ref={portfolioRef} className="max-w-7xl mx-auto">
            <AnimatedSection>
              <div className="text-center mb-16">
                <span className="text-cyan text-sm font-medium tracking-wider uppercase">Portfolio</span>
                <h2 className="font-display font-bold text-3xl md:text-5xl mt-4">
                  Recent <span className="text-gradient-gold">Projects</span>
                </h2>
              </div>
            </AnimatedSection>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolio.map((project, index) => (
                <AnimatedSection key={project.title} delay={index * 100} animation="scaleUp">
                  <div className="portfolio-item group relative aspect-[4/3] rounded-2xl bg-gradient-to-br from-muted/80 to-muted/40 border border-border/50 overflow-hidden cursor-pointer hover:border-gold/50 transition-all duration-300">
                    {/* Placeholder gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-gold/10 via-transparent to-cyan/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Content overlay */}
                    <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-background/90 via-background/50 to-transparent">
                      <span className="text-gold text-xs font-medium tracking-wider uppercase mb-2">
                        {project.category}
                      </span>
                      <h3 className="font-display font-bold text-lg mb-2">{project.title}</h3>
                      <div className="flex gap-0.5">
                        {Array.from({ length: project.rating }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-gold fill-gold" />
                        ))}
                      </div>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* Process */}
        <section className="py-24 px-6">
          <div className="workflow-container max-w-6xl mx-auto">
            <AnimatedSection>
              <div className="text-center mb-16">
                <span className="text-gold text-sm font-medium tracking-wider uppercase">How We Work</span>
                <h2 className="font-display font-bold text-3xl md:text-5xl mt-4">
                  Our <span className="text-gradient-cyber">Workflow</span>
                </h2>
              </div>
            </AnimatedSection>

            <div className="grid md:grid-cols-4 gap-8">
              {[
                { step: "01", title: "Brief", desc: "Share your drawings, references, and vision" },
                { step: "02", title: "Model", desc: "We build accurate 3D models from your plans" },
                { step: "03", title: "Render", desc: "Applying materials, lighting, and atmosphere" },
                { step: "04", title: "Deliver", desc: "Final renders in your preferred format" },
              ].map((item, index) => (
                <AnimatedSection key={item.step} delay={index * 150} animation="fadeUp">
                  <div className="workflow-step text-center group">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gold/20 to-cyan/10 border border-gold/30 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                      <span className="font-display font-bold text-2xl text-gold">{item.step}</span>
                    </div>
                    <h3 className="font-display font-bold text-lg mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
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
              <div className="relative p-12 rounded-3xl bg-gradient-to-br from-cyan/10 via-background to-gold/10 border border-cyan/30 overflow-hidden">
                <div className="absolute inset-0 tibeb-pattern opacity-20" />
                <div className="relative z-10">
                  <Box className="w-12 h-12 text-cyan mx-auto mb-6" />
                  <h2 className="font-display font-bold text-3xl md:text-4xl mb-4">
                    Ready to <span className="text-gradient-gold">Visualize</span> Your Vision?
                  </h2>
                  <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                    From concept sketches to photorealistic renders, we'll bring your architectural dreams to life.
                  </p>
                  <Link to="/contact">
                    <Button variant="cyber" size="lg" className="group">
                      Request a Quote
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
