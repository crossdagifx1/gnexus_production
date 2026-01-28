import { useEffect, useRef, ReactNode, Children } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface StaggerGridProps {
  children: ReactNode;
  stagger?: number;
  from?: 'start' | 'end' | 'center' | 'edges' | 'random';
  duration?: number;
  animation?: 'fadeUp' | 'scaleIn' | 'slideIn' | 'flipIn';
  className?: string;
  itemClassName?: string;
}

export const StaggerGrid = ({
  children,
  stagger = 0.1,
  from = 'start',
  duration = 0.8,
  animation = 'fadeUp',
  className = '',
  itemClassName = '',
}: StaggerGridProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const items = containerRef.current.querySelectorAll('.stagger-item');
    if (!items.length) return;

    const animations = {
      fadeUp: {
        from: { opacity: 0, y: 60, scale: 0.95 },
        to: { opacity: 1, y: 0, scale: 1 },
      },
      scaleIn: {
        from: { opacity: 0, scale: 0.5 },
        to: { opacity: 1, scale: 1 },
      },
      slideIn: {
        from: { opacity: 0, x: -40 },
        to: { opacity: 1, x: 0 },
      },
      flipIn: {
        from: { opacity: 0, rotationY: 90 },
        to: { opacity: 1, rotationY: 0 },
      },
    };

    const anim = animations[animation];

    const ctx = gsap.context(() => {
      gsap.fromTo(items, anim.from, {
        ...anim.to,
        duration,
        stagger: {
          amount: stagger * items.length,
          from,
        },
        ease: 'power3.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, [stagger, from, duration, animation]);

  const childArray = Children.toArray(children);

  return (
    <div ref={containerRef} className={className}>
      {childArray.map((child, index) => (
        <div key={index} className={`stagger-item ${itemClassName}`}>
          {child}
        </div>
      ))}
    </div>
  );
};

// Wave stagger effect
interface WaveGridProps {
  children: ReactNode;
  columns?: number;
  duration?: number;
  delay?: number;
  className?: string;
}

export const WaveGrid = ({
  children,
  columns = 3,
  duration = 0.8,
  delay = 0.05,
  className = '',
}: WaveGridProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const items = containerRef.current.querySelectorAll('.wave-item');
    if (!items.length) return;

    const ctx = gsap.context(() => {
      items.forEach((item, index) => {
        const row = Math.floor(index / columns);
        const col = index % columns;
        const waveDelay = (row + col) * delay;

        gsap.fromTo(
          item,
          { opacity: 0, y: 80, scale: 0.9 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration,
            delay: waveDelay,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, [columns, duration, delay]);

  const childArray = Children.toArray(children);

  return (
    <div ref={containerRef} className={className}>
      {childArray.map((child, index) => (
        <div key={index} className="wave-item">
          {child}
        </div>
      ))}
    </div>
  );
};
