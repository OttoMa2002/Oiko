import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function DashboardPage() {
  return (
    <main className="min-h-screen p-8 space-y-8">
      <header className="space-y-3">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900"
        >
          <ArrowLeft size={14} />
          主页
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <Link href="/workspace/new" className="text-sm underline">New project →</Link>
        </div>
      </header>
      <section className="space-y-2">
        <h2 className="text-sm uppercase opacity-50 tracking-wide">Projects</h2>
        <p className="text-sm opacity-70">No projects yet. Persistence not yet wired.</p>
      </section>
      <section className="space-y-2">
        <h2 className="text-sm uppercase opacity-50 tracking-wide">Reviews</h2>
        <p className="text-sm opacity-70">No reviews yet.</p>
      </section>
    </main>
  );
}