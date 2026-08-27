export default function QuizLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-6 w-24 rounded-md bg-muted" />
      <div className="mt-2 h-4 w-72 rounded-md bg-muted" />
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="h-28 rounded-xl bg-muted/60" />
        <div className="h-28 rounded-xl bg-muted/60" />
      </div>
      <div className="mt-8 h-5 w-32 rounded-md bg-muted" />
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-xl border border-border bg-muted/60" />
        ))}
      </div>
    </div>
  );
}
