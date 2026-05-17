"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Home, Sparkles } from "lucide-react";
import type { AgentStage } from "@/lib/agents";
import { AGENT_META, BUILD_STAGES } from "@/lib/agents";
import { AgentProgressBar } from "@/components/AgentProgressBar";
import { ChatPanel, type ChatMessage } from "@/components/ChatPanel";
import { PreviewPane } from "@/components/PreviewPane";

const FAKE_RESPONSES: Record<AgentStage, string> = {
  research: `目标用户：希望快速展示作品的独立设计师 / 前端工程师。
核心功能：
- Hero 区：个人介绍 + 一句话价值主张
- 作品集网格：3–6 个项目卡片
- 关于我：背景与技能标签
- 联系方式：邮箱 + 社交链接
风格建议：浅色底 + 单一强调色（建议草绿/翠绿渐变），克制留白，无花哨动效。
注意事项：移动端必须可读；首屏 1 秒内出文字。`,
  architecture: `{
  "sections": ["hero", "works", "about", "contact"],
  "navigation": ["首页", "作品", "关于", "联系"],
  "color_scheme": {
    "primary": "#16a34a",
    "secondary": "#65a30d",
    "background": "#ffffff",
    "text": "#18181b"
  },
  "style": "现代极简，浅色底配翠绿强调色，强调留白与排版层级"
}`,
  code: `已生成可运行的 HTML（已渲染到右侧预览）。要不要再调整配色 / 文案？`,
  review: "审核报告（占位，本阶段在 demo 流程中不触发）。",
};

const SAMPLE_HTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Lin · Portfolio</title>
<script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-white text-zinc-900 font-sans antialiased">
  <nav class="max-w-5xl mx-auto px-6 py-5 flex justify-between items-center">
    <span class="font-semibold tracking-tight">Lin</span>
    <div class="text-sm flex gap-6 text-zinc-500">
      <a href="#works" class="hover:text-zinc-900">作品</a>
      <a href="#about" class="hover:text-zinc-900">关于</a>
      <a href="#contact" class="hover:text-zinc-900">联系</a>
    </div>
  </nav>
  <main class="max-w-5xl mx-auto px-6">
    <section class="py-20 md:py-28">
      <p class="text-sm font-medium" style="background:linear-gradient(135deg,#84cc16,#22c55e,#14b8a6);-webkit-background-clip:text;background-clip:text;color:transparent;">前端 · 视觉 · 产品</p>
      <h1 class="mt-3 text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05]">你好，我是 Lin。<br/>我把想法做成界面。</h1>
      <p class="mt-6 text-lg text-zinc-600 max-w-2xl">独立设计与前端工程，聚焦产品级 UI、数据可视化与小而稳的工具。这是我近期的一些工作。</p>
      <div class="mt-8 flex gap-3">
        <a href="#works" class="inline-flex items-center px-5 py-2.5 rounded-full text-white text-sm font-medium" style="background:linear-gradient(135deg,#84cc16,#16a34a);">查看作品</a>
        <a href="#contact" class="inline-flex items-center px-5 py-2.5 rounded-full border border-zinc-300 text-sm font-medium hover:bg-zinc-50">联系我</a>
      </div>
    </section>
    <section id="works" class="py-12 border-t border-zinc-100">
      <h2 class="text-2xl font-semibold tracking-tight">作品选编</h2>
      <div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <a class="group block rounded-2xl overflow-hidden border border-zinc-200 hover:shadow-md transition-shadow">
          <img src="https://placehold.co/600x400/ecfccb/65a30d?text=Project+01" class="w-full h-44 object-cover" />
          <div class="p-4"><div class="text-sm font-medium">数据仪表盘</div><div class="text-xs text-zinc-500 mt-1">B2B · React + D3</div></div>
        </a>
        <a class="group block rounded-2xl overflow-hidden border border-zinc-200 hover:shadow-md transition-shadow">
          <img src="https://placehold.co/600x400/f0fdf4/16a34a?text=Project+02" class="w-full h-44 object-cover" />
          <div class="p-4"><div class="text-sm font-medium">品牌着陆页</div><div class="text-xs text-zinc-500 mt-1">设计稿 → Next.js</div></div>
        </a>
        <a class="group block rounded-2xl overflow-hidden border border-zinc-200 hover:shadow-md transition-shadow">
          <img src="https://placehold.co/600x400/ccfbf1/0d9488?text=Project+03" class="w-full h-44 object-cover" />
          <div class="p-4"><div class="text-sm font-medium">命令行小工具</div><div class="text-xs text-zinc-500 mt-1">Rust · 开源</div></div>
        </a>
      </div>
    </section>
    <section id="about" class="py-12 border-t border-zinc-100 grid md:grid-cols-3 gap-8">
      <h2 class="text-2xl font-semibold tracking-tight">关于</h2>
      <p class="md:col-span-2 text-zinc-600 leading-relaxed">前端 6 年，曾在两家产品型公司带过小团队。喜欢"把复杂的东西做得看起来很简单"。常用：TypeScript、React、Next.js、Figma；最近在玩 Rust 和本地 LLM。</p>
    </section>
    <section id="contact" class="py-12 border-t border-zinc-100">
      <h2 class="text-2xl font-semibold tracking-tight">聊一聊</h2>
      <p class="mt-3 text-zinc-600">合作 / 咨询：<a class="underline">hello@lin.dev</a></p>
    </section>
  </main>
  <footer class="max-w-5xl mx-auto px-6 py-8 text-xs text-zinc-400 border-t border-zinc-100">© Lin · 由 Oiko 生成</footer>
</body>
</html>`;

const INITIAL_USER_PROMPT = "帮我做一个个人作品集网站，简洁现代风，重点突出作品。";

function nextStage(stage: AgentStage): AgentStage | null {
  const idx = BUILD_STAGES.indexOf(stage);
  if (idx === -1 || idx === BUILD_STAGES.length - 1) return null;
  return BUILD_STAGES[idx + 1];
}

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

export default function WorkspacePage({ params }: { params: { id: string } }) {
  const [stage, setStage] = useState<AgentStage>("research");
  const [completed, setCompleted] = useState<AgentStage[]>([]);
  const [done, setDone] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [generatedHtml, setGeneratedHtml] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: makeId(), role: "user", stage: "research", content: INITIAL_USER_PROMPT },
    { id: makeId(), role: "assistant", stage: "research", content: FAKE_RESPONSES.research },
  ]);

  const simulateAgent = useCallback(
    (forStage: AgentStage, content: string, onDone?: () => void) => {
      setThinking(true);
      const thinkingId = makeId();
      setMessages((m) => [
        ...m,
        { id: thinkingId, role: "assistant", stage: forStage, content: "", thinking: true },
      ]);
      setTimeout(() => {
        setMessages((m) =>
          m.map((msg) =>
            msg.id === thinkingId ? { ...msg, content, thinking: false } : msg,
          ),
        );
        setThinking(false);
        onDone?.();
      }, 1400);
    },
    [],
  );

  const handleConfirm = useCallback(() => {
    if (thinking || done) return;
    const next = nextStage(stage);
    setCompleted((c) => (c.includes(stage) ? c : [...c, stage]));
    if (!next) {
      setDone(true);
      return;
    }
    setStage(next);
    simulateAgent(next, FAKE_RESPONSES[next], () => {
      if (next === "code") {
        setGeneratedHtml(SAMPLE_HTML);
      }
    });
  }, [stage, thinking, done, simulateAgent]);

  const handleModify = useCallback(() => {
    // Stay on current stage; UI hint only. No-op for now — input already available.
  }, []);

  const handleSend = useCallback(
    (text: string) => {
      if (thinking) return;
      setMessages((m) => [
        ...m,
        { id: makeId(), role: "user", stage, content: text },
      ]);
      // Fake re-run of current stage agent with a short generic reply
      const reply =
        stage === "code"
          ? "好的，已根据你的反馈再调整了一版（占位：实际接入后会重新生成 HTML）。"
          : `已收到反馈，重新生成 ${AGENT_META[stage].label} 阶段的输出（占位）。`;
      simulateAgent(stage, reply);
    },
    [stage, thinking, simulateAgent],
  );

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
          </div>
        </div>
        <AgentProgressBar currentStage={stage} completedStages={completed} done={done} />
      </header>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 min-h-0">
        <section className="border-b md:border-b-0 md:border-r border-zinc-200 min-h-[60vh] md:min-h-0">
          <ChatPanel
            messages={messages}
            activeStage={stage}
            inputDisabled={thinking}
            actionsDisabled={thinking}
            done={done}
            onSend={handleSend}
            onConfirm={handleConfirm}
            onModify={handleModify}
          />
        </section>
        <section className="min-h-[60vh] md:min-h-0">
          <PreviewPane
            html={generatedHtml}
            generating={thinking && stage === "code"}
          />
        </section>
      </div>
    </main>
  );
}
