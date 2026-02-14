export default function DocsLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 animate-pulse">
      <div className="h-8 w-48 bg-neutral-200 dark:bg-neutral-800 rounded mb-6" />
      <div className="space-y-4">
        <div className="h-4 w-full bg-neutral-200 dark:bg-neutral-800 rounded" />
        <div className="h-4 w-5/6 bg-neutral-200 dark:bg-neutral-800 rounded" />
        <div className="h-4 w-4/6 bg-neutral-200 dark:bg-neutral-800 rounded" />
        <div className="h-4 w-full bg-neutral-200 dark:bg-neutral-800 rounded" />
        <div className="h-4 w-3/6 bg-neutral-200 dark:bg-neutral-800 rounded" />
      </div>
    </div>
  );
}
