export default function ProgressLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-6 w-40 rounded-md bg-muted" />
      <div className="mt-6 h-20 rounded-lg border border-border bg-muted/60" />
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="h-16 rounded-xl bg-muted/60" />
        <div className="h-16 rounded-xl bg-muted/60" />
      </div>
      <div className="mt-8 space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-10 rounded-md bg-muted/60" />
        ))}
      </div>
    </div>
  );
}
