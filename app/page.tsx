import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-xl space-y-6">
        <h1 className="text-4xl font-semibold">Oiko</h1>
        <p className="text-sm opacity-70">
          AI-powered web builder. Describe a site in natural language; multiple agents
          (research → architecture → code) collaborate to build it, with you in the loop.
        </p>
        <p className="text-sm opacity-70">
          Plus a website review agent: drop in a URL and get structured improvement
          feedback.
        </p>
        <div className="flex gap-4 text-sm">
          <Link href="/login" className="underline">Sign in</Link>
          <Link href="/signup" className="underline">Create account</Link>
          <Link href="/dashboard" className="underline">Dashboard</Link>
        </div>
        <p className="text-xs opacity-40 pt-8">
          Scaffold only. Auth, persistence, and agent runtime are not yet wired up.
        </p>
      </div>
    </main>
  );
}