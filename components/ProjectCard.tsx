import Link from "next/link";
import clsx from "clsx";
import { CheckCircle2 } from "lucide-react";
import { type AgentStage } from "@/lib/agents";
import { AgentBadge } from "./AgentBadge";
import { DeleteProjectButton } from "./DeleteProjectButton";

type Props = {
  id: string;
  name: string;
  initialPrompt: string | null;
  currentStage: AgentStage;
  done: boolean;
  updatedAt: string;
};

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diffMin = Math.floor((now - then) / 60000);
  if (diffMin < 1) return "刚刚";
  if (diffMin < 60) return `${diffMin} 分钟前`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH} 小时前`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 30) return `${diffD} 天前`;
  return iso.slice(0, 10);
}

export function ProjectCard({
  id,
  name,
  initialPrompt,
  currentStage,
  done,
  updatedAt,
}: Props) {
  const summary =
    initialPrompt && initialPrompt.length > 80
      ? `${initialPrompt.slice(0, 80)}…`
      : initialPrompt || "尚未输入需求描述";

  return (
    <div
      className={clsx(
        "group relative rounded-2xl border border-zinc-200 bg-white p-5 hover:shadow-md hover:border-zinc-300 transition-all",
      )}
    >
      <Link
        href={`/workspace/${id}`}
        className="block space-y-3"
      >
        <h3 className="font-semibold text-zinc-900 truncate pr-8">{name}</h3>
        <p className="text-sm text-zinc-500 line-clamp-2 min-h-[2.5rem]">
          {summary}
        </p>
        <div className="flex items-center justify-between gap-2 pt-1">
          {done ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 text-white px-2.5 py-0.5 text-xs font-medium">
              <CheckCircle2 size={12} strokeWidth={2.5} />
              已完成
            </span>
          ) : (
            <AgentBadge stage={currentStage} size="sm" />
          )}
          <span className="text-xs text-zinc-400">{formatRelative(updatedAt)}</span>
        </div>
      </Link>
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <DeleteProjectButton projectId={id} projectName={name} />
      </div>
    </div>
  );
}
