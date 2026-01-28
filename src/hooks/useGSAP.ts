import { useEffect, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Set GSAP defaults for smooth animations
gsap.defaults({
  ease: 'power3.out',
  duration: 1,
});

// Custom easing functions for premium feel
export const easings = {
  smooth: 'power2.out',
  smoothInOut: 'power2.inOut',
  bounce: 'back.out(1.7)',
  elastic: 'elastic.out(1, 0.3)',
  expo: 'expo.out',
  expoInOut: 'expo.inOut',
};

// Animation presets
export const animationPresets = {
  fadeUp: {
    from: { opacity: 0, y: 60 },
    to: { opacity: 1, y: 0 },
  },
  fadeDown: {
    from: { opacity: 0, y: -60 },
    to: { opacity: 1, y: 0 },
  },
  fadeLeft: {
    from: { opacity: 0, x: -60 },
    to: { opacity: 1, x: 0 },
  },
  fadeRight: {
    from: { opacity: 0, x: 60 },
    to: { opacity: 1, x: 0 },
  },
  scaleUp: {
    from: { opacity: 0, scale: 0.8 },
    to: { opacity: 1, scale: 1 },
  },
  blurIn: {
    from: { opacity: 0, filter: 'blur(20px)' },
    to: { opacity: 1, filter: 'blur(0px)' },
  },
  rotateIn: {
    from: { opacity: 0, rotationX: 90 },
    to: { opacity: 1, rotationX: 0 },
  },
};

// Main GSAP hook
export const useGSAP = () => {
  const contextRef = useRef<gsap.Context | null>(null);

  useEffect(() => {
    return () => {
      if (contextRef.current) {
        contextRef.current.revert();
      }
    };
  }, []);

  const createContext = useCallback((scope: Element | string) => {
    contextRef.current = gsap.context(() => {}, scope);
    return contextRef.current;
  }, []);

  return { gsap, ScrollTrigger, createContext, easings, animationPresets };
};

// Hook for scroll-triggered animations
export const useScrollAnimation = (
  options: {
    trigger?: string;
    start?: string;
    end?: string;
    scrub?: boolean | number;
    pin?: boolean;
    markers?: boolean;
  } = {}
) => {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!elementRef.current) return;

    const ctx = gsap.context(() => {
      const elements = elementRef.current?.querySelectorAll('[data-gsap]');
      
      elements?.forEach((element) => {
        const animationType = element.getAttribute('data-gsap') || 'fadeUp';
        const delay = parseFloat(element.getAttribute('data-delay') || '0');
        const duration = parseFloat(element.getAttribute('data-duration') || '1');
        const preset = animationPresets[animationType as keyof typeof animationPresets];

        if (preset) {
          gsap.fromTo(element, preset.from, {
            ...preset.to,
            duration,
            delay,
            scrollTrigger: {
              trigger: element,
              start: options.start || 'top 85%',
              end: options.end || 'bottom 20%',
              toggleActions: 'play none none reverse',
              ...options,
            },
          });
        }
      });
    }, elementRef);

    return () => ctx.revert();
  }, [options]);

  return elementRef;
};

// Hook for parallax effects
export const useParallax = (speed: number = 0.5) => {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!elementRef.current) return;

    const ctx = gsap.context(() => {
      gsap.to(elementRef.current, {
        yPercent: speed * 100,
        ease: 'none',
        scrollTrigger: {
          trigger: elementRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      });
    }, elementRef);

    return () => ctx.revert();
  }, [speed]);

  return elementRef;
};

// Hook for text split animations
export const useTextReveal = (options: {
  type?: 'chars' | 'words' | 'lines';
  stagger?: number;
  duration?: number;
} = {}) => {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!elementRef.current) return;

    const { type = 'words', stagger = 0.05, duration = 0.8 } = options;
    const element = elementRef.current;
    const text = element.textContent || '';
    
    let items: string[] = [];
    
    switch (type) {
      case 'chars':
        items = text.split('');
        break;
      case 'words':
        items = text.split(' ');
        break;
      case 'lines':
        items = text.split('\n');
        break;
    }

    element.innerHTML = items
      .map((item, i) => 
        `<span class="gsap-text-item" style="display: inline-block; overflow: hidden;"><span class="gsap-text-inner" style="display: inline-block;">${item}${type === 'words' ? '&nbsp;' : ''}</span></span>`
      )
      .join('');

    const ctx = gsap.context(() => {
      gsap.fromTo(
        element.querySelectorAll('.gsap-text-inner'),
        { y: '100%', opacity: 0 },
        {
          y: '0%',
          opacity: 1,
          duration,
          stagger,
          ease: easings.expo,
          scrollTrigger: {
            trigger: element,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, element);

    return () => ctx.revert();
  }, [options]);

  return elementRef;
};

// Hook for stagger animations
export const useStagger = (options: {
  stagger?: number;
  from?: 'start' | 'end' | 'center' | 'edges' | 'random';
  duration?: number;
} = {}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const { stagger = 0.1, from = 'start', duration = 0.8 } = options;

    const ctx = gsap.context(() => {
      const items = containerRef.current?.querySelectorAll('[data-stagger-item]');
      
      if (items?.length) {
        gsap.fromTo(
          items,
          { opacity: 0, y: 40, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration,
            stagger: {
              amount: stagger * items.length,
              from,
            },
            ease: easings.smooth,
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, [options]);

  return containerRef;
};

// Hook for magnetic button effect
export const useMagnetic = (strength: number = 0.3) => {
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!elementRef.current) return;

    const element = elementRef.current;
    const rect = element.getBoundingClientRect();

    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      gsap.to(element, {
        x: x * strength,
        y: y * strength,
        duration: 0.3,
        ease: 'power2.out',
      });
    };

    const handleMouseLeave = () => {
      gsap.to(element, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: 'elastic.out(1, 0.3)',
      });
    };

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [strength]);

  return elementRef;
};

export { gsap, ScrollTrigger };
