import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-xl border border-border bg-card p-4", className)}
      {...props}
    />
  );
}

export function MetricCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <Card className="flex items-start justify-between">
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-1 font-mono text-2xl font-semibold text-foreground">{value}</p>
      </div>
      {icon && (
        <div className="rounded-lg bg-primary/10 p-2 text-primary">{icon}</div>
      )}
    </Card>
  );
}
