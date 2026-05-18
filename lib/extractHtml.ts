/**
 * Heuristic: does this string look like a real HTML document?
 * Used by the workspace to decide whether a code-Agent response should
 * replace the live preview or just sit in chat as conversational text.
 */
export function looksLikeHtml(s: string): boolean {
  const t = s.trim().toLowerCase();
  return t.startsWith("<!doctype html") || /^<html[\s>]/.test(t);
}

/**
 * Pull a usable HTML string out of the code Agent's raw response.
 * The agent's system prompt asks for raw HTML only, but models occasionally
 * wrap output in ```html ... ``` fences or include a short preface — strip
 * those so the iframe receives a clean document.
 */
export function extractHtml(raw: string): string {
  const trimmed = raw.trim();

  const fenceMatch = trimmed.match(/```(?:html)?\s*\n?([\s\S]*?)\n?```/i);
  if (fenceMatch) return fenceMatch[1].trim();

  const docStart = trimmed.search(/<!DOCTYPE\s+html/i);
  if (docStart > 0) {
    const docEnd = trimmed.lastIndexOf("</html>");
    if (docEnd > docStart) {
      return trimmed.slice(docStart, docEnd + "</html>".length);
    }
    return trimmed.slice(docStart);
  }

  return trimmed;
}

/**
 * Defense script injected into agent-generated HTML before rendering in the
 * sandboxed preview iframe. Blocks the "click an anchor → iframe loads the
 * parent URL recursively" bug that arises from `about:srcdoc` not supporting
 * hash navigation. Same-page anchors still scroll smoothly; everything else
 * is a no-op.
 */
const IFRAME_DEFENSE_SCRIPT = `
<script>
(function() {
  document.addEventListener('click', function(e) {
    var a = e.target && e.target.closest ? e.target.closest('a') : null;
    if (!a) return;
    var href = a.getAttribute('href');
    if (href && href.charAt(0) === '#' && href.length > 1) {
      e.preventDefault();
      try {
        var target = document.querySelector(href);
        if (target && target.scrollIntoView) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      } catch (err) { /* invalid selector — ignore */ }
      return;
    }
    e.preventDefault();
  }, true);
  document.addEventListener('submit', function(e) {
    e.preventDefault();
  }, true);
})();
</script>
`;

/**
 * Inject the navigation-defense script into a Claude-generated HTML document
 * just before its `</body>` (or appended if no body tag is present). Idempotent
 * if called twice — the script tag uses a marker comment to detect prior injection.
 */
export function wrapForIframe(html: string): string {
  if (html.includes("/* oiko-defense */")) return html;
  const marker = "<script>/* oiko-defense */";
  const scriptWithMarker = IFRAME_DEFENSE_SCRIPT.replace(
    "<script>",
    marker,
  );
  if (/<\/body>/i.test(html)) {
    return html.replace(/<\/body>/i, `${scriptWithMarker}</body>`);
  }
  return html + scriptWithMarker;
}
