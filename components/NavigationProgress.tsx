"use client";

import { useEffect, useState } from "react";

const FILL_MS = 800;
const FADE_MS = 200;

/**
 * Click-driven top progress bar.
 *
 * Captures clicks on any internal `<a>` (Next.js `<Link>` renders to one)
 * AND form submissions (server-action buttons like "新建项目"), then
 * mounts a fresh keyed `<div>` that runs a fixed 800ms width animation
 * + 200ms fade. The bar's lifetime is independent of when the route
 * actually finishes loading — same UX pattern as Vercel/Linear/YouTube.
 *
 * Anchor skips: external URLs, mailto/tel, hash-only, target=_blank,
 * download attribute, modifier-key clicks (Cmd/Ctrl/Shift + click open
 * in new tab), non-primary mouse button.
 * Form skips: target=_blank.
 */
export function NavigationProgress() {
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (e.button !== 0) return;

      const target = e.target as HTMLElement | null;
      const anchor = target?.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;
      if (href.startsWith("http") || href.startsWith("//")) return;
      if (href.startsWith("mailto:") || href.startsWith("tel:")) return;
      if (href.startsWith("#")) return;
      if (anchor.target === "_blank") return;
      if (anchor.hasAttribute("download")) return;

      setTrigger((t) => t + 1);
    }

    function handleSubmit(e: SubmitEvent) {
      const form = e.target as HTMLFormElement | null;
      if (!form) return;
      if (form.target === "_blank") return;
      setTrigger((t) => t + 1);
    }

    document.addEventListener("click", handleClick);
    document.addEventListener("submit", handleSubmit);
    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("submit", handleSubmit);
    };
  }, []);

  return (
    <>
      <style>{`
        @keyframes oikoProgressFill {
          0%   { width: 0%; }
          60%  { width: 70%; }
          100% { width: 100%; }
        }
        @keyframes oikoProgressFade {
          0%   { opacity: 1; }
          100% { opacity: 0; }
        }
        .oiko-progress-bar {
          position: fixed;
          top: 0;
          left: 0;
          height: 3px;
          z-index: 9999;
          pointer-events: none;
          background-image: linear-gradient(90deg, #84cc16 0%, #16a34a 50%, #14b8a6 100%);
          box-shadow: 0 0 10px rgba(34, 197, 94, 0.55), 0 0 4px rgba(34, 197, 94, 0.4);
          width: 0%;
          animation:
            oikoProgressFill ${FILL_MS}ms ease-out forwards,
            oikoProgressFade ${FADE_MS}ms ease-out ${FILL_MS}ms forwards;
        }
      `}</style>
      {trigger > 0 && <div key={trigger} className="oiko-progress-bar" />}
    </>
  );
}
