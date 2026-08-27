export default function AdminLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-6 w-40 rounded-md bg-muted" />
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-20 rounded-lg border border-border bg-muted/60" />
        ))}
      </div>
    </div>
  );
}
