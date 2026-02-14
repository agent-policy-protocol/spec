export default function BlogLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 animate-pulse">
      <div className="h-10 w-32 bg-neutral-200 dark:bg-neutral-800 rounded mb-8" />
      <div className="grid gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-6"
          >
            <div className="h-5 w-3/4 bg-neutral-200 dark:bg-neutral-800 rounded mb-3" />
            <div className="h-4 w-full bg-neutral-200 dark:bg-neutral-800 rounded mb-2" />
            <div className="h-4 w-2/3 bg-neutral-200 dark:bg-neutral-800 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
