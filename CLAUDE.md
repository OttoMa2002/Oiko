# CLAUDE.md — Oiko: AI-Powered Web Builder

## 项目概述

Oiko 是一个 AI 驱动的网站生成与审核平台，灵感来源于 DeepWisdom 的 Atoms 平台。核心体验是：用户用自然语言描述需求，多个 AI Agent 分工协作，分步骤完成网站生成，过程对用户透明可见。

这是一个挑战赛 Demo 项目，重点展示：
1. 多 Agent 协作的可视化流程（用户能看到每个 Agent 在做什么）
2. 从想法到可用网站的端到端体验
3. 真实交互 + 数据持久化 + 可在线访问

## 技术栈

- **框架**: Next.js 14 (App Router) + TypeScript
- **UI**: React + Tailwind CSS
- **数据库 & Auth**: Supabase (Postgres + Auth)
- **AI**: Claude API (claude-sonnet-4-6)
- **部署**: Vercel
- **网站预览**: iframe sandbox 渲染生成的 HTML

## 核心功能

### 功能一：AI 网站生成（主线）

用户输入自然语言描述 → 4 个 Agent 依次协作 → 输出可预览的完整单页网站。

**Agent 流程：**

1. **调研 Agent** — 分析用户需求，输出目标用户画像、功能建议、风格建议（限 200 字以内）
2. **架构 Agent** — 根据调研结果输出页面结构（JSON 格式：区块划分、导航、配色方案）
3. **代码 Agent** — 生成完整单页 HTML（含内联 CSS + Tailwind CDN，不超过 500 行）
4. **迭代** — 用户可在聊天框输入修改意见，系统判断转给对应 Agent 处理

每个阶段之间有用户确认节点（human-in-the-loop），用户可修改或直接确认进入下一阶段。

### 功能二：AI 网站审核（延展功能）

用户输入 URL + 上下文信息 → 服务端抓取网页内容 → 审核 Agent 输出结构化改进建议。

**审核 Agent** — 分析网站的结构/布局、内容质量、UX 体验、SEO 基础，输出结构化报告。

用户需提供的上下文：网站方向、目标用户群体、希望改进的方向。

URL 抓取在 Next.js API route 服务端执行（规避跨域）。若目标网站反爬或内容过大，fallback 提示用户截图上传。

### 用户系统

- Supabase Auth 处理注册登录
- 支持邮箱密码注册 + Google OAuth
- 用户可在 Dashboard 查看历史项目和审核记录

## 数据库设计

```sql
-- projects 表：存储用户的网站生成项目
projects (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users not null,
    name text not null,
    description text,
    generated_html text,
    agent_history jsonb default '[]',
    status text default 'draft',  -- draft / completed
    created_at timestamptz default now(),
    updated_at timestamptz default now()
)

-- reviews 表：存储网站审核记录
reviews (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users not null,
    url text not null,
    context jsonb,
    report jsonb,
    created_at timestamptz default now()
)
```

## 核心 UI 布局

### 项目工作台页面（最重要的页面）

```
┌─────────────────────────────────────────────────┐
│  顶部：Agent 进度条（调研 → 架构 → 代码 → 完成）    │
├──────────────────────┬──────────────────────────┤
│                      │                          │
│   左侧：聊天面板       │   右侧：预览面板           │
│   - Agent 头像/状态    │   - iframe 渲染           │
│   - 对话消息          │   - 生成的 HTML 实时预览    │
│   - 用户输入框        │                           │
│   - 确认/修改按钮      │                          │
│                      │                          │
├──────────────────────┴──────────────────────────┤
│  底部状态栏（可选）                                │
└─────────────────────────────────────────────────┘
```

### 其他页面

- **首页 Landing**: 产品介绍 + CTA 按钮
- **登录/注册页**: Supabase Auth UI
- **Dashboard**: 项目列表 + 审核记录 + 新建入口

## Agent System Prompt 设计

### 调研 Agent
```
你是 Oiko 平台的调研 Agent。用户会描述他们想要构建的网站。
你的任务是分析需求并输出简要调研摘要，严格控制在 200 字以内。

输出格式：
- 目标用户：（一句话）
- 核心功能：（3-5 个要点）
- 风格建议：（配色方向 + 整体调性）
- 注意事项：（1-2 条）

不要输出代码。不要过度分析。简洁、精准、可执行。
```

### 架构 Agent
```
你是 Oiko 平台的架构 Agent。根据调研摘要，输出页面结构方案。

严格按以下 JSON 格式输出，不要附加其他内容：
{
  "sections": ["hero", "about", "features", "contact"],
  "navigation": ["首页", "关于", "功能", "联系"],
  "color_scheme": {
    "primary": "#hex",
    "secondary": "#hex",
    "background": "#hex",
    "text": "#hex"
  },
  "style": "简要风格描述"
}
```

### 代码 Agent
```
你是 Oiko 平台的代码 Agent。根据架构方案生成完整的单页 HTML 网站。

严格要求：
1. 输出完整可运行的 HTML 文件，包含 <!DOCTYPE html>
2. 使用 Tailwind CSS CDN（<script src="https://cdn.tailwindcss.com"></script>）
3. 响应式设计，移动端适配
4. 总行数不超过 500 行
5. 不使用外部 JS 框架
6. 内联所有样式，不引用外部 CSS 文件（Tailwind CDN 除外）
7. 图片使用 placeholder（https://placehold.co/）
8. 只输出 HTML 代码，不要解释

生成一个视觉精致、结构清晰的现代网站。注重排版、间距和配色的协调。
```

### 审核 Agent
```
你是 Oiko 平台的审核 Agent。用户会提供一个网站的 HTML 内容和上下文信息。
分析网站并输出结构化审核报告。

输出格式（JSON）：
{
  "overall_score": 1-10,
  "structure": { "score": 1-10, "feedback": "..." },
  "content": { "score": 1-10, "feedback": "..." },
  "ux": { "score": 1-10, "feedback": "..." },
  "seo": { "score": 1-10, "feedback": "..." },
  "improvements": ["改进建议1", "改进建议2", "改进建议3"]
}
```

## API 设计

### POST /api/chat
处理 Agent 对话。接收用户消息和当前阶段，调用对应 Agent 的 Claude API，返回 Agent 响应。

### POST /api/scrape
接收 URL，服务端 fetch 抓取 HTML 内容返回。设置超时（10s）和内容大小限制（1MB）。

### POST /api/review
接收抓取的 HTML + 用户上下文，调用审核 Agent，返回结构化报告。

## 成本与复杂度控制

- 调研和架构阶段: max_tokens: 500
- 代码生成阶段: max_tokens: 4096
- 审核报告: max_tokens: 1000
- 每个项目最多 10 轮迭代对话
- 生成的网站定位：单页落地页 / 个人站级别（hero + about + features + contact）
- 不做 SaaS、不做电商、不做复杂交互应用
- 模板类型引导用户选择：个人作品集、企业官网、产品落地页、活动页面

## UI/UX 设计原则

- 整体风格：现代、简洁、专业。参考 Atoms 的深色主题 + 渐变点缀
- 聊天面板中每个 Agent 有独立视觉标识（颜色/图标），用户一眼能分辨当前是哪个 Agent 在工作
- Agent 切换时有过渡动画，体现"交接"感
- 进度条清晰展示当前所在阶段
- 预览面板实时更新，代码生成时可以有打字机效果或加载动画
- 响应式布局：桌面端左右分栏，移动端上下堆叠

## 环境变量

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
```

## 开发流程

1. 初始化 Next.js 项目，配置 Tailwind + Supabase
2. 搭建 Auth 流程（注册/登录/登出）
3. 实现 Dashboard 页面（项目列表 + 新建入口）
4. 实现核心工作台页面（聊天面板 + 预览面板 + Agent 进度条）
5. 接入 Claude API，实现 4 个 Agent 的调用链
6. 实现 iframe 预览渲染
7. 实现项目保存/加载（Supabase CRUD）
8. 实现网站审核功能（URL 抓取 + 审核 Agent）
9. UI 打磨、动画、响应式适配
10. 部署到 Vercel，配置环境变量

## 注意事项

- iframe 渲染用户生成的 HTML 时必须加 sandbox 属性防 XSS
- Claude API key 只在服务端使用，绝不暴露到前端
- Supabase RLS（Row Level Security）确保用户只能访问自己的数据
- 所有 API route 需验证用户登录状态
- 错误处理要完善：API 调用失败、网络超时、内容过大都要有友好提示

---

## 当前进度（最近更新 2026-05-18）

### 已完成 — 挑战赛硬要求全部命中 ✅

**步骤 1（初始化）**：Next.js 14 + TS + Tailwind + ESLint，pnpm；项目根目录小写 `oiko/`（npm 命名规则）。

**步骤 2（Auth）**：Supabase + `@supabase/ssr` 接入；邮箱密码注册 / 登录 / 登出真实可用；根目录 `middleware.ts` 做 session 自动刷新 + 路由守卫（`/dashboard` `/workspace/*` 未登录跳 `/login?redirectTo=`，已登录访问 `/login` `/signup` 跳 `/dashboard`）；`/api/chat` `/api/review` `/api/scrape` 都在入口做 `auth.getUser()` 校验返 401。`lib/supabase/{client,server,admin,middleware}.ts` 四件套 + `app/actions/auth.ts` server action 登出。

**步骤 3 + 7（Dashboard 真实化 + 持久化）**：`supabase/schema.sql` 建 `projects` + `reviews` + `user_usage` 三表 + RLS + `updated_at` 触发器 + 两个 `security definer` 计数函数（`increment_user_calls` / `increment_user_reviews`）。`app/actions/projects.ts` 提供 `createProject` / `getProject` / `updateProject` / `deleteProject` 四个 server action。Dashboard server component 读 projects 列表渲染 `ProjectCard`，"新建项目" inline server action 创建 + 跳新 workspace。Workspace 拆 server `page.tsx`（fetch 项目 + 不存在/越权 redirect `/dashboard?error=project-not-found`）+ client `workspace-client.tsx`（接 initialState、每次 callAgent / 确认成功后 fire-and-forget `updateProject` 持久化；persist 前过滤 `thinking: true` 的 transient 消息）。

**步骤 4（工作台 UI + 真 Agent）**：顶部 Agent 进度条 + 左聊天 / 右 iframe 预览的响应式布局；stage 状态机 + 错误展示 + 15 轮迭代上限；`/api/chat` 真调 `claude-sonnet-4-6`，代码 Agent 输出经 `extractHtml` 清洗 + `wrapForIframe` 注入防递归脚本后送 iframe；代码消息在 chat 里默认折叠（>500 字符触发）。代码 Agent 偶尔返回纯对话文本时通过 `looksLikeHtml` 守门——文本进 chat，iframe 保留上一版好 HTML，`outputs.code` 不被污染。

**步骤 8（网站审核）**：`/api/scrape` 服务端 fetch URL（10s AbortController + 1MB 流式累加 + content-type 校验 + UA 标识 + auth gate）。`lib/htmlForReview.ts` 剥 script/style/comment + 截断 100KB。`/api/review` 检查审核 cap → 调审核 Agent → 解析 JSON（容错 markdown 围栏 / 前后客套话 / 字段缺失，找 `{` 到 `}` 切片）→ 写 `reviews` 表 → 原子 +1 计数。`/audit/new` 客户端表单两步 loading（抓取中 → 审核中）。`/audit/[id]` 服务端读 review + 总评分大数字 + 4 项卡片（结构 / 内容 / UX / SEO）+ 改进建议编号列表 + 删除按钮。Dashboard "Reviews" 区列表 + "新建审核" 入口 + 评分色块 + 时间。

**步骤 9（UI 打磨）**：4 个慢页面（`/dashboard` `/workspace/[id]` `/audit/[id]` `/audit/new`）都有 `loading.tsx` 骨架屏。全局 `<NavigationProgress />` 自定义客户端组件 [components/NavigationProgress.tsx](components/NavigationProgress.tsx)——document 级监听 `<a>` 点击，每次 `key` 重 mount 一个 div 跑固定 800ms CSS 渐变光带 + 200ms 淡出，**生命周期独立于实际路由切换时长**（YouTube/Vercel/Linear 风格）。Landing 底部"脚手架版本"提示、审核页 "审核 Agent · claude-sonnet-4-6" 字样都已移除。

**步骤 10（部署）**：Vercel Hobby 部署在 [oiko-murex.vercel.app](https://oiko-murex.vercel.app)。`maxDuration` 显式声明在三个 API route 上避开默认 timeout 砍连接：`/api/chat` `/api/review` = 60s（Hobby 上限），`/api/scrape` = 30s。GitHub `main` 分支 push 自动触发 redeploy。

**共享组件**：`AgentBadge` `AgentProgressBar` `MessageBubble` `StageActions` `ChatPanel` `PreviewPane` `ProjectCard` `DeleteProjectButton` `DeleteReviewButton` `NavigationProgress`。

**`lib/` 层**：`anthropic.ts` 服务端 client 懒加载；`agents.ts`（4 个 system prompt + token 预算 + 视觉 meta + `MAX_ITERATIONS_PER_PROJECT`）；`limits.ts`（账户级三层 cap + 哨兵字符串）；`usage.ts`（`getUserUsage` / `incrementUserCalls` / `incrementUserReviews`，全部走 service_role admin client）；`extractHtml.ts` + `looksLikeHtml` + `wrapForIframe`；`htmlForReview.ts`（审核 HTML 预处理）；`supabase/` 四件套；`types.ts` 全部领域类型。

### 未开始（可选 polish，不影响交付）

- README / SUBMISSION 评委文档（用户表示之后自己写）
- Landing 页加 "能力边界 + 推荐 prompt" 引导（用户表示之后自己加）
- 流式 Agent 输出（streaming）：解决慢网络下 "Failed to fetch" 残余问题（已被 `maxDuration=60` 解决一半，剩客户端 TCP 抖动只能 streaming 治本）

## 实施中的设计调整（**覆盖前文**）

以下决策在实施中由用户拍板。与本文档上方"UI/UX 设计原则"等冲突时**以本节为准**：

- **浅色主题**：放弃"Atoms 深色主题 + 渐变点缀"，统一浅色（zinc-50 底 / zinc-900 文字）。
- **品牌渐变 = 绿色系**：放弃靛紫紫红（用户原话"太 AI"），改为 `linear-gradient(135deg, #84cc16, #22c55e, #14b8a6)`（lime-500 → green-500 → teal-500）。挂在 `app/globals.css` 的 `.bg-gradient-brand` / `.text-gradient-brand`。
- **架构 Agent 视觉色 = 蓝色（blue）**：原计划 violet，因"去紫"全局策略改为 blue。四 Agent 最终：调研 cyan / 架构 blue / 代码 emerald / 审核 amber（chip = 50-系底 + 700-系字 + 200-系边，bar/dot = 500-系填充）。
- **Tailwind `content` 必须包含 `./lib/**`**：Agent 颜色类（`bg-cyan-500` 等）字符串写在 `lib/agents.ts`，缺这条路径 JIT 不生成对应 CSS，会"按钮透明、ring 配色错"。
- **`修改` 按钮 = 聚焦输入框**：原 spec 是"对当前阶段做局部 patch"，简化为 focus textarea，等用户敲反馈后再触发 stage agent 重跑。
- **每项目迭代上限 15 轮**：上文"成本与复杂度控制"写 10，用户改 15。常量在 `lib/agents.ts` 的 `MAX_ITERATIONS_PER_PROJECT`。
- **账户级三层 cap**（[lib/limits.ts](lib/limits.ts)）：
  - `MAX_API_CALLS_PER_USER = 50`：每账户终身 `/api/chat` 成功上限（≈ $1 Anthropic spend）。
  - `MAX_REVIEWS_PER_USER = 20`：每账户终身 `/api/review` 成功上限（**独立** budget，不和上面共享）。
  - `MAX_PROJECTS_PER_USER = 5`：UX 防护（用户删可绕过，防 Dashboard 堆垃圾）。
  - 计数都走 `user_usage` 表 + `security definer` RPC + service_role 原子 +1，客户端无法篡改。
  - Dashboard 顶部 "已用 X/50 调用 · X/20 审核 · X/5 项目"，比例 ≥80% 变 amber、=100% 变 red。
- **审核 Agent `max_tokens = 2048`**：原 1000 容易截断长 feedback。配合强化的 system prompt（明确要求"从 `{` 到 `}` 直接输出 JSON，不要客套话和 markdown 围栏"）。
- **非流式 Agent 调用**：一次性返回完整内容，不做 SSE / streaming。代码 Agent 5–10 秒的等待用 "思考中" 动画 + loading.tsx 骨架掩盖。
- **Auth 砍掉 Google OAuth**：原 spec 写了 Google OAuth，demo 阶段移除（Google Cloud OAuth 凭证 + Supabase provider 配置 ROI 太低）。Supabase Email Confirmation 也关闭以加速测试流程。后续可加回（每页约 5–10 分钟）。
- **iframe 渲染前注入防御脚本**：`lib/extractHtml.ts` 的 `wrapForIframe()` 在 `</body>` 前注入轻量脚本拦截所有 `<a>` 点击（同页锚点 smooth scroll，其他 preventDefault）+ `<form>` submit。修了"代码 Agent 输出的 nav 链接导致 iframe 套娃父页面"的 `about:srcdoc` 固有 bug。
- **`maxDuration = 60`（Vercel Hobby 上限）**：声明在 `/api/chat`、`/api/review`；`/api/scrape` = 30。Vercel 默认 timeout 会在代码 Agent 响应（4096 tokens ≈ 15–30s）完成前砍连接。Pro plan 才能再提升。
- **自定义 NavigationProgress 替代 `next-nprogress-bar`**：库的内部时序在 App Router 下不可靠（路由切换太快时 `start()` 还没真渲染 `<div id="nprogress">` 就 `done()` 了）。自写 30 行组件：document 级捕获 `<a>` 点击，每次 `key` 重 mount 一个 div 跑固定 CSS 动画，**生命周期与实际路由切换解耦**——页面 100ms 出来或 2s 出来，进度条都跑完它自己那 1 秒。

## 已知限制 / 待修

### 已修过的坑（仅供回顾，无 action）

- ~~iframe 预览中点击锚点 → 父页面递归套娃~~ → `wrapForIframe` 防御脚本注入。
- ~~代码 Agent 偶尔回纯对话文本污染 iframe~~ → `looksLikeHtml` 守门。
- ~~审核 Agent 输出带客套话导致 JSON parse 失败~~ → parser 找 `{` 到 `}` 切片 + system prompt 强化 + max_tokens 1000 → 2048。
- ~~部署后审核功能 RLS 报错 "new row violates row-level security policy for table 'reviews'"~~ → Vercel 上 `SUPABASE_SERVICE_ROLE_KEY` env 被复制成 anon key 导致。**两个 key 长得几乎一样（都是 `eyJ...`），人肉容易混。** 副症状是 Dashboard "已用 X/50" 永远显示 0（admin client 写不了 `user_usage`）。

### 仍有的限制（**固有约束，不是 bug**）

- **生成网站复杂度上限**：代码 Agent `max_tokens = 4096`，约 500 行单页 HTML。
  - **擅长**：作品集 / 落地页 / 企业介绍 / 活动页 / 博客 hero / 工具宣传页（视觉重、交互轻、状态简单）。
  - **不擅长**：计时器 / Web Audio API / 可编辑配置 / Dashboard / SPA / 任何需要状态机 + setInterval + DOM 事件的交互应用。
  - 挑战赛叙事上可包装成 "deliberate tradeoff → 工程思维 → 复杂度控制"，反而是评分加分项。
- **iframe 预览首次渲染慢 1–3 秒**：代码 Agent 输出的 HTML 用 Tailwind CDN（`<script src="https://cdn.tailwindcss.com">`）。每次 srcDoc 变化 iframe 重 load → 拉脚本（~400KB）→ JIT 编译 → 注入样式。Tailwind CDN 模式的固有特性。要根治得服务端预编译 Tailwind class → 内联 `<style>`，是个 round 级别的工作。
- **慢网络 / 跨境 VPN 下偶发 `Failed to fetch`**：代码 Agent 响应大且耗时长，客户端 TCP 连接易在中途断。`maxDuration=60` 已解决服务端 timeout 这一半，剩下客户端抖动只能靠 streaming 治本。当前先靠用户重试。
- **scrape 只抓单页**：`/api/scrape` 是纯 `fetch()`，不爬链接、不执行 JS。SPA 抓到的只是空壳；要审核子页要用户直接填子页 URL。整站爬虫 / Puppeteer 都超出 Hobby + 当前架构范围。
- **Dev mode 偶发 chunk 404**：跑过 `pnpm build` 或重启 dev server 后，浏览器旧 tab 引用的 chunk 名失效。`Cmd+Shift+R` 硬刷即可，prod 没此问题。

## 部署 / 运维

### Vercel

- **生产 URL**：[oiko-murex.vercel.app](https://oiko-murex.vercel.app)
- **Plan**：Hobby（免费，函数超时上限 60s）
- **自动部署**：GitHub `main` 分支 push 触发
- **手动 redeploy**：Vercel Dashboard → Deployments → 最新一条 → `...` → Redeploy
- **环境变量改完必须 redeploy**（Vercel 改 env 不会自动重新构建）

### 必需的环境变量

Vercel（Production + Preview 都要勾上）和本地 `.env.local` 都要这四个：

```
ANTHROPIC_API_KEY=sk-ant-api03-...
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...      ← Supabase Settings → API → "anon public"
SUPABASE_SERVICE_ROLE_KEY=eyJ...           ← Supabase Settings → API → "service_role secret"（带红色 RLS bypass 提示）
```

⚠️ **anon key 和 service_role key 长得几乎一模一样**（都是 `eyJ...` JWT），人肉容易混。**service_role 必须正确**，否则：
- `user_usage` 计数器静默失效（cap 形同虚设——cost 防护消失）
- 审核功能 RLS 报错（reviews insert 走 admin client，要 service_role 绕 RLS）

验证：登录后看 Dashboard "已用 X/50"——如果跑了几次生成依然显示 0，就是 service_role 配错了。

### Supabase

- **Authentication → Providers → Email**：必须**关闭 "Confirm email"**（demo 不做邮件验证流程，否则用户注册后没 session 进不去）。
- **建表 SQL**：[supabase/schema.sql](supabase/schema.sql) 包含全部三张表（projects / reviews / user_usage）+ RLS 策略 + `updated_at` 触发器 + 两个计数函数。新建 Supabase 项目时一次性粘到 SQL Editor 跑完即可。
- **清测试数据**：去 Auth → Users 删测试账号，`projects` / `reviews` / `user_usage` 全部 `on delete cascade` 自动清。

## 运行 / 开发提示

- 包管理器：**pnpm**（lockfile 已提交）
- 启动开发：`pnpm dev`（默认 3000，被占用自动跳 3001）
- 类型 + 路由全量检查：`pnpm build`（比 lint 单跑更彻底）
- 改 `tailwind.config.ts` 的 `content` 路径后偶尔需要重启 dev server，热重载不一定刷新 content map
- 跑过 `pnpm build` 之后再 `pnpm dev`：浏览器旧 tab 容易 chunk 404 → 硬刷新即可（dev 才会这样，prod 不会）
- Git 工作流：本地改完 → `pnpm build` 验证 → `git commit` + `git push` → Vercel 自动 redeploy（~1–3 分钟）
