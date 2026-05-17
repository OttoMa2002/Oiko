"use client";

import clsx from "clsx";
import { ChevronDown, Code2 } from "lucide-react";
import type { AgentStage } from "@/lib/agents";
import { AGENT_META } from "@/lib/agents";
import { AgentBadge } from "./AgentBadge";

type Props = {
  role: "user" | "assistant";
  stage: AgentStage;
  content: string;
  thinking?: boolean;
};

const CODE_COLLAPSE_THRESHOLD = 500;

export function MessageBubble({ role, stage, content, thinking }: Props) {
  if (role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-zinc-900 text-white px-4 py-2.5 text-sm whitespace-pre-wrap shadow-sm">
          {content}
        </div>
      </div>
    );
  }

  const meta = AGENT_META[stage];
  const isLargeCode =
    stage === "code" && !thinking && content.length > CODE_COLLAPSE_THRESHOLD;

  if (isLargeCode) {
    const lineCount = content.split("\n").length;
    const kb = (content.length / 1024).toFixed(1);

    return (
      <div className="flex flex-col items-start gap-1.5 w-full">
        <AgentBadge stage={stage} size="sm" />
        <details
          className={clsx(
            "group max-w-[92%] w-full rounded-2xl rounded-tl-sm bg-white border shadow-sm",
            meta.classes.chipBorder,
          )}
        >
          <summary className="cursor-pointer list-none flex items-center justify-between gap-3 px-4 py-3 text-sm hover:bg-zinc-50 rounded-2xl rounded-tl-sm group-open:rounded-b-none transition-colors">
            <span className="flex items-center gap-2 text-zinc-700 min-w-0">
              <Code2 size={14} strokeWidth={2.25} className={meta.classes.accentText} />
              <span className="font-medium">已生成 HTML</span>
              <span className="text-zinc-400 truncate">
                · {lineCount} 行 · {kb} KB
              </span>
            </span>
            <ChevronDown
              size={14}
              strokeWidth={2.25}
              className="text-zinc-400 transition-transform duration-200 group-open:rotate-180 shrink-0"
            />
          </summary>
          <div className="border-t border-zinc-100 max-h-80 overflow-auto">
            <pre className="text-xs font-mono whitespace-pre-wrap break-all text-zinc-700 px-4 py-3 leading-relaxed">
              {content}
            </pre>
          </div>
        </details>
        <p className="text-xs text-zinc-400 pl-1">→ 右侧预览查看渲染效果</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-1.5">
      <AgentBadge stage={stage} size="sm" />
      <div
        className={clsx(
          "max-w-[92%] rounded-2xl rounded-tl-sm bg-white border px-4 py-3 text-sm whitespace-pre-wrap shadow-sm",
          meta.classes.chipBorder,
        )}
      >
        {thinking ? (
          <span className="inline-flex items-center gap-1 text-zinc-400">
            <span className={clsx("h-1.5 w-1.5 rounded-full animate-bounce", meta.classes.dot)} style={{ animationDelay: "0ms" }} />
            <span className={clsx("h-1.5 w-1.5 rounded-full animate-bounce", meta.classes.dot)} style={{ animationDelay: "120ms" }} />
            <span className={clsx("h-1.5 w-1.5 rounded-full animate-bounce", meta.classes.dot)} style={{ animationDelay: "240ms" }} />
            <span className="ml-2">思考中…</span>
          </span>
        ) : (
          content
        )}
      </div>
    </div>
  );
}
