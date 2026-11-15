export default function BfemLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-6 w-36 rounded-md bg-muted" />
      <div className="mt-2 h-4 w-80 max-w-full rounded-md bg-muted" />
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-24 rounded-xl bg-muted/60" />
        ))}
      </div>
      <div className="mt-8 h-5 w-40 rounded-md bg-muted" />
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-28 rounded-xl border border-border bg-muted/60" />
        ))}
      </div>
    </div>
  );
}
