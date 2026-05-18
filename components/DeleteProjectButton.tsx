"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteProject } from "@/app/actions/projects";

type Props = {
  projectId: string;
  projectName: string;
};

export function DeleteProjectButton({ projectId, projectName }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (isPending) return;
    if (!window.confirm(`确定删除 "${projectName}"？此操作不可恢复。`)) return;
    startTransition(async () => {
      try {
        await deleteProject(projectId);
      } catch (e) {
        window.alert(e instanceof Error ? e.message : "删除失败");
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-label={`删除项目 ${projectName}`}
      className="inline-flex h-7 w-7 items-center justify-center rounded-full text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
    >
      <Trash2 size={14} />
    </button>
  );
}
