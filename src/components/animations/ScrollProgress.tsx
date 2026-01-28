import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ScrollProgressProps {
  color?: string;
  height?: number;
  position?: 'top' | 'bottom';
  showPercentage?: boolean;
  className?: string;
}

export const ScrollProgress = ({
  color = 'hsl(var(--gold))',
  height = 3,
  position = 'top',
  showPercentage = false,
  className = '',
}: ScrollProgressProps) => {
  const progressRef = useRef<HTMLDivElement>(null);
  const [percentage, setPercentage] = useState(0);

  useEffect(() => {
    if (!progressRef.current) return;

    const ctx = gsap.context(() => {
      gsap.to(progressRef.current, {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: document.body,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.3,
          onUpdate: (self) => {
            if (showPercentage) {
              setPercentage(Math.round(self.progress * 100));
            }
          },
        },
      });
    });

    return () => ctx.revert();
  }, [showPercentage]);

  return (
    <>
      <div
        ref={progressRef}
        className={`fixed ${position === 'top' ? 'top-0' : 'bottom-0'} left-0 right-0 z-[100] origin-left ${className}`}
        style={{
          height: `${height}px`,
          background: `linear-gradient(90deg, ${color}, hsl(var(--cyan)))`,
          transform: 'scaleX(0)',
        }}
      />
      {showPercentage && (
        <div
          className={`fixed ${position === 'top' ? 'top-4' : 'bottom-4'} right-4 z-[100] px-2 py-1 rounded-full text-xs font-medium`}
          style={{
            background: `linear-gradient(135deg, ${color}, hsl(var(--cyan)))`,
            color: 'hsl(var(--background))',
          }}
        >
          {percentage}%
        </div>
      )}
    </>
  );
};

// Section progress indicator
interface SectionProgressProps {
  sections: string[];
  className?: string;
}

export const SectionProgress = ({
  sections,
  className = '',
}: SectionProgressProps) => {
  const [activeSection, setActiveSection] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    sections.forEach((_, index) => {
      ScrollTrigger.create({
        trigger: `#section-${index}`,
        start: 'top center',
        end: 'bottom center',
        onEnter: () => setActiveSection(index),
        onEnterBack: () => setActiveSection(index),
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [sections]);

  return (
    <div
      ref={containerRef}
      className={`fixed right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3 ${className}`}
    >
      {sections.map((section, index) => (
        <button
          key={section}
          onClick={() => {
            const el = document.getElementById(`section-${index}`);
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="group relative flex items-center gap-3"
        >
          <span
            className={`absolute right-full mr-3 px-2 py-1 rounded text-xs whitespace-nowrap transition-all duration-300 ${
              activeSection === index
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 translate-x-2'
            }`}
            style={{
              background: 'hsl(var(--muted))',
              color: 'hsl(var(--foreground))',
            }}
          >
            {section}
          </span>
          <span
            className={`w-3 h-3 rounded-full border-2 transition-all duration-300 ${
              activeSection === index
                ? 'scale-125 border-gold bg-gold'
                : 'border-muted-foreground group-hover:border-gold'
            }`}
          />
        </button>
      ))}
    </div>
  );
};
