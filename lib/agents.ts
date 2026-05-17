export type AgentStage = "research" | "architecture" | "code" | "review";

export const RESEARCH_SYSTEM_PROMPT = `你是 Oiko 平台的调研 Agent。用户会描述他们想要构建的网站。
你的任务是分析需求并输出简要调研摘要，严格控制在 200 字以内。

输出格式：
- 目标用户：（一句话）
- 核心功能：（3-5 个要点）
- 风格建议：（配色方向 + 整体调性）
- 注意事项：（1-2 条）

不要输出代码。不要过度分析。简洁、精准、可执行。`;

export const ARCHITECTURE_SYSTEM_PROMPT = `你是 Oiko 平台的架构 Agent。根据调研摘要，输出页面结构方案。

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
}`;

export const CODE_SYSTEM_PROMPT = `你是 Oiko 平台的代码 Agent。根据架构方案生成完整的单页 HTML 网站。

严格要求：
1. 输出完整可运行的 HTML 文件，包含 <!DOCTYPE html>
2. 使用 Tailwind CSS CDN（<script src="https://cdn.tailwindcss.com"></script>）
3. 响应式设计，移动端适配
4. 总行数不超过 500 行
5. 不使用外部 JS 框架
6. 内联所有样式，不引用外部 CSS 文件（Tailwind CDN 除外）
7. 图片使用 placeholder（https://placehold.co/）
8. 只输出 HTML 代码，不要解释

生成一个视觉精致、结构清晰的现代网站。注重排版、间距和配色的协调。`;

export const REVIEW_SYSTEM_PROMPT = `你是 Oiko 平台的审核 Agent。用户会提供一个网站的 HTML 内容和上下文信息。
分析网站并输出结构化审核报告。

输出格式（JSON）：
{
  "overall_score": 1-10,
  "structure": { "score": 1-10, "feedback": "..." },
  "content": { "score": 1-10, "feedback": "..." },
  "ux": { "score": 1-10, "feedback": "..." },
  "seo": { "score": 1-10, "feedback": "..." },
  "improvements": ["改进建议1", "改进建议2", "改进建议3"]
}`;

export const AGENT_MAX_TOKENS: Record<AgentStage, number> = {
  research: 500,
  architecture: 500,
  code: 4096,
  review: 1000,
};

export const AGENT_SYSTEM_PROMPTS: Record<AgentStage, string> = {
  research: RESEARCH_SYSTEM_PROMPT,
  architecture: ARCHITECTURE_SYSTEM_PROMPT,
  code: CODE_SYSTEM_PROMPT,
  review: REVIEW_SYSTEM_PROMPT,
};

export type AgentMeta = {
  label: string;
  tagline: string;
  iconKey: "search" | "layout-grid" | "code-2" | "shield-check";
  classes: {
    chip: string;
    chipBorder: string;
    dot: string;
    ring: string;
    bar: string;
    accentText: string;
  };
};

export const AGENT_META: Record<AgentStage, AgentMeta> = {
  research: {
    label: "调研",
    tagline: "理解需求，画出方向",
    iconKey: "search",
    classes: {
      chip: "bg-cyan-50 text-cyan-700",
      chipBorder: "border-cyan-200",
      dot: "bg-cyan-500",
      ring: "ring-cyan-200",
      bar: "bg-cyan-500",
      accentText: "text-cyan-700",
    },
  },
  architecture: {
    label: "架构",
    tagline: "搭页面骨架与配色",
    iconKey: "layout-grid",
    classes: {
      chip: "bg-blue-50 text-blue-700",
      chipBorder: "border-blue-200",
      dot: "bg-blue-500",
      ring: "ring-blue-200",
      bar: "bg-blue-500",
      accentText: "text-blue-700",
    },
  },
  code: {
    label: "代码",
    tagline: "生成可运行的 HTML",
    iconKey: "code-2",
    classes: {
      chip: "bg-emerald-50 text-emerald-700",
      chipBorder: "border-emerald-200",
      dot: "bg-emerald-500",
      ring: "ring-emerald-200",
      bar: "bg-emerald-500",
      accentText: "text-emerald-700",
    },
  },
  review: {
    label: "审核",
    tagline: "审视并打分",
    iconKey: "shield-check",
    classes: {
      chip: "bg-amber-50 text-amber-700",
      chipBorder: "border-amber-200",
      dot: "bg-amber-500",
      ring: "ring-amber-200",
      bar: "bg-amber-500",
      accentText: "text-amber-700",
    },
  },
};

export const BUILD_STAGES: AgentStage[] = ["research", "architecture", "code"];

/**
 * Max successful /api/chat calls per project session.
 * Overrides CLAUDE.md's "10 轮" — user bumped to 15.
 */
export const MAX_ITERATIONS_PER_PROJECT = 15;
