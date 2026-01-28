import { useEffect, useRef, ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface SmoothSectionProps {
  children: ReactNode;
  className?: string;
  pin?: boolean;
  scrub?: boolean | number;
  snap?: boolean;
  animation?: 'fade' | 'scale' | 'slide' | 'reveal';
}

export const SmoothSection = ({
  children,
  className = '',
  pin = false,
  scrub = false,
  snap = false,
  animation = 'fade',
}: SmoothSectionProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !contentRef.current) return;

    const animations = {
      fade: {
        from: { opacity: 0 },
        to: { opacity: 1 },
      },
      scale: {
        from: { scale: 0.8, opacity: 0 },
        to: { scale: 1, opacity: 1 },
      },
      slide: {
        from: { yPercent: 30, opacity: 0 },
        to: { yPercent: 0, opacity: 1 },
      },
      reveal: {
        from: { clipPath: 'inset(100% 0% 0% 0%)' },
        to: { clipPath: 'inset(0% 0% 0% 0%)' },
      },
    };

    const anim = animations[animation];

    const ctx = gsap.context(() => {
      gsap.fromTo(contentRef.current, anim.from, {
        ...anim.to,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          end: 'bottom 20%',
          pin,
          scrub: scrub ? (typeof scrub === 'number' ? scrub : 1) : false,
          ...(snap && { snap: { snapTo: 1, duration: 0.5 } }),
          toggleActions: scrub ? undefined : 'play none none reverse',
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [pin, scrub, snap, animation]);

  return (
    <div ref={sectionRef} className={className}>
      <div ref={contentRef} className="will-change-transform">
        {children}
      </div>
    </div>
  );
};

// Horizontal scroll section
interface HorizontalScrollProps {
  children: ReactNode;
  className?: string;
  panelClassName?: string;
}

export const HorizontalScroll = ({
  children,
  className = '',
  panelClassName = '',
}: HorizontalScrollProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const panelsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !panelsRef.current) return;

    const panels = panelsRef.current;
    const panelElements = panels.querySelectorAll('.h-scroll-panel');

    const ctx = gsap.context(() => {
      gsap.to(panels, {
        xPercent: -100 * (panelElements.length - 1),
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          pin: true,
          scrub: 1,
          snap: 1 / (panelElements.length - 1),
          end: () => `+=${panels.scrollWidth - window.innerWidth}`,
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className={`overflow-hidden ${className}`}>
      <div ref={panelsRef} className="flex">
        {Array.isArray(children) ? (
          children.map((child, index) => (
            <div
              key={index}
              className={`h-scroll-panel flex-shrink-0 w-screen ${panelClassName}`}
            >
              {child}
            </div>
          ))
        ) : (
          <div className={`h-scroll-panel flex-shrink-0 w-screen ${panelClassName}`}>
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

// Pinned section with progress
interface PinnedSectionProps {
  children: ReactNode;
  className?: string;
  duration?: number;
}

export const PinnedSection = ({
  children,
  className = '',
  duration = 1,
}: PinnedSectionProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: `+=${window.innerHeight * duration}`,
        pin: true,
        pinSpacing: true,
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [duration]);

  return (
    <div ref={sectionRef} className={className}>
      {children}
    </div>
  );
};
