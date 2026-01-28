import { ReactNode, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface PageHeroProps {
  title: string;
  subtitle: string;
  badge?: string;
  children?: ReactNode;
}

export const PageHero = ({ title, subtitle, badge, children }: PageHeroProps) => {
  const heroRef = useRef<HTMLElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const childrenRef = useRef<HTMLDivElement>(null);
  const orb1Ref = useRef<HTMLDivElement>(null);
  const orb2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!heroRef.current) return;

    // Use requestAnimationFrame to ensure DOM is ready
    const animationFrame = requestAnimationFrame(() => {
      if (!heroRef.current) return;

      const ctx = gsap.context(() => {
        // Master timeline with initial delay to ensure refs are populated
        const tl = gsap.timeline({
          defaults: { ease: "expo.out" },
          delay: 0.1 // Small delay to ensure all refs are ready
        });

        // Badge animation - animate FROM hidden state (content visible by default)
        if (badgeRef.current) {
          tl.from(
            badgeRef.current,
            {
              opacity: 0,
              y: 30,
              scale: 0.9,
              duration: 0.8,
              immediateRender: false // Don't hide immediately
            },
            0.2
          );
        }

        // Title animation - animate FROM hidden state
        if (titleRef.current) {
          tl.from(
            titleRef.current,
            {
              opacity: 0,
              y: 60,
              filter: "blur(10px)",
              duration: 1,
              immediateRender: false // Don't hide immediately
            },
            0.4
          );
        }

        // Subtitle - animate FROM hidden state
        if (subtitleRef.current) {
          tl.from(
            subtitleRef.current,
            {
              opacity: 0,
              y: 40,
              duration: 0.8,
              immediateRender: false // Don't hide immediately
            },
            0.6
          );
        }

        // Children (buttons etc) - animate FROM hidden state
        if (childrenRef.current) {
          tl.from(
            childrenRef.current,
            {
              opacity: 0,
              y: 30,
              duration: 0.6,
              immediateRender: false // Don't hide immediately
            },
            0.8
          );
        }

        // Parallax orbs - with null checks
        if (orb1Ref.current) {
          gsap.to(orb1Ref.current, {
            yPercent: 50,
            ease: "none",
            scrollTrigger: {
              trigger: heroRef.current,
              start: "top top",
              end: "bottom top",
              scrub: 2,
            },
          });
        }

        if (orb2Ref.current) {
          gsap.to(orb2Ref.current, {
            yPercent: -30,
            xPercent: 20,
            ease: "none",
            scrollTrigger: {
              trigger: heroRef.current,
              start: "top top",
              end: "bottom top",
              scrub: 2,
            },
          });
        }
      }, heroRef);

      return () => ctx.revert();
    });

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <section ref={heroRef} className="relative pt-32 pb-20 px-6 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 tibeb-pattern opacity-30" />
      <div
        ref={orb1Ref}
        className="absolute top-20 left-1/4 w-96 h-96 bg-gold/10 rounded-full blur-3xl will-change-transform"
      />
      <div
        ref={orb2Ref}
        className="absolute bottom-20 right-1/4 w-96 h-96 bg-cyan/10 rounded-full blur-3xl will-change-transform"
      />

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {badge && (
          <span
            ref={badgeRef}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/30 text-gold text-sm font-medium mb-6"
          >
            {badge}
          </span>
        )}

        <h1
          ref={titleRef}
          className="font-display font-bold text-4xl md:text-6xl lg:text-7xl mb-6 leading-tight"
        >
          <span className="text-gradient-gold">{title}</span>
        </h1>

        <p
          ref={subtitleRef}
          className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
        >
          {subtitle}
        </p>

        {children && (
          <div ref={childrenRef} className="mt-8">
            {children}
          </div>
        )}
      </div>
    </section>
  );
};
