import { useState } from "react";
import { cn } from "@/lib/utils";

interface CategoryTabsProps {
  categories: string[];
  defaultCategory?: string;
  onChange?: (category: string) => void;
  className?: string;
}

export const CategoryTabs = ({
  categories,
  defaultCategory,
  onChange,
  className,
}: CategoryTabsProps) => {
  const [active, setActive] = useState(defaultCategory || categories[0]);

  const handleClick = (category: string) => {
    setActive(category);
    onChange?.(category);
  };

  return (
    <div className={cn("flex flex-wrap gap-2 justify-center", className)}>
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => handleClick(category)}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
            active === category
              ? "bg-gold text-background shadow-lg shadow-gold/20"
              : "bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          )}
        >
          {category}
        </button>
      ))}
    </div>
  );
};
