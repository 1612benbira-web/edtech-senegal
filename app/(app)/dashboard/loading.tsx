export default function DashboardLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-7 w-48 rounded-md bg-muted" />
      <div className="mt-2 h-4 w-32 rounded-md bg-muted" />

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-xl border border-border bg-muted/60" />
        ))}
      </div>

      <div className="mt-8 h-6 w-40 rounded-md bg-muted" />
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-44 rounded-xl border border-border bg-muted/60" />
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="h-28 rounded-xl bg-muted/60" />
        <div className="h-28 rounded-xl bg-muted/60" />
      </div>
    </div>
  );
}
