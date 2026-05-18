import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { wrapForIframe } from "@/lib/extractHtml";

// UUIDs are 128-bit random — practically unguessable. We rely on this as the
// "share token" instead of building a separate short-code system: anyone with
// the URL can view, anyone without it cannot enumerate other projects.
// Trade-off documented for the project: simple > unguessable-short-codes.

type Params = { id: string };

export const metadata = {
  // Empty title so the preview tab shows the generated site's own <title>
  // (extracted from the user HTML). Falls back to template "· Oiko" if absent.
  title: "预览",
};

async function loadProject(id: string) {
  const supabase = createAdminClient();
  // service_role bypasses RLS — this is the whole point of a public share URL.
  // Only project a minimal column set to limit blast radius if cell-level
  // ACLs ever land.
  const { data, error } = await supabase
    .from("projects")
    .select("id, name, generated_html")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return data as { id: string; name: string; generated_html: string | null };
}

export default async function PreviewPage({ params }: { params: Params }) {
  const project = await loadProject(params.id);

  if (!project || !project.generated_html) {
    // Friendly empty state, not the bare Next.js 404. Reassures a viewer that
    // the link itself is valid Oiko-shaped (just that the project doesn't
    // exist anymore or wasn't generated yet).
    return (
      <main className="min-h-screen flex items-center justify-center bg-zinc-50 px-6">
        <div className="max-w-md text-center space-y-5">
          <span className="font-bold tracking-tight text-4xl text-gradient-brand">
            Oiko
          </span>
          <h1 className="text-2xl font-semibold text-zinc-900">
            项目不存在或还在生成中
          </h1>
          <p className="text-zinc-500 leading-relaxed">
            这个链接对应的项目可能已被删除、还没有完成生成，
            或者地址输错了。你可以回到首页自己造一个网站，
            几分钟就行。
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-white text-sm font-medium bg-gradient-brand hover:opacity-90 transition-opacity"
          >
            回到 Oiko 主页
            <ArrowRight size={14} />
          </Link>
        </div>
      </main>
    );
  }

  const srcDoc = wrapForIframe(project.generated_html);

  // Full-bleed iframe absolutely positioned over the viewport — overrides any
  // padding inherited from the root layout. `sandbox="allow-scripts"` matches
  // workspace preview semantics (Tailwind CDN needs scripts, RLS-equivalent
  // isolation via missing allow-same-origin).
  return (
    <div className="fixed inset-0 bg-white">
      <iframe
        title={project.name}
        sandbox="allow-scripts"
        srcDoc={srcDoc}
        className="w-full h-full block border-0"
      />
    </div>
  );
}