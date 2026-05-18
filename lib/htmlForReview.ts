/**
 * Slim a raw HTML document down to something cheap to send to the review
 * Agent: strip scripts / styles / comments and truncate to a hard cap so
 * even a giant page stays under our token budget.
 */

const MAX_BYTES = 100 * 1024; // 100 KB after cleaning

export function htmlForReview(raw: string): string {
  let s = raw;

  // Drop <script>...</script> blocks (incl. inline).
  s = s.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
  // Drop <style>...</style> blocks.
  s = s.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "");
  // Drop <noscript>...</noscript>.
  s = s.replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, "");
  // Drop HTML comments.
  s = s.replace(/<!--[\s\S]*?-->/g, "");
  // Collapse runs of whitespace.
  s = s.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n");

  s = s.trim();

  if (s.length > MAX_BYTES) {
    s = s.slice(0, MAX_BYTES) + "\n<!-- [Oiko truncated · 原始内容过长] -->";
  }
  return s;
}
