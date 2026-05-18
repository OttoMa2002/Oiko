import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  Camera,
  Check,
  Code2,
  Coffee,
  LayoutGrid,
  LogOut,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/actions/auth";
import { startNewProjectAction } from "@/app/actions/projects";

const AGENTS = [
  { icon: Search, label: "调研", desc: "理解需求", color: "text-cyan-600 bg-cyan-50 border-cyan-200" },
  { icon: LayoutGrid, label: "架构", desc: "搭骨架", color: "text-blue-600 bg-blue-50 border-blue-200" },
  { icon: Code2, label: "代码", desc: "生成 HTML", color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  { icon: ShieldCheck, label: "审核", desc: "结构化反馈", color: "text-amber-600 bg-amber-50 border-amber-200" },
];

const EXAMPLES = [
  {
    icon: Camera,
    badge: "个人作品集",
    title: "独立摄影师作品集",
    prompt:
      "为一位独立摄影师设计极简风格作品集主页：黑白调、大图叠加、包含个人介绍、作品分类（人像/风景/街拍）、联系方式。氛围冷静、专业。",
  },
  {
    icon: Sparkles,
    badge: "产品落地页",
    title: "AI 写作工具 Inkflow",
    prompt:
      "为一款叫 'Inkflow' 的 AI 写作工具设计发布页：hero 区标语 '让创意不再被空白页面卡住'、3 个核心特性卡片、用户评价、定价表、CTA 免费试用。现代简洁、温暖色调。",
  },
  {
    icon: Briefcase,
    badge: "活动页",
    title: "AI Coding Summit 2026",
    prompt:
      "为一场叫 'AI Coding Summit 2026' 的线下开发者大会设计主页：日期地点、4 位嘉宾介绍、议程时间表、在线报名 CTA。信息密度高、调性清新专业。",
  },
  {
    icon: Coffee,
    badge: "企业官网",
    title: "Verdant Coffee 咖啡店",
    prompt:
      "为一家叫 'Verdant Coffee' 的精品独立咖啡店设计品牌首页：暖色调（米白加深绿）、品牌故事、精选 3 款豆子、门店地址、Instagram 链接。强调手工感与可持续。",
  },
];

const STRENGTHS = ["落地页", "作品集", "活动页", "品牌介绍", "产品发布页", "博客首屏"];

export default async function LandingPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen flex flex-col">
      <nav className="max-w-5xl w-full mx-auto px-6 py-5 flex items-center justify-between">
        <span className="font-bold tracking-tight text-3xl">
          <span className="text-gradient-brand">Oiko</span>
        </span>
        <div className="flex items-center gap-5 text-sm text-zinc-500">
          {user ? (
            <>
              <span className="text-zinc-500 hidden sm:inline">{user.email}</span>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1 rounded-full px-4 py-1.5 text-white text-sm font-medium bg-gradient-brand hover:opacity-90 transition-opacity"
              >
                进入 Dashboard
                <ArrowRight size={14} />
              </Link>
              <form action={signOut}>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1 text-zinc-500 hover:text-zinc-900"
                >
                  <LogOut size={12} />
                  退出
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-zinc-900">登录</Link>
              <Link
                href="/signup"
                className="inline-flex items-center gap-1 rounded-full px-4 py-1.5 text-white text-sm font-medium bg-gradient-brand hover:opacity-90 transition-opacity"
              >
                开始构建
                <ArrowRight size={14} />
              </Link>
            </>
          )}
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
          {user ? (
            <>
              <form action={startNewProjectAction}>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-white text-sm font-medium bg-gradient-brand hover:opacity-90 transition-opacity"
                >
                  新建空白项目
                  <ArrowRight size={14} />
                </button>
              </form>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 rounded-full border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 transition-colors"
              >
                进入 Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/signup"
                className="inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-white text-sm font-medium bg-gradient-brand hover:opacity-90 transition-opacity"
              >
                免费注册体验
                <ArrowRight size={14} />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 rounded-full border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 transition-colors"
              >
                登录
              </Link>
            </>
          )}
        </div>

        <div className="mt-16">
          <div className="flex items-end justify-between flex-wrap gap-2 mb-4">
            <h2 className="text-sm uppercase opacity-50 tracking-wide">试试以下方向</h2>
            <span className="text-xs text-zinc-400">
              {user ? "点击任意卡片直接创建项目并预填" : "点击任意卡片注册后即可体验"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {EXAMPLES.map((ex) => {
              const Icon = ex.icon;
              const cardInner = (
                <div className="flex items-start gap-3 text-left">
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700 group-hover:bg-emerald-50 group-hover:text-emerald-700 transition-colors">
                    <Icon size={16} strokeWidth={2.25} />
                  </span>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase tracking-wider text-zinc-400">{ex.badge}</span>
                      <span className="h-1 w-1 rounded-full bg-zinc-300" />
                      <span className="text-sm font-semibold text-zinc-900 truncate">{ex.title}</span>
                    </div>
                    <p className="text-xs text-zinc-500 leading-relaxed line-clamp-3">{ex.prompt}</p>
                  </div>
                  <ArrowRight
                    size={14}
                    className="shrink-0 mt-1 text-zinc-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all"
                  />
                </div>
              );
              const cardClass =
                "group block w-full rounded-2xl border border-zinc-200 bg-white p-4 hover:border-emerald-300 hover:shadow-sm transition-all cursor-pointer";

              if (user) {
                return (
                  <form key={ex.badge} action={startNewProjectAction}>
                    <input type="hidden" name="prompt" value={ex.prompt} />
                    <button type="submit" className={cardClass}>
                      {cardInner}
                    </button>
                  </form>
                );
              }
              return (
                <Link key={ex.badge} href="/signup" className={cardClass}>
                  {cardInner}
                </Link>
              );
            })}
          </div>

          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50/50 p-5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 mb-3">
              <Check size={14} strokeWidth={2.5} />
              擅长的场景
            </div>
            <div className="flex flex-wrap gap-2">
              {STRENGTHS.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center rounded-full bg-white border border-emerald-200 px-3 py-1 text-sm text-emerald-700"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16">
          <h2 className="text-sm uppercase opacity-50 tracking-wide mb-4">工作流</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
        </div>
      </section>
    </main>
  );
}