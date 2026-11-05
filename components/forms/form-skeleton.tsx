export function FormSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-5" aria-hidden="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex flex-col gap-1.5">
          <span className="h-3 w-24 animate-pulse rounded bg-line" />
          <span className="h-12 animate-pulse rounded-md bg-bg" />
        </div>
      ))}
      <span className="h-12 w-full animate-pulse rounded-full bg-line" />
    </div>
  );
}
