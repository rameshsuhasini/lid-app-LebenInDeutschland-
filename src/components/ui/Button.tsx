"use client";
import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "success";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  glow?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-[#1E3FA8] text-white font-semibold hover:bg-[#2952C8] active:scale-[0.97] shimmer",
  secondary:
    "glass text-text-hi border border-[rgba(255,255,255,0.10)] hover:border-[rgba(255,255,255,0.20)] active:scale-[0.97]",
  ghost:
    "text-text-lo hover:text-text-hi hover:bg-raised active:scale-[0.97]",
  danger:
    "bg-[rgba(192,57,43,0.08)] border border-[rgba(192,57,43,0.25)] text-c-red hover:bg-[rgba(192,57,43,0.14)] active:scale-[0.97]",
  success:
    "bg-[rgba(29,139,60,0.08)] border border-[rgba(29,139,60,0.25)] text-c-green hover:bg-[rgba(29,139,60,0.14)] active:scale-[0.97]",
};

const sizes: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm rounded-xl gap-1.5",
  md: "px-4 py-2.5 text-sm rounded-2xl gap-2",
  lg: "px-6 py-3.5 text-[15px] rounded-2xl gap-2",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "secondary", size = "md", loading, glow, className, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center font-plex font-medium transition-all duration-200 cursor-pointer focus-visible:outline-[1.5px] focus-visible:outline-accent outline-offset-2 disabled:opacity-40 disabled:cursor-not-allowed overflow-hidden",
        variants[variant],
        sizes[size],
        glow && variant === "primary" && "pulse",
        className
      )}
      {...props}
    >
      {loading
        ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        : children}
    </button>
  )
);
Button.displayName = "Button";
export default Button;
