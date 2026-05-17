"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Home, Sparkles } from "lucide-react";
import type { AgentStage } from "@/lib/agents";
import { BUILD_STAGES, MAX_ITERATIONS_PER_PROJECT } from "@/lib/agents";
import { extractHtml } from "@/lib/extractHtml";
import { AgentProgressBar } from "@/components/AgentProgressBar";
import { ChatPanel, type ChatMessage } from "@/components/ChatPanel";
import { PreviewPane } from "@/components/PreviewPane";

type Outputs = Partial<Record<AgentStage, string>>;

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

function nextStage(stage: AgentStage): AgentStage | null {
  const idx = BUILD_STAGES.indexOf(stage);
  if (idx === -1 || idx === BUILD_STAGES.length - 1) return null;
  return BUILD_STAGES[idx + 1];
}

export default function WorkspacePage({ params }: { params: { id: string } }) {
  const [stage, setStage] = useState<AgentStage>("research");
  const [completed, setCompleted] = useState<AgentStage[]>([]);
  const [done, setDone] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [generatedHtml, setGeneratedHtml] = useState<string | null>(null);
  const [iterations, setIterations] = useState(0);
  const [initialPrompt, setInitialPrompt] = useState<string | null>(null);
  const [outputs, setOutputs] = useState<Outputs>({});
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const capped = iterations >= MAX_ITERATIONS_PER_PROJECT;

  const callAgent = useCallback(
    async (forStage: AgentStage, prompt: string, userFeedback?: string) => {
      setThinking(true);
      const thinkingId = makeId();
      setMessages((m) => [
        ...m,
        { id: thinkingId, role: "assistant", stage: forStage, content: "", thinking: true },
      ]);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            stage: forStage,
            initialPrompt: prompt,
            outputs,
            userFeedback,
          }),
        });
        const data = await res.json();

        if (!res.ok) {
          const errMsg = (data && data.error) || `请求失败 (${res.status})`;
          setMessages((m) =>
            m.map((msg) =>
              msg.id === thinkingId
                ? { ...msg, content: `⚠️ ${errMsg}`, thinking: false }
                : msg,
            ),
          );
          return;
        }

        const content = String(data.content ?? "");
        setMessages((m) =>
          m.map((msg) =>
            msg.id === thinkingId ? { ...msg, content, thinking: false } : msg,
          ),
        );
        setOutputs((o) => ({ ...o, [forStage]: content }));
        if (forStage === "code") {
          setGeneratedHtml(extractHtml(content));
        }
        setIterations((n) => n + 1);
      } catch (e) {
        const errMsg = e instanceof Error ? e.message : "网络错误";
        setMessages((m) =>
          m.map((msg) =>
            msg.id === thinkingId
              ? { ...msg, content: `⚠️ ${errMsg}`, thinking: false }
              : msg,
          ),
        );
      } finally {
        setThinking(false);
      }
    },
    [outputs],
  );

  const handleSend = useCallback(
    (text: string) => {
      if (thinking || capped) return;

      if (!initialPrompt) {
        setInitialPrompt(text);
        setMessages((m) => [...m, { id: makeId(), role: "user", stage, content: text }]);
        callAgent(stage, text);
        return;
      }

      setMessages((m) => [...m, { id: makeId(), role: "user", stage, content: text }]);
      callAgent(stage, initialPrompt, text);
    },
    [thinking, capped, initialPrompt, stage, callAgent],
  );

  const handleConfirm = useCallback(() => {
    if (thinking || done || capped) return;
    if (!initialPrompt || !outputs[stage]) return;

    const next = nextStage(stage);
    setCompleted((c) => (c.includes(stage) ? c : [...c, stage]));
    if (!next) {
      setDone(true);
      return;
    }
    setStage(next);
    callAgent(next, initialPrompt);
  }, [thinking, done, capped, initialPrompt, outputs, stage, callAgent]);

  const handleModify = useCallback(() => {
    // ChatPanel handles textarea focus internally.
  }, []);

  const showActions = Boolean(outputs[stage]) && !thinking;

  return (
    <main className="min-h-screen flex flex-col bg-zinc-50">
      <header className="px-4 md:px-6 py-4 border-b border-zinc-200 bg-white">
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-3 text-sm text-zinc-500">
            <Link
              href="/"
              className="inline-flex items-center gap-1 hover:text-zinc-900"
            >
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
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <Sparkles size={12} />
            <span>项目 · </span>
            <span className="font-mono text-zinc-600">{params.id}</span>
            <span className="text-zinc-300">·</span>
            <span className={capped ? "text-amber-600 font-medium" : ""}>
              {iterations}/{MAX_ITERATIONS_PER_PROJECT} 轮
            </span>
          </div>
        </div>
        <AgentProgressBar currentStage={stage} completedStages={completed} done={done} />
      </header>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 min-h-0">
        <section className="border-b md:border-b-0 md:border-r border-zinc-200 min-h-[60vh] md:min-h-0">
          <ChatPanel
            messages={messages}
            activeStage={stage}
            inputDisabled={thinking || capped}
            actionsDisabled={thinking || capped}
            showActions={showActions}
            done={done}
            onSend={handleSend}
            onConfirm={handleConfirm}
            onModify={handleModify}
          />
        </section>
        <section className="min-h-[60vh] md:min-h-0">
          <PreviewPane html={generatedHtml} generating={thinking && stage === "code"} />
        </section>
      </div>
    </main>
  );
}
