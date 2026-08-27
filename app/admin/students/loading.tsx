export default function AdminStudentsLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-6 w-32 rounded-md bg-muted" />
      <div className="mt-4 h-10 w-full max-w-sm rounded-lg bg-muted/60" />
      <div className="mt-4 h-64 rounded-xl border border-border bg-muted/60" />
    </div>
  );
}
