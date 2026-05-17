"use client";

import { MonitorPlay } from "lucide-react";
import clsx from "clsx";
import { wrapForIframe } from "@/lib/extractHtml";

type Props = {
  html: string | null;
  /** When true, show a subtle pulse overlay to indicate the code agent is working. */
  generating?: boolean;
};

const EMPTY_STATE_DOC = `<!DOCTYPE html><html><body style="margin:0;font-family:system-ui;display:flex;align-items:center;justify-content:center;height:100vh;background:#fafafa;color:#a1a1aa;font-size:14px;">等待代码 Agent 生成…</body></html>`;

export function PreviewPane({ html, generating }: Props) {
  const srcDoc = html ? wrapForIframe(html) : EMPTY_STATE_DOC;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 bg-white">
        <div className="flex items-center gap-2 text-sm text-zinc-600">
          <MonitorPlay size={16} strokeWidth={2.25} />
          <span className="font-medium">实时预览</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
          <span className="h-2 w-2 rounded-full bg-zinc-300" />
          <span>sandboxed iframe</span>
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
