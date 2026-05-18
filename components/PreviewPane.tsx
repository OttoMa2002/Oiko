"use client";

import { Download, MonitorPlay } from "lucide-react";
import clsx from "clsx";
import { wrapForIframe } from "@/lib/extractHtml";

type Props = {
  html: string | null;
  projectName?: string;
  /** When true, show a subtle pulse overlay to indicate the code agent is working. */
  generating?: boolean;
};

const EMPTY_STATE_DOC = `<!DOCTYPE html><html><body style="margin:0;font-family:system-ui;display:flex;align-items:center;justify-content:center;height:100vh;background:#fafafa;color:#a1a1aa;font-size:14px;">等待代码 Agent 生成…</body></html>`;

function sanitizeFilename(s: string): string {
  const cleaned = s
    .trim()
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, "-")
    .replace(/\s+/g, "-")
    .slice(0, 60);
  return cleaned || "oiko-site";
}

export function PreviewPane({ html, projectName, generating }: Props) {
  const srcDoc = html ? wrapForIframe(html) : EMPTY_STATE_DOC;

  function handleDownload() {
    if (!html) return;
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${sanitizeFilename(projectName ?? "oiko-site")}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 bg-white">
        <div className="flex items-center gap-2 text-sm text-zinc-600">
          <MonitorPlay size={16} strokeWidth={2.25} />
          <span className="font-medium">实时预览</span>
        </div>
        <div className="flex items-center gap-3">
          {html && (
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1 rounded-full border border-zinc-300 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-100 hover:border-zinc-400 transition-colors"
              title="下载生成的 HTML 文件"
            >
              <Download size={12} strokeWidth={2.5} />
              下载 HTML
            </button>
          )}
          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <span className="h-2 w-2 rounded-full bg-zinc-300" />
            <span>sandboxed iframe</span>
          </div>
        </div>
      </div>
      <div className="flex-1 relative bg-zinc-100 p-3">
        <div className="h-full w-full rounded-lg overflow-hidden border border-zinc-200 bg-white shadow-sm">
          <iframe
            title="Oiko preview"
            sandbox="allow-scripts"
            srcDoc={srcDoc}
            className="w-full h-full block"
          />
        </div>
        {generating && (
          <div
            className={clsx(
              "pointer-events-none absolute inset-3 rounded-lg",
              "ring-2 ring-emerald-300/60 animate-pulse",
            )}
          />
        )}
      </div>
    </div>
  );
}