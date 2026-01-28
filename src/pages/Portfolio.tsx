import { useEffect, useRef } from 'react';
import { PageLayout } from '@/components/PageLayout';
import { PageHero } from '@/components/PageHero';
import PortfolioGallery from '@/components/portfolio/PortfolioGallery';
import { AnimatedSection } from '@/components/AnimatedSection';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Portfolio = () => {
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (statsRef.current) {
      const stats = statsRef.current.querySelectorAll('.stat-number');
      stats.forEach((stat) => {
        const target = parseInt(stat.getAttribute('data-target') || '0');
        gsap.fromTo(stat,
          { innerText: 0 },
          {
            innerText: target,
            duration: 2,
            ease: 'power2.out',
            snap: { innerText: 1 },
            scrollTrigger: {
              trigger: stat,
              start: 'top 80%',
            },
          }
        );
      });
    }
  }, []);

  return (
    <PageLayout>

      <PageHero
        badge="Our Work"
        title="Crafting Digital Excellence"
        subtitle="Explore our portfolio of innovative projects that have transformed Ethiopian businesses through cutting-edge web development, stunning 3D visualization, and intelligent AI solutions."
      />

      {/* Stats Section */}
      <section className="py-16 border-b border-border">
        <div className="container mx-auto px-4">
          <div ref={statsRef} className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: 150, suffix: '+', label: 'Projects Completed' },
              { number: 50, suffix: '+', label: 'Happy Clients' },
              { number: 98, suffix: '%', label: 'Client Satisfaction' },
              { number: 5, suffix: '+', label: 'Years Experience' },
            ].map((stat, index) => (
              <AnimatedSection key={index} animation="scaleUp" delay={index * 100}>
                <div className="p-6 bg-card rounded-2xl border border-border">
                  <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                    <span className="stat-number" data-target={stat.number}>0</span>
                    {stat.suffix}
                  </div>
                  <p className="text-muted-foreground text-sm">{stat.label}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fadeUp" className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              <Sparkles className="w-3 h-3 mr-1" /> Featured Work
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Projects That Drive Results
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From e-commerce platforms to architectural visualizations, each project is crafted with precision and purpose.
            </p>
          </AnimatedSection>

          <PortfolioGallery />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary/5">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fadeUp" className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Start Your Project?
            </h2>
            <p className="text-muted-foreground mb-8">
              Let's create something amazing together. Whether you need a website, 3D visualization, or AI solution, we're here to help bring your vision to life.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="group">
                <Link to="/contact">
                  Get a Free Quote
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/gnexus">
                  Explore G-Nexus
                </Link>
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </PageLayout>
  );
};

export default Portfolio;
