import Link from "next/link";

export default function SignupPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-sm space-y-4">
        <h1 className="text-2xl font-semibold">Create account</h1>
        <p className="text-sm opacity-70">
          Auth not yet wired. Supabase Auth will go here.
        </p>
        <Link href="/" className="text-sm underline">← Back</Link>
      </div>
    </main>
  );
}