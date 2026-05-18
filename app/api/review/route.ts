import { NextResponse, type NextRequest } from "next/server";
import type Anthropic from "@anthropic-ai/sdk";

// Review Agent processes up to 100KB of HTML; total call can run >10s.
export const maxDuration = 60;
import { AGENT_MAX_TOKENS, AGENT_SYSTEM_PROMPTS } from "@/lib/agents";
import { CLAUDE_MODEL, getAnthropicClient } from "@/lib/anthropic";
import { MAX_REVIEWS_PER_USER } from "@/lib/limits";
import { createClient as createSupabaseServer } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { htmlForReview } from "@/lib/htmlForReview";
import { getUserReviewCount, incrementUserReviews } from "@/lib/usage";
import type { ReviewContext, ReviewReport } from "@/lib/types";

type RequestBody = {
  url?: string;
  html?: string;
  context?: ReviewContext;
};

function extractText(response: Anthropic.Messages.Message): string {
  for (const block of response.content) {
    if (block.type === "text") return block.text;
  }
  return "";
}

function parseReviewJson(text: string): ReviewReport | null {
  let cleaned = text.trim();

  const fenceMatch = cleaned.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (fenceMatch) {
    cleaned = fenceMatch[1].trim();
  } else {
    const first = cleaned.indexOf("{");
    const last = cleaned.lastIndexOf("}");
    if (first >= 0 && last > first) {
      cleaned = cleaned.slice(first, last + 1);
    }
  }

  try {
    const parsed = JSON.parse(cleaned) as Partial<ReviewReport>;
    if (
      typeof parsed.overall_score !== "number" ||
      !parsed.structure || !parsed.content || !parsed.ux || !parsed.seo ||
      !Array.isArray(parsed.improvements)
    ) {
      return null;
    }
    return parsed as ReviewReport;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const supabase = createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const used = await getUserReviewCount(user.id);
  if (used >= MAX_REVIEWS_PER_USER) {
    return NextResponse.json(
      {
        error: `已达账户审核上限（${MAX_REVIEWS_PER_USER} 次）。当前已用 ${used} 次。`,
      },
      { status: 403 },
    );
  }

  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "请求体不是合法 JSON" }, { status: 400 });
  }

  const url = body.url?.trim();
  const html = body.html;
  const context = body.context;

  if (!url) {
    return NextResponse.json({ error: "缺少 url" }, { status: 400 });
  }
  if (!html || typeof html !== "string") {
    return NextResponse.json({ error: "缺少 html 内容" }, { status: 400 });
  }
  if (
    !context ||
    typeof context.direction !== "string" ||
    typeof context.audience !== "string" ||
    typeof context.goals !== "string"
  ) {
    return NextResponse.json(
      { error: "缺少 context（direction / audience / goals 三段）" },
      { status: 400 },
    );
  }

  const slimHtml = htmlForReview(html);

  const userPayload = `# 审核目标
URL: ${url}

# 用户提供的上下文
- 网站方向：${context.direction}
- 目标用户：${context.audience}
- 希望改进的方向：${context.goals}

# 网页内容（已剥除 script/style/注释）

\`\`\`html
${slimHtml}
\`\`\`

请按系统提示的 JSON 格式输出审核报告，不要附加额外解释。`;

  let client;
  try {
    client = getAnthropicClient();
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Anthropic 客户端未配置" },
      { status: 500 },
    );
  }

  let rawText: string;
  try {
    const response = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: AGENT_MAX_TOKENS.review,
      system: AGENT_SYSTEM_PROMPTS.review,
      messages: [{ role: "user", content: userPayload }],
    });
    rawText = extractText(response);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "调用 Anthropic API 失败" },
      { status: 502 },
    );
  }

  const report = parseReviewJson(rawText);
  if (!report) {
    return NextResponse.json(
      {
        error: "审核 Agent 输出无法解析为合法 JSON，请重试一次",
        raw: rawText.slice(0, 500),
      },
      { status: 502 },
    );
  }

  // Persist via admin client (RLS already requires user_id match on insert,
  // but admin client is consistent with other server-only writes).
  const admin = createAdminClient();
  const { data: inserted, error: insertError } = await admin
    .from("reviews")
    .insert({
      user_id: user.id,
      url,
      context,
      report,
    })
    .select("id")
    .single();

  if (insertError || !inserted) {
    return NextResponse.json(
      { error: insertError?.message ?? "保存审核报告失败" },
      { status: 500 },
    );
  }

  incrementUserReviews(user.id).catch((err) =>
    console.error("Failed to increment user reviews:", err),
  );

  return NextResponse.json({ id: inserted.id });
}
