export default function SettingsLoading() {
  return (
    <div className="mx-auto max-w-2xl animate-pulse space-y-6">
      <div>
        <div className="h-7 w-40 rounded-md bg-muted" />
        <div className="mt-2 h-4 w-56 rounded-md bg-muted" />
      </div>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="h-28 rounded-xl border border-border bg-muted/60" />
      ))}
    </div>
  );
}
