import { NextResponse, type NextRequest } from "next/server";
import { createClient as createSupabaseServer } from "@/lib/supabase/server";

// Internal AbortController already caps at 10s, but give headroom in case
// the target site is slow to start responding.
export const maxDuration = 30;

const FETCH_TIMEOUT_MS = 10_000;
const MAX_BYTES = 1_000_000; // 1 MB
const USER_AGENT =
  "Mozilla/5.0 (compatible; OikoReviewBot/1.0; +https://github.com/OttoMa2002/Oiko)";

type RequestBody = { url?: string };

function looksLikeHttpUrl(u: string): boolean {
  try {
    const parsed = new URL(u);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
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

  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "请求体不是合法 JSON" }, { status: 400 });
  }

  const url = body.url?.trim();
  if (!url || !looksLikeHttpUrl(url)) {
    return NextResponse.json(
      { error: "请输入有效的 http / https URL" },
      { status: 400 },
    );
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const upstream = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml",
      },
      signal: controller.signal,
      redirect: "follow",
    });

    if (!upstream.ok) {
      return NextResponse.json(
        { error: `目标网站返回 ${upstream.status}` },
        { status: 502 },
      );
    }

    const ct = upstream.headers.get("content-type") ?? "";
    if (!ct.includes("text/html") && !ct.includes("application/xhtml")) {
      return NextResponse.json(
        { error: `目标不是 HTML 页面（content-type: ${ct || "未知"}）` },
        { status: 415 },
      );
    }

    // Read stream with a hard byte cap.
    const reader = upstream.body?.getReader();
    if (!reader) {
      return NextResponse.json({ error: "无法读取目标网站响应" }, { status: 502 });
    }

    const chunks: Uint8Array[] = [];
    let total = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_BYTES) {
        reader.cancel();
        return NextResponse.json(
          { error: `目标页面过大（> ${MAX_BYTES / 1000} KB）` },
          { status: 413 },
        );
      }
      chunks.push(value);
    }

    const buf = new Uint8Array(total);
    let offset = 0;
    for (const c of chunks) {
      buf.set(c, offset);
      offset += c.byteLength;
    }
    const html = new TextDecoder("utf-8", { fatal: false }).decode(buf);

    return NextResponse.json({ url, html });
  } catch (e: unknown) {
    if (e instanceof Error && e.name === "AbortError") {
      return NextResponse.json(
        { error: `请求超时（> ${FETCH_TIMEOUT_MS / 1000} 秒）` },
        { status: 504 },
      );
    }
    const msg = e instanceof Error ? e.message : "抓取失败";
    return NextResponse.json({ error: msg }, { status: 502 });
  } finally {
    clearTimeout(timer);
  }
}
