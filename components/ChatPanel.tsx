"use client";

import { Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import type { AgentStage } from "@/lib/agents";
import { AGENT_META } from "@/lib/agents";
import type { ChatMessage } from "@/lib/types";
import { MessageBubble } from "./MessageBubble";
import { StageActions } from "./StageActions";

export type { ChatMessage };

// Per-stage one-line hint shown beneath the agent label. Purpose: head off
// the "I'm on code stage but my message is actually architecture-level"
// trap — without this, users dump natural-language structural changes at
// the code agent and get partial-HTML responses (see the amber warning
// bubble in MessageBubble for the downstream consequence).
const STAGE_HINTS: Record<AgentStage, string> = {
  research: "这一步定义网站方向：目标用户、核心功能、整体风格",
  architecture: "这一步规划页面骨架：sections、导航、配色方案",
  code: "改内容 / 文本 / 细节留这里；改方向 / 结构 / 配色请点上方进度条切回上游 Agent",
  review: "",
};

type Props = {
  messages: ChatMessage[];
  activeStage: AgentStage;
  inputDisabled: boolean;
  actionsDisabled: boolean;
  showActions: boolean;
  done: boolean;
  onSend: (text: string) => void;
  onConfirm: () => void;
};

export function ChatPanel({
  messages,
  activeStage,
  inputDisabled,
  actionsDisabled,
  showActions,
  done,
  onSend,
  onConfirm,
}: Props) {
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || inputDisabled) return;
    onSend(text);
    setDraft("");
  }

  const meta = AGENT_META[activeStage];

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="px-4 py-3 border-b border-zinc-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <span className={clsx("h-2 w-2 rounded-full", meta.classes.dot)} />
            <span className="font-medium text-zinc-900">{meta.label} Agent</span>
            <span className="text-zinc-400">· {meta.tagline}</span>
          </div>
          {done && (
            <span className="text-xs text-zinc-500">流程完成</span>
          )}
        </div>
        {!done && STAGE_HINTS[activeStage] && (
          <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">
            {STAGE_HINTS[activeStage]}
          </p>
        )}
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
      >
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center text-sm text-zinc-400">
            <div className="max-w-xs space-y-2">
              <p className="font-medium text-zinc-600">还没开始 👋</p>
              <p>在下方输入你想构建的网站描述，调研 Agent 会先帮你分析需求。</p>
            </div>
          </div>
        ) : (
          messages.map((m) => (
            <MessageBubble
              key={m.id}
              role={m.role}
              stage={m.stage}
              content={m.content}
              thinking={m.thinking}
            />
          ))
        )}
      </div>

      {!done && showActions && (
        <div className="px-4 py-2 border-t border-zinc-200">
          <StageActions
            stage={activeStage}
            disabled={actionsDisabled}
            onConfirm={onConfirm}
          />
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        data-no-progress
        className="p-3 border-t border-zinc-200 bg-zinc-50"
      >
        <div
          className={clsx(
            "flex items-end gap-2 rounded-2xl border bg-white px-3 py-2 transition-shadow",
            "focus-within:ring-2 focus-within:ring-zinc-900/10 focus-within:border-zinc-300",
            inputDisabled && "opacity-60",
          )}
        >
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            disabled={inputDisabled}
            placeholder={
              done
                ? "网站已完成。可继续提出迭代意见…"
                : `向 ${meta.label} Agent 说点什么…(Cmd/Ctrl+Enter 发送)`
            }
            rows={2}
            className="flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-zinc-400 disabled:cursor-not-allowed"
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                e.preventDefault();
                handleSubmit(e as unknown as React.FormEvent);
              }
            }}
          />
          <button
            type="submit"
            disabled={inputDisabled || !draft.trim()}
            className={clsx(
              "h-8 w-8 rounded-full flex items-center justify-center text-white transition-opacity",
              "bg-gradient-brand",
              (inputDisabled || !draft.trim()) && "opacity-40 cursor-not-allowed",
            )}
            aria-label="发送"
          >
            <Send size={14} strokeWidth={2.5} />
          </button>
        </div>
      </form>
    </div>
  );
}
