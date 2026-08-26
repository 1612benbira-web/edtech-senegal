"use client";

import { useFormStatus } from "react-dom";
import { Button } from "./button";

interface SubmitButtonProps {
  children: React.ReactNode;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  className?: string;
}

export function SubmitButton({ children, disabled, variant, className }: SubmitButtonProps) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isLoading={pending} disabled={disabled} variant={variant} className={className}>
      {children}
    </Button>
  );
}
