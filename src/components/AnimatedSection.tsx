import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  animation?: "fadeUp" | "fadeDown" | "fadeLeft" | "fadeRight" | "scaleUp" | "blurIn" | "rotateIn";
  delay?: number;
  duration?: number;
  stagger?: boolean;
}

// Animation disabled - component now just renders children without any animations
export const AnimatedSection = ({
  children,
  className,
}: AnimatedSectionProps) => {
  return (
    <div className={cn(className)}>
      {children}
    </div>
  );
};

// Animation variants for backward compatibility
export const animationVariants = {
  visible: "",
  fadeUp: "opacity-0 translate-y-8",
  fadeDown: "opacity-0 -translate-y-8",
  fadeLeft: "opacity-0 -translate-x-8",
  fadeRight: "opacity-0 translate-x-8",
  scaleUp: "opacity-0 scale-95",
};
