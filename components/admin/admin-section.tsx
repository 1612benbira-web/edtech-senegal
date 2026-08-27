export function AdminSection({
  title,
  children,
  contentClassName,
}: {
  title: string;
  children: React.ReactNode;
  contentClassName?: string;
}) {
  return (
    <section className="rounded-xl border border-border bg-background p-5">
      <h2 className="mb-4 text-sm font-semibold text-foreground">{title}</h2>
      <div className={contentClassName}>{children}</div>
    </section>
  );
}
