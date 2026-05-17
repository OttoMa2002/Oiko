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
