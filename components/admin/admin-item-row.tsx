export function AdminItemRow({
  icon,
  title,
  subtitle,
  href,
  actions,
  highlighted,
}: {
  icon?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  href?: string;
  actions?: React.ReactNode;
  highlighted?: boolean;
}) {
  const content = (
    <div className="flex min-w-0 items-center gap-3">
      {icon && (
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          {icon}
        </span>
      )}
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground">{title}</p>
        {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  );

  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors ${
        highlighted ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-muted/30"
      }`}
    >
      {href ? (
        <a href={href} className="min-w-0 flex-1">
          {content}
        </a>
      ) : (
        <div className="min-w-0 flex-1">{content}</div>
      )}
      {actions && <div className="flex shrink-0 items-center gap-3">{actions}</div>}
    </div>
  );
}
