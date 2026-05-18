export default function Loading() {
  return (
    <main className="min-h-screen p-6 md:p-10 space-y-8">
      <header className="space-y-3 max-w-5xl mx-auto w-full">
        <div className="h-4 w-16 bg-zinc-200 rounded animate-pulse" />
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="space-y-2">
            <div className="h-7 w-32 bg-zinc-200 rounded animate-pulse" />
            <div className="h-3 w-72 bg-zinc-100 rounded animate-pulse" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-4 w-40 bg-zinc-100 rounded animate-pulse" />
            <div className="h-7 w-16 bg-zinc-100 rounded-full animate-pulse" />
          </div>
        </div>
      </header>

      <section className="max-w-5xl mx-auto w-full space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-3 w-20 bg-zinc-200 rounded animate-pulse" />
          <div className="h-7 w-24 bg-zinc-200 rounded-full animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-zinc-200 bg-white p-5 space-y-3"
            >
              <div className="h-5 w-3/4 bg-zinc-200 rounded animate-pulse" />
              <div className="h-3 w-full bg-zinc-100 rounded animate-pulse" />
              <div className="h-3 w-1/2 bg-zinc-100 rounded animate-pulse" />
              <div className="flex justify-between pt-2">
                <div className="h-5 w-20 bg-zinc-100 rounded-full animate-pulse" />
                <div className="h-3 w-12 bg-zinc-100 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-5xl mx-auto w-full space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-3 w-20 bg-zinc-200 rounded animate-pulse" />
          <div className="h-7 w-24 bg-zinc-200 rounded-full animate-pulse" />
        </div>
        <div className="space-y-2">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-zinc-200 bg-white p-4 flex items-center gap-4"
            >
              <div className="h-12 w-12 bg-zinc-100 rounded-xl animate-pulse shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-2/3 bg-zinc-200 rounded animate-pulse" />
                <div className="h-3 w-1/4 bg-zinc-100 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
