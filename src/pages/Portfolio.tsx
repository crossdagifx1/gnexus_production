import { useEffect, useRef } from 'react';
import { PageLayout } from '@/components/PageLayout';
import PortfolioGallery from '@/components/portfolio/PortfolioGallery';
import { AnimatedSection } from '@/components/AnimatedSection';
import { Badge, Button, GradientText, StatCard } from '@/components/ui';
import { ArrowRight, Sparkles, Target, Users, Award, TrendingUp } from 'lucide-react';
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
      {/* Custom Hero with Gradient Text */}
      <section className="relative py-20 px-6 border-b border-border/30 overflow-hidden">
        <div className="absolute inset-0 gradient-mesh opacity-30" />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <Badge variant="gold" className="mb-4">
            Our Work
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <GradientText from="gold" to="cyan" animated as="h1">
              Crafting Digital Excellence
            </GradientText>
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            Explore our portfolio of innovative projects that have transformed Ethiopian businesses through cutting-edge web development, stunning 3D visualization, and intelligent AI solutions.
          </p>
        </div>
      </section>

      {/* Stats Section with StatCard */}
      <section className="py-16 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatCard
              label="Projects Completed"
              value="150+"
              variant="gold"
              icon={<Target className="w-6 h-6" />}
              animated
            />
            <StatCard
              label="Happy Clients"
              value="50+"
              variant="cyan"
              icon={<Users className="w-6 h-6" />}
              animated
            />
            <StatCard
              label="Client Satisfaction"
              value="98%"
              change={2.5}
              trend="up"
              variant="success"
              icon={<Award className="w-6 h-6" />}
              animated
            />
            <StatCard
              label="Years Experience"
              value="5+"
              variant="gold"
              icon={<TrendingUp className="w-6 h-6" />}
              animated
            />
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
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Projects That <GradientText from="gold" to="cyan">Drive Results</GradientText>
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
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Ready to <GradientText from="gold" to="cyan">Transform</GradientText> Your Business?
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
