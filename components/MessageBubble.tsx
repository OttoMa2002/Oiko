"use client";

import clsx from "clsx";
import type { AgentStage } from "@/lib/agents";
import { AGENT_META } from "@/lib/agents";
import { AgentBadge } from "./AgentBadge";

type Props = {
  role: "user" | "assistant";
  stage: AgentStage;
  content: string;
  thinking?: boolean;
};

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
