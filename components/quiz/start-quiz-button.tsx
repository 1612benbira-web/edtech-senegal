import { Button } from "@/components/ui/button";

export function StartQuizButton({
  action,
  arg,
  label,
  variant = "primary",
}: {
  action: (arg: string) => Promise<void>;
  arg: string;
  label: string;
  variant?: "primary" | "secondary" | "ghost";
}) {
  return (
    <form action={action.bind(null, arg)}>
      <Button type="submit" variant={variant} className="w-auto px-4 py-2 text-sm">
        {label}
      </Button>
    </form>
  );
}
