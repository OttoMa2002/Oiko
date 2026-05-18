# Oiko — AI-Powered Web Builder

> 描述一个想法，看几个 AI Agent 帮你把它做成网站。

**Live Demo**: [oiko-murex.vercel.app](https://oiko-murex.vercel.app)

<!-- 截图占位：Landing 页 hero + 示例卡片 -->
<!-- 截图占位：Workspace 工作台（聊天面板 + 预览面板）-->
<!-- 截图占位：Audit 审核报告页 -->

---

## 这是什么

Oiko 是一个 AI 驱动的网站生成与审核平台。核心体验：用户用自然语言描述需求，**4 个分工不同的 AI Agent 依次协作**，从需求分析、架构设计到代码生成全程可见、可修改、可确认。生成完成后，用户可以下载完整 HTML 文件直接发布。

灵感来源：DeepWisdom 的 Atoms 平台。这是一个挑战赛 Demo 项目，重点展示：

- 多 Agent 协作的**可视化流程**（每个 Agent 在做什么用户都看得见）
- 从想法到可用网站的**端到端体验**
- **真实交互 + 数据持久化 + 部署可访问**

---

## 核心功能

### 1. AI 网站生成（主线）

自然语言描述 → 4 个 Agent 依次协作 → 输出可预览的完整单页网站。

- **调研 Agent**：分析用户需求，输出目标用户画像、功能建议、风格建议（200 字内）
- **架构 Agent**：根据调研结果输出页面结构（JSON：区块划分、导航、配色方案）
- **代码 Agent**：生成完整单页 HTML（含内联 CSS + Tailwind CDN，~500 行内）
- **迭代**：用户可在聊天框继续提出修改，系统转给对应 Agent 处理

每个阶段之间有用户确认节点（human-in-the-loop），用户可继续迭代或直接确认进入下一阶段。

**生成完成后的输出方式**：

- 一键**下载完整 HTML 文件**，可直接托管 / 发布 / 二次编辑
- 一键**复制公开预览链接** (`/preview/<id>`)，任何人**无需登录**就能打开看到全屏生成网页 —— 适合发给朋友 / 客户 / 群聊验收
- 链接分享到 X / Telegram / 微信 / Slack 等平台时，自动渲染**品牌 OG 卡片**（绿色渐变 + 标题描述），点击率比纯文本链接高数倍

### 2. AI 网站审核（延展功能）

URL + 上下文 → 服务端抓取网页内容 → 审核 Agent 输出结构化报告（总分、结构 / 内容 / UX / SEO 四项打分 + 改进建议）。

### 3. 用户系统

- Supabase Auth：邮箱密码注册 / 登录 / 登出
- Dashboard 查看历史项目和审核记录
- 账户级三层限额防超支（API 调用 / 审核 / 项目数）

---

## 架构

```
┌──────────────┐   ┌────────────┐   ┌────────────┐   ┌────────────┐
│ 用户自然语言 │ → │ 调研 Agent │ → │ 架构 Agent │ → │ 代码 Agent │ ──┐
│  (initial    │   │ (需求分析) │   │ (JSON 结构)│   │ (单页 HTML)│   │
│   prompt)    │   └────────────┘   └────────────┘   └────────────┘   │
└──────────────┘                                                       │
                                                                       ↓
                                                       ┌─────────────────────┐
                                                       │ iframe 沙箱预览      │
                                                       │ + 下载 HTML 文件     │
                                                       │ + 公开分享链接       │
                                                       │   (/preview/<id>)   │
                                                       └─────────────────────┘

  ┌──────────────┐   ┌────────────┐
  │ 任意网站 URL │ → │ 审核 Agent │ → 结构化报告（4 维评分 + 改进建议）
  │   + 上下文   │   │  (诊断)    │
  └──────────────┘   └────────────┘
```

每个 Agent 拥有独立 system prompt 和 token 预算，调用链由 server-side API routes 编排，前端实时渲染对话和预览。

---

## 技术栈

- **Framework**: Next.js 14 (App Router) + TypeScript
- **UI**: React + Tailwind CSS
- **Auth + Database**: Supabase (Postgres + Auth + RLS)
- **AI**: Anthropic Claude (`claude-sonnet-4-6`)
- **Deployment**: Vercel

---

## 本地开发

### 前置要求

- Node.js ≥ 18
- pnpm（推荐）或 npm
- Supabase 账号（免费 tier 够用）
- Anthropic API key

### 启动步骤

```bash
# 1. clone + 安装依赖
git clone <https://github.com/OttoMa2002/Oiko>
cd oiko
pnpm install

# 2. 配置环境变量（见下一节）
cp .env.example .env.local
# 编辑 .env.local，填入你的 key

# 3. 初始化数据库（见 "数据库初始化"）

# 4. 启动开发服务器
pnpm dev
# 默认 http://localhost:3000
```

### 环境变量

`.env.local` 需要这四个变量：

```env
ANTHROPIC_API_KEY=sk-ant-api03-...
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...        # Supabase → Settings → API → "anon public"
SUPABASE_SERVICE_ROLE_KEY=eyJ...             # Supabase → Settings → API → "service_role secret"
```


### 数据库初始化

1. 在 [Supabase Dashboard](https://supabase.com/dashboard) 新建项目
2. 进入 **SQL Editor**，粘贴并运行 [`supabase/schema.sql`](supabase/schema.sql) 全文。这一份 SQL 包含：
   - 三张表：`projects` / `reviews` / `user_usage`
   - RLS 策略（确保用户只能访问自己的数据）
   - `updated_at` 自动更新触发器
   - 两个 `security definer` 计数函数（用于原子递增 API 调用次数）
3. 进入 **Authentication → Providers → Email**，**关闭** "Confirm email"（demo 阶段不做邮件验证流程）

---

## 项目结构

```
oiko/
├── app/
│   ├── api/
│   │   ├── chat/       # 4-Agent 聊天调用（调研/架构/代码/审核共用）
│   │   ├── title/      # 项目自动取名
│   │   ├── scrape/     # 服务端抓取 URL（审核功能用）
│   │   └── review/     # 审核 Agent 调用
│   ├── actions/        # Server actions (createProject / updateProject 等)
│   ├── dashboard/      # 项目列表 + 审核列表
│   ├── workspace/[id]/ # 核心工作台（左聊天 / 右 iframe 预览）
│   ├── preview/[id]/   # 公开预览页（无需登录，全屏 iframe 渲染生成网页）
│   ├── audit/[id]/     # 审核详情页
│   ├── audit/new/      # 新建审核入口
│   ├── opengraph-image.tsx # 社交分享 OG 卡片（Next.js 自动生成 1200×630 PNG）
│   └── login, signup, page.tsx (landing)
├── components/         # UI 组件（ChatPanel / PreviewPane / AgentBadge ...）
├── lib/
│   ├── agents.ts       # 4 个 Agent 的 system prompt + token 预算
│   ├── anthropic.ts    # Anthropic SDK 客户端
│   ├── extractHtml.ts  # 代码 Agent 输出清洗 + iframe 沙箱防御注入
│   ├── htmlForReview.ts # 审核功能的 HTML 预处理
│   ├── limits.ts       # 账户级三层 cap
│   ├── usage.ts        # 调用计数（走 service_role 绕 RLS）
│   └── supabase/       # Supabase 客户端封装（server / client / admin / middleware）
├── supabase/schema.sql # 一次性建表 + RLS + 触发器
└── middleware.ts       # Session 自动刷新 + 路由守卫
```

---

## 已知限制

Oiko 的代码 Agent 设计是**故意约束**的，单次输出上限 4096 tokens（约 500 行单页 HTML）。

**擅长**：
- 个人作品集 / 摄影师主页
- 产品落地页 / 软件发布页
- 活动页 / 大会主页 / 报名页
- 企业品牌官网 / 餐厅 / 咖啡店

**不擅长**（需要复杂状态机或交互的应用）：
- 计时器 / 倒计时
- 可编辑 Dashboard
- SaaS 应用
- Web Audio / Canvas 游戏
- 多步表单 / 状态机

其他工程性限制：

- iframe 首次预览渲染慢 1-3 秒（Tailwind CDN 拉取 + JIT 编译，固有特性）
- `/api/scrape` 只抓单页内容，不爬子链接、不执行 JS（SPA 会抓到空壳）
- 慢网络 / 跨境 VPN 下代码 Agent 偶发 `Failed to fetch`（响应耗时 15–30s，客户端 TCP 可能中途断）
- Vercel Hobby 函数超时上限 60s（已在三个 API route 上显式声明 `maxDuration`）

---


---

## License

MIT