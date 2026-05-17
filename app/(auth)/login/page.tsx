import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-sm space-y-4">
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <p className="text-sm opacity-70">
          Auth not yet wired. Supabase Auth (email/password + Google OAuth) will go here.
        </p>
        <Link href="/" className="text-sm underline">← Back</Link>
      </div>
    </main>
  );
}