import { NextResponse, type NextRequest } from "next/server";
import type Anthropic from "@anthropic-ai/sdk";
import {
  AGENT_MAX_TOKENS,
  AGENT_SYSTEM_PROMPTS,
  BUILD_STAGES,
  type AgentStage,
} from "@/lib/agents";
import { CLAUDE_MODEL, getAnthropicClient } from "@/lib/anthropic";
import { MAX_API_CALLS_PER_USER } from "@/lib/limits";
import { createClient as createSupabaseServer } from "@/lib/supabase/server";
import { getUserCallCount, incrementUserCalls } from "@/lib/usage";

type Outputs = Partial<Record<AgentStage, string>>;

type RequestBody = {
  stage: AgentStage;
  initialPrompt: string;
  outputs?: Outputs;
  userFeedback?: string;
};

type ClaudeMessage = { role: "user" | "assistant"; content: string };

function buildMessages(
  stage: AgentStage,
  initialPrompt: string,
  outputs: Outputs,
  userFeedback?: string,
): ClaudeMessage[] {
  const messages: ClaudeMessage[] = [{ role: "user", content: initialPrompt }];

  if (stage === "research") {
    if (userFeedback && outputs.research) {
      messages.push({ role: "assistant", content: outputs.research });
      messages.push({ role: "user", content: userFeedback });
    }
    return messages;
  }

  if (!outputs.research) {
    throw new Error("缺少调研阶段输出，无法进入架构阶段");
  }
  messages.push({ role: "assistant", content: outputs.research });
  messages.push({
    role: "user",
    content: "请基于上面的调研结果，按照系统提示中的格式输出页面架构 JSON。",
  });

  if (stage === "architecture") {
    if (userFeedback && outputs.architecture) {
      messages.push({ role: "assistant", content: outputs.architecture });
      messages.push({ role: "user", content: userFeedback });
    }
    return messages;
  }

  if (!outputs.architecture) {
    throw new Error("缺少架构阶段输出，无法进入代码阶段");
  }
  messages.push({ role: "assistant", content: outputs.architecture });
  messages.push({
    role: "user",
    content: "请基于上面的架构方案，生成一个完整可运行的单页 HTML 网站。",
  });

  if (userFeedback && outputs.code) {
    messages.push({ role: "assistant", content: outputs.code });
    messages.push({ role: "user", content: userFeedback });
  }

  return messages;
}

function extractText(response: Anthropic.Messages.Message): string {
  for (const block of response.content) {
    if (block.type === "text") return block.text;
  }
  return "";
}

export async function POST(req: NextRequest) {
  const supabaseServer = createSupabaseServer();
  const {
    data: { user },
  } = await supabaseServer.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  // Cost guard: per-account lifetime call cap.
  const used = await getUserCallCount(user.id);
  if (used >= MAX_API_CALLS_PER_USER) {
    return NextResponse.json(
      {
        error: `已达账户使用上限（${MAX_API_CALLS_PER_USER} 次调用）。当前已用 ${used} 次。`,
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

  const { stage, initialPrompt, outputs = {}, userFeedback } = body;

  if (!stage || !BUILD_STAGES.includes(stage)) {
    return NextResponse.json(
      { error: "stage 字段无效，必须是 research / architecture / code" },
      { status: 400 },
    );
  }
  if (!initialPrompt || typeof initialPrompt !== "string") {
    return NextResponse.json(
      { error: "缺少 initialPrompt（用户初始需求描述）" },
      { status: 400 },
    );
  }

  let messages: ClaudeMessage[];
  try {
    messages = buildMessages(stage, initialPrompt, outputs, userFeedback);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "构造 Claude 消息失败" },
      { status: 400 },
    );
  }

  let client;
  try {
    client = getAnthropicClient();
  } catch (e) {
    return NextResponse.json(
      {
        error:
          e instanceof Error
            ? e.message
            : "Anthropic 客户端未配置（检查 ANTHROPIC_API_KEY）",
      },
      { status: 500 },
    );
  }

  try {
    const response = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: AGENT_MAX_TOKENS[stage],
      system: AGENT_SYSTEM_PROMPTS[stage],
      messages,
    });

    // Increment usage only on success. Failure to increment doesn't fail
    // the response — undercount is preferable to losing the user's reply.
    incrementUserCalls(user.id).catch((err) =>
      console.error("Failed to increment user calls:", err),
    );

    return NextResponse.json({ content: extractText(response) });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "调用 Anthropic API 失败";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
