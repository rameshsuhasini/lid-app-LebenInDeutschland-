import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "accent" | "green" | "red";

const styles: Record<BadgeVariant, string> = {
  default: "bg-raised border border-[rgba(17,17,17,0.10)] text-text-lo",
  accent:  "bg-[rgba(29,78,216,0.10)] border border-[rgba(29,78,216,0.22)] text-accent",
  green:   "bg-[rgba(29,139,60,0.10)] border border-[rgba(29,139,60,0.28)] text-c-green",
  red:     "bg-[rgba(192,57,43,0.10)] border border-[rgba(192,57,43,0.28)] text-c-red",
};

export default function Badge({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-medium font-plex",
      styles[variant], className
    )}>
      {children}
    </span>
  );
}
