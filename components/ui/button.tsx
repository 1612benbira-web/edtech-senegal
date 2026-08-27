import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex w-full items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
          "disabled:cursor-not-allowed disabled:opacity-60",
          variant === "primary" && "bg-primary text-primary-foreground hover:bg-primary/90",
          variant === "secondary" && "bg-secondary text-secondary-foreground hover:bg-secondary/90",
          variant === "ghost" && "bg-transparent text-foreground hover:bg-muted",
          variant === "danger" && "bg-danger text-danger-foreground hover:bg-danger/90",
          className
        )}
        {...props}
      >
        {isLoading ? "Chargement..." : children}
      </button>
    );
  }
);
Button.displayName = "Button";
