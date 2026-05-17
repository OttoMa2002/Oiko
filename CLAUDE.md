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

## 当前进度（最近更新 2026-05-17）

### 已完成

- **步骤 1（初始化）**：Next.js 14 + TS + Tailwind + ESLint，pnpm 安装；项目根目录小写 `oiko/`（npm 命名规则）。
- **步骤 4 视觉部分（工作台 UI 骨架）**：顶部 Agent 进度条 + 左聊天 / 右 iframe 预览的响应式布局；stage 状态机用本地 React state + 写死的假回复驱动；点击"确认"会模拟 1.4 秒"思考"动画后切到下一阶段，进入代码阶段时 iframe 渲染内置的示例 HTML（`SAMPLE_HTML`）。**未接 Anthropic API**。
- **Landing 页 hero 区**：渐变 Oiko 标志 + 主标语 + 两个 CTA + 四个 Agent 卡片。
- **Dashboard / 登录 / 注册**：占位文字 + 返回主页链接，未接 Auth。
- **共享组件**：`AgentBadge` `AgentProgressBar` `MessageBubble` `StageActions` `ChatPanel` `PreviewPane`。
- **`lib/` 层**：`anthropic.ts` 服务端 client 懒加载封装；`agents.ts` 4 个 system prompt + token 预算 + 视觉 meta；`types.ts` 项目 / 审核 / 消息类型定义。
- **API route 占位**：`/api/chat` `/api/scrape` `/api/review` 均返 501。

### 未开始

- 步骤 2：Supabase 注册 + Auth 流程（**用户账号尚未注册**，整体延后）。
- 步骤 3：Dashboard 真实化（项目列表 + 新建入口）。
- 步骤 5：接 Claude API，4 Agent 调用链。
- 步骤 6：iframe 预览对接真实生成 HTML。
- 步骤 7：项目保存 / 加载（依赖 Supabase）。
- 步骤 8：网站审核功能（URL 抓取 + 审核 Agent）。
- 步骤 9：UI 打磨、动画、响应式细化。
- 步骤 10：Vercel 部署。

## 实施中的设计调整（**覆盖前文**）

以下决策在实施中由用户拍板。与本文档上方"UI/UX 设计原则"等冲突时**以本节为准**：

- **浅色主题**：放弃"Atoms 深色主题 + 渐变点缀"，统一浅色（zinc-50 底 / zinc-900 文字）。
- **品牌渐变 = 绿色系**：放弃靛紫紫红（用户评价"太 AI"），改为 `linear-gradient(135deg, #84cc16, #22c55e, #14b8a6)`（lime-500 → green-500 → teal-500）。挂在 `app/globals.css` 的 `.bg-gradient-brand` / `.text-gradient-brand`。
- **架构 Agent 视觉色 = 蓝色（blue）**：原计划 violet，因"去紫"全局策略改为 blue。四个 Agent 最终色板：调研 cyan / 架构 blue / 代码 emerald / 审核 amber（chip = 50-系底 + 700-系字 + 200-系边，bar/dot = 500-系填充）。
- **Tailwind `content` 必须包含 `./lib/**`**：因为 Agent 颜色类（`bg-cyan-500` 等）以字符串形式写在 `lib/agents.ts`，缺这条路径 JIT 不会生成对应 CSS，会出现"按钮透明、ring 配色错"的连锁视觉 bug。
- **`修改` 按钮 = 聚焦输入框**：CLAUDE.md 原文里"修改"是"对当前阶段输出做局部 patch"的人机回路按钮，目前实现简化为点击后将光标 focus 到下方 textarea，等用户文字反馈触发 stage agent 重新生成。等接真 API 时再决定是否做"局部 patch"语义。
- **每项目迭代上限 15 轮**：上文"成本与复杂度控制"写的是 10 轮，用户改为 **15** 轮。计数口径为"调用 `/api/chat` 成功的总次数"（初次研究 + 推进架构 + 推进代码 + 任何 stage 上的用户反馈迭代）。常量定义在 `lib/agents.ts` 的 `MAX_ITERATIONS_PER_PROJECT`。
- **非流式 Agent 调用**：`/api/chat` 一次性返回完整内容，不做 SSE / streaming。代码 Agent 5–10 秒的等待用 ChatPanel 的"思考中"动画掩盖。等 demo 成熟再考虑流式。

## 已知问题 / 待修

- ~~iframe 预览中点击锚点链接会"递归套娃"~~ **已修（注入防御脚本）**
  - 修法：`lib/extractHtml.ts` 增加 `wrapForIframe()`，在 HTML 末尾 `</body>` 前注入一段轻量脚本，全局拦截 `<a>` 点击和 `<form>` 提交。`href="#xxx"` 走 smooth scroll，其他全部 `preventDefault()`。`PreviewPane` 在传 `srcDoc` 前先包一遍。

- **Auth 跳转链路尚未存在**
  - Landing / Dashboard 上的"登录"按钮跳到 `/login`，但 login 页只是占位文字。dev server 偶发 chunk 加载错误通常是 `.next` 缓存未跟上文件结构变化；遇到时 Ctrl-C 重启 `pnpm dev` 即可。

## 运行 / 开发提示

- 包管理器：**pnpm**（lockfile 已提交）。
- 启动开发：`pnpm dev`（默认 3000；被占用时自动跳 3001）。
- 类型 + 路由检查：`pnpm build`（比 lint 单跑更彻底，会编译所有 route）。
- 改 `tailwind.config.ts` 的 `content` 路径后偶尔需要重启 dev server，热重载不一定刷新 content map。
