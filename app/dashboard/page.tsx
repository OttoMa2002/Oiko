import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  ExternalLink,
  LogOut,
  Plus,
  ShieldCheck,
} from "lucide-react";
import clsx from "clsx";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/actions/auth";
import { createProject } from "@/app/actions/projects";
import { ProjectCard } from "@/components/ProjectCard";
import { getUserUsage } from "@/lib/usage";
import {
  MAX_API_CALLS_PER_USER,
  MAX_PROJECTS_PER_USER,
  MAX_REVIEWS_PER_USER,
  PROJECT_CAP_ERROR,
} from "@/lib/limits";
import type { ProjectRow, ReviewReport } from "@/lib/types";

async function newProjectAction() {
  "use server";
  let newId: string | null = null;
  try {
    const result = await createProject();
    newId = result.id;
  } catch (e) {
    if (e instanceof Error && e.message === PROJECT_CAP_ERROR) {
      redirect("/dashboard?error=project-cap-reached");
    }
    throw e;
  }
  redirect(`/workspace/${newId}`);
}

const ERROR_MESSAGES: Record<string, string> = {
  "project-not-found": "项目不存在或无访问权限。",
  "project-cap-reached": `已达项目数上限（${MAX_PROJECTS_PER_USER} 个）。请先删除一些项目再创建。`,
  "review-not-found": "审核记录不存在或无访问权限。",
};

type ReviewRow = {
  id: string;
  url: string;
  report: ReviewReport;
  created_at: string;
};

function scoreColor(score: number): string {
  if (score >= 8) return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (score >= 5) return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-red-50 text-red-700 border-red-200";
}

function formatRelative(iso: string): string {
  const diffMin = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (diffMin < 1) return "刚刚";
  if (diffMin < 60) return `${diffMin} 分钟前`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH} 小时前`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 30) return `${diffD} 天前`;
  return iso.slice(0, 10);
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: projects }, { data: reviews }, usage] = await Promise.all([
    supabase
      .from("projects")
      .select("id, name, initial_prompt, current_stage, done, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false }),
    supabase
      .from("reviews")
      .select("id, url, report, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    getUserUsage(user.id),
  ]);

  const projectRows = (projects ?? []) as Pick<
    ProjectRow,
    "id" | "name" | "initial_prompt" | "current_stage" | "done" | "updated_at"
  >[];
  const reviewRows = (reviews ?? []) as ReviewRow[];

  const callsRatio = usage.total_calls / MAX_API_CALLS_PER_USER;
  const reviewsRatio = usage.total_reviews / MAX_REVIEWS_PER_USER;
  const projectsRatio = projectRows.length / MAX_PROJECTS_PER_USER;

  function usageClass(ratio: number) {
    if (ratio >= 1) return "text-red-600 font-medium";
    if (ratio >= 0.8) return "text-amber-600 font-medium";
    return "text-zinc-500";
  }

  const errorBanner = searchParams.error
    ? ERROR_MESSAGES[searchParams.error] ?? null
    : null;

  return (
    <main className="min-h-screen p-6 md:p-10 space-y-8">
      <header className="space-y-3 max-w-5xl mx-auto w-full">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900"
        >
          <ArrowLeft size={14} />
          主页
        </Link>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">Dashboard</h1>
            <p className="text-xs text-zinc-500">
              <span className={clsx(usageClass(callsRatio))}>
                已用 {usage.total_calls}/{MAX_API_CALLS_PER_USER} 调用
              </span>
              <span className="text-zinc-300 mx-2">·</span>
              <span className={clsx(usageClass(reviewsRatio))}>
                {usage.total_reviews}/{MAX_REVIEWS_PER_USER} 审核
              </span>
              <span className="text-zinc-300 mx-2">·</span>
              <span className={clsx(usageClass(projectsRatio))}>
                {projectRows.length}/{MAX_PROJECTS_PER_USER} 项目
              </span>
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-zinc-500">{user.email}</span>
            <form action={signOut}>
              <button
                type="submit"
                className="inline-flex items-center gap-1 rounded-full border border-zinc-300 bg-white px-3 py-1 text-zinc-700 hover:bg-zinc-100 transition-colors"
              >
                <LogOut size={12} />
                退出
              </button>
            </form>
          </div>
        </div>
      </header>

      {errorBanner && (
        <div className="max-w-5xl mx-auto w-full flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-800">
          <AlertCircle size={16} strokeWidth={2.25} className="mt-0.5 shrink-0" />
          <span>{errorBanner}</span>
        </div>
      )}

      <section className="max-w-5xl mx-auto w-full space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm uppercase opacity-50 tracking-wide">Projects</h2>
          <form action={newProjectAction}>
            <button
              type="submit"
              className="inline-flex items-center gap-1 rounded-full bg-gradient-brand px-3.5 py-1.5 text-sm text-white font-medium hover:opacity-90 transition-opacity"
            >
              <Plus size={14} />
              新建项目
            </button>
          </form>
        </div>
        {projectRows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-10 text-center">
            <p className="text-sm text-zinc-500">还没有项目。</p>
            <form action={newProjectAction} className="mt-4 inline-block">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-full bg-gradient-brand px-4 py-2 text-sm text-white font-medium hover:opacity-90 transition-opacity"
              >
                <Plus size={14} />
                创建第一个项目
              </button>
            </form>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projectRows.map((p) => (
              <ProjectCard
                key={p.id}
                id={p.id}
                name={p.name}
                initialPrompt={p.initial_prompt}
                currentStage={p.current_stage}
                done={p.done}
                updatedAt={p.updated_at}
              />
            ))}
          </div>
        )}
      </section>

      <section className="max-w-5xl mx-auto w-full space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm uppercase opacity-50 tracking-wide">Reviews</h2>
          <Link
            href="/audit/new"
            className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-3.5 py-1.5 text-sm text-amber-700 font-medium hover:bg-amber-100 transition-colors"
          >
            <ShieldCheck size={14} />
            新建审核
          </Link>
        </div>
        {reviewRows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-10 text-center">
            <p className="text-sm text-zinc-500">还没有审核记录。</p>
            <Link
              href="/audit/new"
              className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-700 font-medium hover:bg-amber-100 transition-colors"
            >
              <ShieldCheck size={14} />
              开始第一次审核
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {reviewRows.map((r) => (
              <Link
                key={r.id}
                href={`/audit/${r.id}`}
                className="group block rounded-2xl border border-zinc-200 bg-white p-4 hover:border-zinc-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-4">
                  <span
                    className={clsx(
                      "inline-flex h-12 w-12 items-center justify-center rounded-xl border font-semibold text-sm",
                      scoreColor(r.report.overall_score),
                    )}
                  >
                    {r.report.overall_score}
                  </span>
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <p className="text-sm font-medium text-zinc-900 truncate flex items-center gap-1">
                      {r.url}
                      <ExternalLink
                        size={12}
                        className="text-zinc-300 group-hover:text-zinc-500 transition-colors shrink-0"
                      />
                    </p>
                    <p className="text-xs text-zinc-400">{formatRelative(r.created_at)}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
