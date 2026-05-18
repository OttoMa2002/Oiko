export default function Loading() {
  return (
    <main className="min-h-screen flex flex-col bg-zinc-50">
      <header className="px-4 md:px-6 py-4 border-b border-zinc-200 bg-white">
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="h-4 w-40 bg-zinc-200 rounded animate-pulse" />
          <div className="h-4 w-32 bg-zinc-100 rounded animate-pulse" />
        </div>
        <div className="flex items-center gap-3 md:gap-4 py-1.5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 md:gap-4 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-zinc-200 animate-pulse" />
                <div className="h-3 w-8 bg-zinc-100 rounded animate-pulse" />
              </div>
              {i < 3 && <div className="h-px w-8 md:w-16 bg-zinc-200" />}
            </div>
          ))}
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 min-h-0">
        <section className="border-b md:border-b-0 md:border-r border-zinc-200 min-h-[60vh] md:min-h-0 bg-white">
          <div className="px-4 py-3 border-b border-zinc-200">
            <div className="h-4 w-40 bg-zinc-200 rounded animate-pulse" />
          </div>
          <div className="p-4 space-y-4">
            <div className="ml-auto h-12 w-3/4 max-w-md bg-zinc-200 rounded-2xl animate-pulse" />
            <div className="h-6 w-24 bg-zinc-100 rounded-full animate-pulse" />
            <div className="h-32 w-11/12 bg-zinc-100 rounded-2xl animate-pulse" />
          </div>
        </section>
        <section className="min-h-[60vh] md:min-h-0 bg-zinc-100 p-3">
          <div className="h-full w-full rounded-lg border border-zinc-200 bg-white animate-pulse" />
        </section>
      </div>
    </main>
  );
}
