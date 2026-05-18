export default function Loading() {
  return (
    <main className="min-h-screen p-6 md:p-10 bg-zinc-50">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="h-4 w-40 bg-zinc-200 rounded animate-pulse" />
            <div className="h-7 w-16 bg-zinc-200 rounded-full animate-pulse" />
          </div>
          <div className="flex items-start gap-3">
            <div className="h-6 w-6 bg-zinc-200 rounded animate-pulse mt-1 shrink-0" />
            <div className="space-y-2 flex-1 min-w-0">
              <div className="h-7 w-32 bg-zinc-200 rounded animate-pulse" />
              <div className="h-4 w-2/3 bg-zinc-100 rounded animate-pulse" />
              <div className="h-3 w-32 bg-zinc-100 rounded animate-pulse" />
            </div>
          </div>
        </header>

        <section className="rounded-3xl border border-zinc-200 bg-white p-6 md:p-8 space-y-2">
          <div className="h-3 w-16 bg-zinc-100 rounded animate-pulse" />
          <div className="h-14 md:h-16 w-32 bg-zinc-200 rounded animate-pulse" />
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-5 space-y-2">
          <div className="h-3 w-16 bg-zinc-100 rounded animate-pulse" />
          <div className="space-y-2 pt-1">
            <div className="h-4 w-2/3 bg-zinc-100 rounded animate-pulse" />
            <div className="h-4 w-1/2 bg-zinc-100 rounded animate-pulse" />
            <div className="h-4 w-3/4 bg-zinc-100 rounded animate-pulse" />
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-zinc-200 bg-white p-5 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="h-4 w-24 bg-zinc-200 rounded animate-pulse" />
                <div className="h-7 w-12 bg-zinc-100 rounded-full animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full bg-zinc-100 rounded animate-pulse" />
                <div className="h-3 w-5/6 bg-zinc-100 rounded animate-pulse" />
                <div className="h-3 w-2/3 bg-zinc-100 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </section>

        <section className="space-y-3">
          <div className="h-3 w-20 bg-zinc-200 rounded animate-pulse" />
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="flex gap-3 rounded-2xl border border-zinc-200 bg-white p-4"
            >
              <div className="h-6 w-6 bg-zinc-200 rounded-full animate-pulse shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-full bg-zinc-100 rounded animate-pulse" />
                <div className="h-3 w-3/4 bg-zinc-100 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
