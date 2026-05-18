export default function Loading() {
  return (
    <main className="min-h-screen p-6 md:p-10">
      <div className="max-w-2xl mx-auto space-y-6">
        <header className="space-y-3">
          <div className="h-4 w-40 bg-zinc-200 rounded animate-pulse" />
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 bg-zinc-200 rounded animate-pulse" />
            <div className="h-7 w-40 bg-zinc-200 rounded animate-pulse" />
          </div>
          <div className="h-4 w-2/3 bg-zinc-100 rounded animate-pulse" />
        </header>

        <div className="space-y-5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-3 w-20 bg-zinc-200 rounded animate-pulse" />
              <div
                className={`${i === 3 ? "h-20" : "h-10"} w-full bg-zinc-100 rounded-lg animate-pulse`}
              />
            </div>
          ))}
          <div className="h-10 w-full bg-zinc-200 rounded-lg animate-pulse" />
        </div>
      </div>
    </main>
  );
}
