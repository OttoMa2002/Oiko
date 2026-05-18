"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Home,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import clsx from "clsx";

type Step = "idle" | "scraping" | "reviewing";

function looksLikeHttpUrl(u: string): boolean {
  try {
    const parsed = new URL(u);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export default function NewAuditPage() {
  const router = useRouter();

  const [url, setUrl] = useState("");
  const [direction, setDirection] = useState("");
  const [audience, setAudience] = useState("");
  const [goals, setGoals] = useState("");
  const [step, setStep] = useState<Step>("idle");
  const [error, setError] = useState<string | null>(null);

  const loading = step !== "idle";

  function validate(): string | null {
    if (!url.trim() || !looksLikeHttpUrl(url.trim())) {
      return "请输入有效的 http / https URL";
    }
    if (!direction.trim()) return "请填写网站方向";
    if (!audience.trim()) return "请填写目标用户群体";
    if (!goals.trim()) return "请填写希望改进的方向";
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

    try {
      setStep("scraping");
      const scrapeRes = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const scrapeData = await scrapeRes.json();
      if (!scrapeRes.ok) {
        setError(scrapeData.error || `抓取失败 (${scrapeRes.status})`);
        setStep("idle");
        return;
      }

      setStep("reviewing");
      const reviewRes = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: scrapeData.url,
          html: scrapeData.html,
          context: {
            direction: direction.trim(),
            audience: audience.trim(),
            goals: goals.trim(),
          },
        }),
      });
      const reviewData = await reviewRes.json();
      if (!reviewRes.ok) {
        setError(reviewData.error || `审核失败 (${reviewRes.status})`);
        setStep("idle");
        return;
      }

      router.push(`/audit/${reviewData.id}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "网络错误");
      setStep("idle");
    }
  }

  return (
    <main className="min-h-screen p-6 md:p-10">
      <div className="max-w-2xl mx-auto space-y-6">
        <header className="space-y-3">
          <div className="flex items-center gap-3 text-sm text-zinc-500">
            <Link href="/" className="inline-flex items-center gap-1 hover:text-zinc-900">
              <Home size={14} />
              主页
            </Link>
            <span className="text-zinc-300">·</span>
            <Link href="/dashboard" className="inline-flex items-center gap-1 hover:text-zinc-900">
              <ArrowLeft size={14} />
              Dashboard
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={20} strokeWidth={2.25} className="text-amber-600" />
            <h1 className="text-2xl font-semibold tracking-tight">新建网站审核</h1>
          </div>
          <p className="text-sm text-zinc-500">
            填入一个 URL 和上下文，审核 Agent 会从结构、内容、UX、SEO 四个维度打分并给出改进建议。
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              <AlertCircle size={14} strokeWidth={2.25} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="url" className="text-xs font-medium text-zinc-700">
              网站 URL
            </label>
            <input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={loading}
              placeholder="https://example.com"
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 disabled:opacity-60"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="direction" className="text-xs font-medium text-zinc-700">
              网站方向
            </label>
            <input
              id="direction"
              type="text"
              value={direction}
              onChange={(e) => setDirection(e.target.value)}
              disabled={loading}
              placeholder="例如：开发者工具的产品介绍页"
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 disabled:opacity-60"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="audience" className="text-xs font-medium text-zinc-700">
              目标用户群体
            </label>
            <input
              id="audience"
              type="text"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              disabled={loading}
              placeholder="例如：独立开发者、初创团队 CTO"
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 disabled:opacity-60"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="goals" className="text-xs font-medium text-zinc-700">
              希望改进的方向
            </label>
            <textarea
              id="goals"
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              disabled={loading}
              rows={3}
              placeholder="例如：转化率不高，想知道首屏文案 / CTA 是否够清晰；移动端体验有没有问题"
              className="w-full resize-none rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 disabled:opacity-60"
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
            {step === "scraping" && (
              <>
                <Loader2 size={14} className="animate-spin" />
                正在抓取页面…
              </>
            )}
            {step === "reviewing" && (
              <>
                <Loader2 size={14} className="animate-spin" />
                审核 Agent 分析中…
              </>
            )}
            {step === "idle" && (
              <>
                开始审核
                <ArrowRight size={14} />
              </>
            )}
          </button>

          <p className="text-xs text-zinc-400 text-center">
            预计耗时 ~10–20 秒。审核结果会保存到 Dashboard，每次审核计入账户额度。
          </p>
        </form>
      </div>
    </main>
  );
}
