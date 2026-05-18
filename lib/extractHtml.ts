/**
 * Heuristic: does this string look like a real, *complete* HTML document?
 * Used by the workspace to decide whether a code-Agent response should
 * replace the live preview or just sit in chat as conversational text.
 *
 * Both ends must look right: opens with <!doctype html> or <html ...>, AND
 * closes with </html>. The closing check is what catches max_tokens truncation
 * — a response that starts as a valid document but cut off mid-write (no
 * </html>) should NOT replace the preview, otherwise we'd swap the user's
 * working HTML for a broken half-render.
 */
export function looksLikeHtml(s: string): boolean {
  const t = s.trim().toLowerCase();
  const startsOk =
    t.startsWith("<!doctype html") || /^<html[\s>]/.test(t);
  const endsOk = t.endsWith("</html>");
  return startsOk && endsOk;
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
 * Defense payload injected into the <head> of agent-generated HTML before
 * rendering in the sandboxed preview iframe. Three layers, defense in depth:
 *
 * 1. <base href="...invalid/"> — `about:srcdoc` resolves relative URLs against
 *    the *parent page* URL, so a Claude-generated `<a href="/">` would point at
 *    the Oiko app itself and navigating the iframe loads our own site inside
 *    the preview. Rebasing relative URLs to a guaranteed-unresolvable host
 *    (.invalid is IANA-reserved, DNS always fails) means even if every JS
 *    layer below misses, the worst case is a blank load, not "the preview
 *    becomes the Oiko homepage".
 *    Note: Tailwind CDN and https://placehold.co/ images are absolute URLs
 *    and unaffected. Code agent's system prompt mandates absolute image URLs.
 *
 * 2. Capture-phase click/submit interceptors — preventDefault on every <a>
 *    click (smooth-scrolling same-page #anchors) and every <form> submit.
 *    Placed in <head> so they're armed before any user interaction.
 *
 * 3. Monkey-patch location.assign/replace/reload — backstop for inline
 *    handlers like `onclick="location.href='/'"` that bypass preventDefault
 *    by directly invoking JS navigation. href setter is on prototype and
 *    often non-configurable so we can't reliably override it; layer 1 catches
 *    that case.
 */
const IFRAME_DEFENSE_HEAD = `
<base href="https://oiko-preview-isolated.invalid/">
<script>/* oiko-defense */
(function() {
  var noop = function() {};
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
      } catch (err) {}
      return;
    }
    e.preventDefault();
    e.stopImmediatePropagation();
  }, true);
  document.addEventListener('submit', function(e) {
    e.preventDefault();
    e.stopImmediatePropagation();
  }, true);
  try { window.location.assign = noop; } catch (e) {}
  try { window.location.replace = noop; } catch (e) {}
  try { window.location.reload = noop; } catch (e) {}
})();
</script>
`;

/**
 * Inject the navigation-defense payload at the top of <head> in a Claude-
 * generated HTML document. Falls back to prepending a <head> block if none
 * is present. Idempotent — checked via the /* oiko-defense *\/ marker.
 */
export function wrapForIframe(html: string): string {
  if (html.includes("/* oiko-defense */")) return html;
  if (/<head[^>]*>/i.test(html)) {
    return html.replace(/<head([^>]*)>/i, `<head$1>${IFRAME_DEFENSE_HEAD}`);
  }
  if (/<html[^>]*>/i.test(html)) {
    return html.replace(/<html([^>]*)>/i, `<html$1><head>${IFRAME_DEFENSE_HEAD}</head>`);
  }
  return `<head>${IFRAME_DEFENSE_HEAD}</head>${html}`;
}
