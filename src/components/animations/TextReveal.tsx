import { useEffect, useRef, ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface TextRevealProps {
  children: ReactNode;
  type?: 'chars' | 'words' | 'lines';
  stagger?: number;
  duration?: number;
  delay?: number;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div';
  animation?: 'slideUp' | 'fadeIn' | 'clipReveal' | 'blurIn';
}

export const TextReveal = ({
  children,
  type = 'words',
  stagger = 0.03,
  duration = 0.8,
  delay = 0,
  className = '',
  as: Component = 'div',
  animation = 'slideUp',
}: TextRevealProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!containerRef.current || hasAnimated.current) return;
    
    const element = containerRef.current;
    const text = element.textContent || '';
    
    let items: string[] = [];
    
    switch (type) {
      case 'chars':
        items = text.split('');
        break;
      case 'words':
        items = text.split(' ').filter(Boolean);
        break;
      case 'lines':
        items = text.split('\n').filter(Boolean);
        break;
    }

    // Create wrapped elements
    element.innerHTML = items
      .map((item) => {
        const separator = type === 'words' ? ' ' : '';
        return `<span class="gsap-word-wrapper" style="display: inline-block; overflow: hidden; vertical-align: bottom;"><span class="gsap-word" style="display: inline-block; will-change: transform, opacity;">${item}${separator}</span></span>`;
      })
      .join('');

    const innerElements = element.querySelectorAll('.gsap-word');
    
    // Animation configurations
    const animations = {
      slideUp: {
        from: { y: '110%', opacity: 0, rotateX: 45 },
        to: { y: '0%', opacity: 1, rotateX: 0 },
      },
      fadeIn: {
        from: { opacity: 0, y: 20 },
        to: { opacity: 1, y: 0 },
      },
      clipReveal: {
        from: { clipPath: 'inset(100% 0% 0% 0%)', y: '100%' },
        to: { clipPath: 'inset(0% 0% 0% 0%)', y: '0%' },
      },
      blurIn: {
        from: { opacity: 0, filter: 'blur(10px)', y: 20 },
        to: { opacity: 1, filter: 'blur(0px)', y: 0 },
      },
    };

    const anim = animations[animation];

    const ctx = gsap.context(() => {
      gsap.fromTo(innerElements, anim.from, {
        ...anim.to,
        duration,
        delay,
        stagger,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: element,
          start: 'top 90%',
          toggleActions: 'play none none none',
        },
      });
    }, element);

    hasAnimated.current = true;

    return () => ctx.revert();
  }, [type, stagger, duration, delay, animation]);

  return (
    <Component ref={containerRef as any} className={className}>
      {children}
    </Component>
  );
};

// Simple fade reveal for any content
interface FadeRevealProps {
  children: ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
  duration?: number;
  delay?: number;
  distance?: number;
  className?: string;
}

export const FadeReveal = ({
  children,
  direction = 'up',
  duration = 1,
  delay = 0,
  distance = 60,
  className = '',
}: FadeRevealProps) => {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!elementRef.current) return;

    const directions = {
      up: { y: distance, x: 0 },
      down: { y: -distance, x: 0 },
      left: { x: distance, y: 0 },
      right: { x: -distance, y: 0 },
    };

    const dir = directions[direction];

    const ctx = gsap.context(() => {
      gsap.fromTo(
        elementRef.current,
        { opacity: 0, ...dir },
        {
          opacity: 1,
          x: 0,
          y: 0,
          duration,
          delay,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: elementRef.current,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, elementRef);

    return () => ctx.revert();
  }, [direction, duration, delay, distance]);

  return (
    <div ref={elementRef} className={className}>
      {children}
    </div>
  );
};

// Scale reveal animation
interface ScaleRevealProps {
  children: ReactNode;
  duration?: number;
  delay?: number;
  className?: string;
}

export const ScaleReveal = ({
  children,
  duration = 1,
  delay = 0,
  className = '',
}: ScaleRevealProps) => {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!elementRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        elementRef.current,
        { opacity: 0, scale: 0.8, filter: 'blur(10px)' },
        {
          opacity: 1,
          scale: 1,
          filter: 'blur(0px)',
          duration,
          delay,
          ease: 'back.out(1.5)',
          scrollTrigger: {
            trigger: elementRef.current,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, elementRef);

    return () => ctx.revert();
  }, [duration, delay]);

  return (
    <div ref={elementRef} className={className}>
      {children}
    </div>
  );
};
