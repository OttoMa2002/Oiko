import { NextResponse, type NextRequest } from "next/server";
import { CLAUDE_MODEL, getAnthropicClient } from "@/lib/anthropic";
import { createClient as createSupabaseServer } from "@/lib/supabase/server";

// Title generation is a single short Claude call (~30 tokens). 15s is plenty.
export const maxDuration = 15;

const SYSTEM_PROMPT = `你是 Oiko 平台的标题生成器。根据用户的网站需求描述，生成一个 10 字以内的简洁中文标题。
- 直接输出标题文本
- 不要引号、不要标点、不要解释、不要 markdown
- 优先抓住网站的"类型 + 主体"（如 "摄影师作品集"、"AI 写作工具发布页"）
- 如果用户描述很短或很抽象，可以泛化（如 "个人网站"、"产品落地页"）`;

type RequestBody = { prompt?: string };

export async function POST(request: NextRequest) {
  const supabase = createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "请求体无效" }, { status: 400 });
  }
  const prompt = body.prompt?.trim();
  if (!prompt) {
    return NextResponse.json({ error: "缺少 prompt" }, { status: 400 });
  }

  try {
    const client = getAnthropicClient();
    const response = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 30,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt }],
    });
    const block = response.content[0];
    const raw = block && block.type === "text" ? block.text : "";
    // Strip stray quotes/whitespace and clamp length (defense against model
    // ignoring the system constraint).
    const title = raw
      .trim()
      .replace(/^["'《「『]+|["'》」』。．，,]+$/g, "")
      .slice(0, 30);
    if (!title) {
      return NextResponse.json({ error: "标题生成失败" }, { status: 502 });
    }
    return NextResponse.json({ title });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "未知错误";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}