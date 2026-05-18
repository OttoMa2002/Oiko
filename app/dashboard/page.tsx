import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertCircle, ArrowLeft, LogOut, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/actions/auth";
import { createProject } from "@/app/actions/projects";
import { ProjectCard } from "@/components/ProjectCard";
import type { ProjectRow } from "@/lib/types";

async function newProjectAction() {
  "use server";
  const { id } = await createProject();
  redirect(`/workspace/${id}`);
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

  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, initial_prompt, current_stage, done, updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  const rows = (projects ?? []) as Pick<
    ProjectRow,
    "id" | "name" | "initial_prompt" | "current_stage" | "done" | "updated_at"
  >[];

  const errorBanner =
    searchParams.error === "project-not-found"
      ? "项目不存在或无访问权限。"
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
          <h1 className="text-2xl font-semibold">Dashboard</h1>
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
            <form action={newProjectAction}>
              <button
                type="submit"
                className="inline-flex items-center gap-1 rounded-full bg-gradient-brand px-3.5 py-1.5 text-white font-medium hover:opacity-90 transition-opacity"
              >
                <Plus size={14} />
                新建项目
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
        <h2 className="text-sm uppercase opacity-50 tracking-wide">Projects</h2>
        {rows.length === 0 ? (
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
            {rows.map((p) => (
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
        <h2 className="text-sm uppercase opacity-50 tracking-wide">Reviews</h2>
        <p className="text-sm text-zinc-500">审核功能 Round 3 上线。</p>
      </section>
    </main>
  );
}
