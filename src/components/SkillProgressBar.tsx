import { useEffect, useState } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";

interface SkillProgressBarProps {
  label: string;
  percentage: number;
  color?: "gold" | "cyan" | "primary";
  delay?: number;
}

export const SkillProgressBar = ({
  label,
  percentage,
  color = "gold",
  delay = 0,
}: SkillProgressBarProps) => {
  const [width, setWidth] = useState(0);
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.3 });

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => setWidth(percentage), delay);
      return () => clearTimeout(timer);
    }
  }, [isVisible, percentage, delay]);

  const colorClasses = {
    gold: "bg-gradient-to-r from-gold to-gold-glow",
    cyan: "bg-gradient-to-r from-cyan to-cyan-glow",
    primary: "bg-gradient-to-r from-primary to-secondary",
  };

  return (
    <div ref={ref} className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">{percentage}%</span>
      </div>
      <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-1000 ease-out",
            colorClasses[color]
          )}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
};
