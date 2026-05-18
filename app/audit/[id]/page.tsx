import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  Home,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import clsx from "clsx";
import { getReview } from "@/app/actions/reviews";
import { DeleteReviewButton } from "@/components/DeleteReviewButton";
import type { ReviewReport } from "@/lib/types";

function scoreColor(score: number): { bg: string; text: string; border: string } {
  if (score >= 8) return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" };
  if (score >= 5) return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" };
  return { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" };
}

function CategoryCard({
  label,
  data,
}: {
  label: string;
  data: { score: number; feedback: string };
}) {
  const c = scoreColor(data.score);
  return (
    <div className={clsx("rounded-2xl border bg-white p-5 space-y-3", c.border)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-700">{label}</h3>
        <span
          className={clsx(
            "inline-flex items-center justify-center min-w-[44px] h-7 px-2 rounded-full text-sm font-semibold",
            c.bg,
            c.text,
          )}
        >
          {data.score}/10
        </span>
      </div>
      <p className="text-sm text-zinc-600 leading-relaxed">{data.feedback}</p>
    </div>
  );
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AuditResultPage({
  params,
}: {
  params: { id: string };
}) {
  const review = await getReview(params.id);
  if (!review) {
    redirect("/dashboard?error=review-not-found");
  }

  const report = review.report as ReviewReport;
  const overall = scoreColor(report.overall_score);

  return (
    <main className="min-h-screen p-6 md:p-10 bg-zinc-50">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-sm text-zinc-500">
              <Link href="/" className="inline-flex items-center gap-1 hover:text-zinc-900">
                <Home size={14} />
                主页
              </Link>
              <span className="text-zinc-300">·</span>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1 hover:text-zinc-900"
              >
                <ArrowLeft size={14} />
                Dashboard
              </Link>
            </div>
            <DeleteReviewButton
              reviewId={review.id}
              url={review.url}
              redirectTo="/dashboard"
            />
          </div>

          <div className="flex items-start gap-3">
            <ShieldCheck size={24} strokeWidth={2.25} className="text-amber-600 mt-1 shrink-0" />
            <div className="space-y-1 min-w-0 flex-1">
              <h1 className="text-2xl font-semibold tracking-tight">审核报告</h1>
              <a
                href={review.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-zinc-600 hover:text-zinc-900 break-all"
              >
                {review.url}
                <ExternalLink size={12} className="shrink-0" />
              </a>
              <p className="text-xs text-zinc-400">{formatDateTime(review.created_at)}</p>
            </div>
          </div>
        </header>

        <section
          className={clsx(
            "rounded-3xl border bg-white p-6 md:p-8 flex items-center justify-between gap-6",
            overall.border,
          )}
        >
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-zinc-500">总评分</p>
            <p className={clsx("text-5xl md:text-6xl font-bold tracking-tight", overall.text)}>
              {report.overall_score}
              <span className="text-2xl text-zinc-400 font-medium">/10</span>
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <Sparkles size={12} />
            审核 Agent · claude-sonnet-4-6
          </div>
        </section>

        <section className="space-y-3">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 space-y-2">
            <h2 className="text-sm uppercase tracking-wide text-zinc-500">上下文</h2>
            <dl className="space-y-1.5 text-sm">
              <div className="flex gap-2">
                <dt className="text-zinc-500 shrink-0 w-24">网站方向</dt>
                <dd className="text-zinc-900">{review.context.direction}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-zinc-500 shrink-0 w-24">目标用户</dt>
                <dd className="text-zinc-900">{review.context.audience}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-zinc-500 shrink-0 w-24">改进方向</dt>
                <dd className="text-zinc-900">{review.context.goals}</dd>
              </div>
            </dl>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CategoryCard label="结构 / 布局" data={report.structure} />
          <CategoryCard label="内容质量" data={report.content} />
          <CategoryCard label="UX 体验" data={report.ux} />
          <CategoryCard label="SEO 基础" data={report.seo} />
        </section>

        <section className="space-y-3">
          <h2 className="text-sm uppercase tracking-wide text-zinc-500">改进建议</h2>
          <ol className="space-y-3">
            {report.improvements.map((item, idx) => (
              <li
                key={idx}
                className="flex gap-3 rounded-2xl border border-zinc-200 bg-white p-4"
              >
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-brand text-xs font-semibold text-white shrink-0">
                  {idx + 1}
                </span>
                <p className="text-sm text-zinc-700 leading-relaxed">{item}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </main>
  );
}
