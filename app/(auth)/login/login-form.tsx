"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import clsx from "clsx";
import { createClient } from "@/lib/supabase/client";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Props = {
  redirectTo?: string;
};

export function LoginForm({ redirectTo }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function validate(): string | null {
    if (!EMAIL_RE.test(email.trim())) return "请输入有效的邮箱地址";
    if (password.length < 6) return "密码至少 6 位";
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }
    router.replace(redirectTo || "/dashboard");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">欢迎回来</h1>
        <p className="text-sm text-zinc-500">登录你的 Oiko 账号继续构建</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            <AlertCircle size={14} strokeWidth={2.25} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-1.5">
          <label htmlFor="email" className="text-xs font-medium text-zinc-700">
            邮箱
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            autoComplete="email"
            placeholder="you@example.com"
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 disabled:opacity-60"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-xs font-medium text-zinc-700">
              密码
            </label>
            <button
              type="button"
              className="text-xs text-zinc-400 hover:text-zinc-600 cursor-not-allowed"
              disabled
              title="待实现"
            >
              忘记密码？
            </button>
          </div>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            autoComplete="current-password"
            placeholder="至少 6 位"
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 disabled:opacity-60"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={clsx(
            "w-full inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-opacity bg-gradient-brand",
            loading ? "opacity-60 cursor-not-allowed" : "hover:opacity-90",
          )}
        >
          {loading ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              登录中…
            </>
          ) : (
            <>
              登录
              <ArrowRight size={14} />
            </>
          )}
        </button>
      </form>

      <p className="text-center text-sm text-zinc-500">
        还没有账号？{" "}
        <Link
          href="/signup"
          className="font-medium text-zinc-900 hover:underline"
        >
          立即注册
        </Link>
      </p>
    </div>
  );
}
