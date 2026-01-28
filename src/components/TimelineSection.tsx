import { ReactNode } from "react";
import { AnimatedSection } from "./AnimatedSection";
import { cn } from "@/lib/utils";

interface TimelineItem {
  year: string;
  title: string;
  description: string;
  icon?: ReactNode;
}

interface TimelineSectionProps {
  items: TimelineItem[];
  className?: string;
}

export const TimelineSection = ({ items, className }: TimelineSectionProps) => {
  return (
    <div className={cn("relative", className)}>
      {/* Vertical line */}
      <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-gold via-cyan to-gold opacity-30" />

      <div className="space-y-12">
        {items.map((item, index) => (
          <AnimatedSection
            key={index}
            delay={index * 150}
            animation={index % 2 === 0 ? "fadeRight" : "fadeLeft"}
          >
            <div
              className={cn(
                "relative flex items-center gap-8",
                index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
              )}
            >
              {/* Content */}
              <div className={cn("flex-1 pl-12 md:pl-0", index % 2 === 0 ? "md:pr-12 md:text-right" : "md:pl-12")}>
                <span className="text-gold font-display font-bold text-lg">{item.year}</span>
                <h3 className="font-display font-bold text-xl mt-1">{item.title}</h3>
                <p className="text-muted-foreground mt-2">{item.description}</p>
              </div>

              {/* Center dot */}
              <div className="absolute left-4 md:left-1/2 w-8 h-8 -translate-x-1/2 rounded-full bg-background border-2 border-gold flex items-center justify-center z-10">
                {item.icon || <div className="w-3 h-3 rounded-full bg-gold" />}
              </div>

              {/* Empty space for alignment */}
              <div className="hidden md:block flex-1" />
            </div>
          </AnimatedSection>
        ))}
      </div>
    </div>
  );
};
