import Link from "next/link";
import { ArrowRight, Code2, LayoutGrid, Search, ShieldCheck } from "lucide-react";

const AGENTS = [
  { icon: Search, label: "调研", desc: "理解需求", color: "text-cyan-600 bg-cyan-50 border-cyan-200" },
  { icon: LayoutGrid, label: "架构", desc: "搭骨架", color: "text-blue-600 bg-blue-50 border-blue-200" },
  { icon: Code2, label: "代码", desc: "生成 HTML", color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  { icon: ShieldCheck, label: "审核", desc: "结构化反馈", color: "text-amber-600 bg-amber-50 border-amber-200" },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <nav className="max-w-5xl w-full mx-auto px-6 py-5 flex items-center justify-between">
        <span className="font-bold tracking-tight text-3xl">
          <span className="text-gradient-brand">Oiko</span>
        </span>
        <div className="flex items-center gap-5 text-sm text-zinc-500">
          <Link href="/login" className="hover:text-zinc-900">登录</Link>
          <Link
            href="/signup"
            className="inline-flex items-center gap-1 rounded-full px-4 py-1.5 text-white text-sm font-medium bg-gradient-brand hover:opacity-90 transition-opacity"
          >
            开始构建
            <ArrowRight size={14} />
          </Link>
        </div>
      </nav>

      <section className="flex-1 max-w-5xl w-full mx-auto px-6 py-16 md:py-24">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          多 Agent 协作 · 端到端建站
        </span>

        <h1 className="mt-6 text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05] text-balance">
          描述一个想法，
          <br />
          看 <span className="text-gradient-brand">几个 AI Agent</span> 帮你把它做成网站。
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-zinc-600 leading-relaxed">
          Oiko 把网站生成拆成 <span className="text-zinc-900 font-medium">调研 → 架构 → 代码</span>{" "}
          三个阶段，每个阶段由一个独立 Agent 负责，全程可见、可修改、可确认。
          再加一个审核 Agent，能对任意网站做结构化诊断。
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href="/workspace/demo"
            className="inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-white text-sm font-medium bg-gradient-brand hover:opacity-90 transition-opacity"
          >
            体验工作台 demo
            <ArrowRight size={14} />
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-full border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 transition-colors"
          >
            进入 Dashboard
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-3">
          {AGENTS.map((a) => {
            const Icon = a.icon;
            return (
              <div
                key={a.label}
                className={`rounded-2xl border ${a.color.split(" ").filter(c => c.startsWith("border-") || c.startsWith("bg-")).join(" ")} p-4`}
              >
                <div className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${a.color.split(" ").filter(c => c.startsWith("text-") || c.startsWith("bg-")).join(" ")}`}>
                  <Icon size={16} strokeWidth={2.25} />
                </div>
                <div className="mt-3 text-sm font-semibold text-zinc-900">{a.label} Agent</div>
                <div className="mt-0.5 text-xs text-zinc-500">{a.desc}</div>
              </div>
            );
          })}
        </div>

        <p className="mt-12 text-xs text-zinc-400">
          当前为脚手架版本：Auth、持久化、Agent 运行时尚未接入，工作台演示使用本地假数据。
        </p>
      </section>
    </main>
  );
}
