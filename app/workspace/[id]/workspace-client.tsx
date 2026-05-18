"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Home, Sparkles } from "lucide-react";
import type { AgentStage } from "@/lib/agents";
import { BUILD_STAGES, MAX_ITERATIONS_PER_PROJECT } from "@/lib/agents";
import { extractHtml, looksLikeHtml } from "@/lib/extractHtml";
import type { ChatMessage, Outputs } from "@/lib/types";
import { updateProject } from "@/app/actions/projects";
import { AgentProgressBar } from "@/components/AgentProgressBar";
import { ChatPanel } from "@/components/ChatPanel";
import { PreviewPane } from "@/components/PreviewPane";

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

function nextStage(stage: AgentStage): AgentStage | null {
  const idx = BUILD_STAGES.indexOf(stage);
  if (idx === -1 || idx === BUILD_STAGES.length - 1) return null;
  return BUILD_STAGES[idx + 1];
}

/** Matches the auto-generated default name from `createProject` so we only
 *  overwrite when the user hasn't customized the title. */
function isUntitledDefault(name: string): boolean {
  return /^Untitled · \d{4}-\d{2}-\d{2}$/.test(name);
}

export type WorkspaceInitialState = {
  projectId: string;
  projectName: string;
  initialPrompt: string | null;
  outputs: Outputs;
  agentHistory: ChatMessage[];
  generatedHtml: string | null;
  currentStage: AgentStage;
  completedStages: AgentStage[];
  done: boolean;
  iterations: number;
};

export function WorkspaceClient({ initialState }: { initialState: WorkspaceInitialState }) {
  const projectId = initialState.projectId;

  const [stage, setStage] = useState<AgentStage>(initialState.currentStage);
  const [completed, setCompleted] = useState<AgentStage[]>(initialState.completedStages);
  const [done, setDone] = useState(initialState.done);
  const [thinking, setThinking] = useState(false);
  const [generatedHtml, setGeneratedHtml] = useState<string | null>(initialState.generatedHtml);
  const [iterations, setIterations] = useState(initialState.iterations);
  const [initialPrompt, setInitialPrompt] = useState<string | null>(initialState.initialPrompt);
  const [outputs, setOutputs] = useState<Outputs>(initialState.outputs);
  const [messages, setMessages] = useState<ChatMessage[]>(initialState.agentHistory);
  const [projectName, setProjectName] = useState(initialState.projectName);

  // Mirror `messages` so async callbacks (callAgent fetch handlers) can read
  // the latest list without re-binding to a stale closure. Every setMessages
  // call below also updates this ref synchronously — never read `messages`
  // directly inside callAgent / handleSend, always `messagesRef.current`.
  const messagesRef = useRef<ChatMessage[]>(initialState.agentHistory);
  const setMessagesSync = useCallback((next: ChatMessage[]) => {
    messagesRef.current = next;
    setMessages(next);
  }, []);

  const capped = iterations >= MAX_ITERATIONS_PER_PROJECT;

  const persist = useCallback(
    (patch: Parameters<typeof updateProject>[1]) => {
      updateProject(projectId, patch).catch((err) => {
        console.error("Failed to persist project:", err);
      });
    },
    [projectId],
  );

  const callAgent = useCallback(
    async (forStage: AgentStage, prompt: string, userFeedback?: string) => {
      setThinking(true);
      const thinkingId = makeId();
      const thinkingMsg: ChatMessage = {
        id: thinkingId,
        role: "assistant",
        stage: forStage,
        content: "",
        thinking: true,
      };
      const baseMsgs = messagesRef.current;
      const withThinking = [...baseMsgs, thinkingMsg];
      setMessagesSync(withThinking);

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
          const errored = withThinking.map((msg) =>
            msg.id === thinkingId
              ? { ...msg, content: `⚠️ ${errMsg}`, thinking: false }
              : msg,
          );
          setMessagesSync(errored);
          persist({ agentHistory: errored });
          return;
        }

        const content = String(data.content ?? "");
        const newMsgs = withThinking.map((msg) =>
          msg.id === thinkingId ? { ...msg, content, thinking: false } : msg,
        );

        // For the code stage, only treat the response as a real artifact
        // (replace iframe, save into outputs.code) when it actually looks
        // like HTML. Plain conversational replies still flow into the chat
        // but don't overwrite the working preview or pollute next-turn context.
        const newOutputs: Outputs = { ...outputs };
        let newHtml = generatedHtml;
        if (forStage === "code") {
          const extracted = extractHtml(content);
          if (looksLikeHtml(extracted)) {
            newHtml = extracted;
            newOutputs.code = content;
          }
        } else {
          newOutputs[forStage] = content;
        }
        const newIterations = iterations + 1;

        setMessagesSync(newMsgs);
        setOutputs(newOutputs);
        setIterations(newIterations);
        if (newHtml !== generatedHtml) setGeneratedHtml(newHtml);

        persist({
          agentHistory: newMsgs,
          outputs: newOutputs,
          iterations: newIterations,
          generatedHtml: newHtml,
        });

        // Fire-and-forget: after the research agent's first successful
        // response, ask Claude for a concise project title. Only overwrite
        // when the name is still the auto-generated "Untitled · YYYY-MM-DD"
        // default — never clobber a name the user may have personalized.
        if (forStage === "research" && isUntitledDefault(projectName)) {
          fetch("/api/title", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt }),
          })
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
              if (data && typeof data.title === "string" && data.title) {
                setProjectName(data.title);
                persist({ name: data.title });
              }
            })
            .catch(() => {});
        }
      } catch (e) {
        const errMsg = e instanceof Error ? e.message : "网络错误";
        const errored = messagesRef.current.map((msg) =>
          msg.id === thinkingId
            ? { ...msg, content: `⚠️ ${errMsg}`, thinking: false }
            : msg,
        );
        setMessagesSync(errored);
      } finally {
        setThinking(false);
      }
    },
    [outputs, iterations, generatedHtml, persist, setMessagesSync, projectName],
  );

  const handleSend = useCallback(
    (text: string) => {
      if (thinking || capped) return;

      const userMsg: ChatMessage = { id: makeId(), role: "user", stage, content: text };
      const newMsgs = [...messagesRef.current, userMsg];
      setMessagesSync(newMsgs);

      if (!initialPrompt) {
        setInitialPrompt(text);
        persist({ initialPrompt: text, agentHistory: newMsgs });
        callAgent(stage, text);
        return;
      }

      callAgent(stage, initialPrompt, text);
    },
    [thinking, capped, initialPrompt, stage, callAgent, persist, setMessagesSync],
  );

  // Auto-kick: if landing-page example pre-filled initialPrompt at create time
  // (so it's already in initialState) and no agent has run yet, simulate the
  // user submitting that prompt as the first message and trigger the research
  // agent. Guarded by ref so React Strict Mode double-effect can't double-fire.
  const autoKickedRef = useRef(false);
  useEffect(() => {
    if (autoKickedRef.current) return;
    if (initialState.initialPrompt && initialState.agentHistory.length === 0) {
      autoKickedRef.current = true;
      handleSend(initialState.initialPrompt);
    }
  }, [initialState.initialPrompt, initialState.agentHistory.length, handleSend]);

  const handleConfirm = useCallback(() => {
    if (thinking || done || capped) return;
    if (!initialPrompt || !outputs[stage]) return;

    const next = nextStage(stage);
    const newCompleted = completed.includes(stage) ? completed : [...completed, stage];
    setCompleted(newCompleted);

    if (!next) {
      setDone(true);
      persist({ completedStages: newCompleted, done: true });
      return;
    }

    setStage(next);
    persist({ completedStages: newCompleted, currentStage: next });
    callAgent(next, initialPrompt);
  }, [thinking, done, capped, initialPrompt, outputs, stage, completed, callAgent, persist]);

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
            <span className="text-zinc-700 font-medium truncate max-w-[280px]">
              {projectName}
            </span>
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
          />
        </section>
        <section className="min-h-[60vh] md:min-h-0">
          <PreviewPane
            html={generatedHtml}
            projectName={projectName}
            generating={thinking && stage === "code"}
          />
        </section>
      </div>
    </main>
  );
}
