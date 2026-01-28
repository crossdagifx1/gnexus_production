import { useEffect, useRef, ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ParallaxContainerProps {
  children: ReactNode;
  speed?: number;
  direction?: 'vertical' | 'horizontal';
  className?: string;
}

export const ParallaxContainer = ({
  children,
  speed = 0.5,
  direction = 'vertical',
  className = '',
}: ParallaxContainerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !contentRef.current) return;

    const ctx = gsap.context(() => {
      const movement = speed * 100;
      
      gsap.fromTo(
        contentRef.current,
        {
          yPercent: direction === 'vertical' ? -movement / 2 : 0,
          xPercent: direction === 'horizontal' ? -movement / 2 : 0,
        },
        {
          yPercent: direction === 'vertical' ? movement / 2 : 0,
          xPercent: direction === 'horizontal' ? movement / 2 : 0,
          ease: 'none',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [speed, direction]);

  return (
    <div ref={containerRef} className={`overflow-hidden ${className}`}>
      <div ref={contentRef} className="will-change-transform">
        {children}
      </div>
    </div>
  );
};

// Multi-layer parallax for background effects
interface ParallaxLayerProps {
  children: ReactNode;
  speed: number;
  className?: string;
  opacity?: boolean;
  scale?: boolean;
}

export const ParallaxLayer = ({
  children,
  speed,
  className = '',
  opacity = false,
  scale = false,
}: ParallaxLayerProps) => {
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!layerRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: layerRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.5,
        },
      });

      tl.fromTo(
        layerRef.current,
        { 
          yPercent: -speed * 50,
          ...(opacity && { opacity: 0.3 }),
          ...(scale && { scale: 1.2 }),
        },
        { 
          yPercent: speed * 50,
          ...(opacity && { opacity: 1 }),
          ...(scale && { scale: 1 }),
        }
      );
    }, layerRef);

    return () => ctx.revert();
  }, [speed, opacity, scale]);

  return (
    <div ref={layerRef} className={`will-change-transform ${className}`}>
      {children}
    </div>
  );
};

// Parallax image specifically for images
interface ParallaxImageProps {
  src: string;
  alt: string;
  speed?: number;
  className?: string;
  containerClassName?: string;
}

export const ParallaxImage = ({
  src,
  alt,
  speed = 0.3,
  className = '',
  containerClassName = '',
}: ParallaxImageProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!containerRef.current || !imageRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        imageRef.current,
        { yPercent: -speed * 30 },
        {
          yPercent: speed * 30,
          ease: 'none',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [speed]);

  return (
    <div ref={containerRef} className={`overflow-hidden ${containerClassName}`}>
      <img
        ref={imageRef}
        src={src}
        alt={alt}
        className={`w-full h-[120%] object-cover will-change-transform ${className}`}
      />
    </div>
  );
};
