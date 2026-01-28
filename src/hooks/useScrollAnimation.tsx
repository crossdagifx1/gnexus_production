import { useEffect, useRef, useState } from "react";

interface UseScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export const useScrollAnimation = (options: UseScrollAnimationOptions = {}) => {
  const { threshold = 0.1, rootMargin = "0px", triggerOnce = true } = options;
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, rootMargin, triggerOnce]);

  return { ref, isVisible };
};

// Animation variants for common use cases
export const animationVariants = {
  fadeUp: "translate-y-8 opacity-0",
  fadeDown: "translate-y-[-2rem] opacity-0",
  fadeLeft: "translate-x-8 opacity-0",
  fadeRight: "translate-x-[-2rem] opacity-0",
  scaleUp: "scale-95 opacity-0",
  rotateIn: "rotate-6 opacity-0",
  visible: "translate-y-0 translate-x-0 scale-100 rotate-0 opacity-100",
};

// Stagger delay helper
export const getStaggerDelay = (index: number, baseDelay: number = 100) => ({
  transitionDelay: `${index * baseDelay}ms`,
});
