export default function ProgrammeLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-6 w-40 rounded-md bg-muted" />
      <div className="mt-2 h-4 w-64 rounded-md bg-muted" />
      <div className="mt-6 space-y-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-16 rounded-xl border border-border bg-muted/60" />
        ))}
      </div>
    </div>
  );
}
