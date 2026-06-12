import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  accent?: boolean;
}

export default function Card({ hover, accent, className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl p-5",
        accent ? "glass-accent" : "glass shadow-card",
        hover && "card-hover cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
