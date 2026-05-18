import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-white">
      <aside className="hidden md:flex flex-col justify-between p-10 lg:p-12 bg-gradient-brand text-white">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-3xl font-bold tracking-tight hover:opacity-90 transition-opacity"
          >
            Oiko
          </Link>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-sm">
            <Sparkles size={12} />
            AI Web Builder
          </span>
        </div>

        <div className="space-y-5 max-w-md">
          <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight leading-[1.15]">
            描述一个想法，看几个 AI Agent 把它做成网站。
          </h2>
          <p className="text-white/85 leading-relaxed">
            调研 → 架构 → 代码，三个阶段对你可见、可改、可确认。
            再加一个审核 Agent，能给任意网站做结构化诊断。
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-4 text-sm text-white/75">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
              <span>多 Agent 协作</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
              <span>端到端建站</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
              <span>过程透明</span>
            </div>
          </div>
          <p className="text-xs text-white/60">© Oiko · 挑战赛 Demo</p>
        </div>
      </aside>

      <main className="flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <Link
            href="/"
            className="md:hidden inline-block mb-8 text-2xl font-bold tracking-tight text-gradient-brand"
          >
            Oiko
          </Link>
          {children}
        </div>
      </main>
    </div>
  );
}
