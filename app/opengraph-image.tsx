import { ImageResponse } from "next/og";

// Next.js 14 file convention: this file is automatically used as the og:image
// AND twitter:image for the root route. Both `metadata.openGraph.images` and
// `metadata.twitter.images` are populated from it without any manual wiring.
//
// Rendered with Satori (next/og). Important constraints:
//  - every nested element must explicitly set `display: flex` (no grid)
//  - CJK text would require fetching a .ttf font binary at runtime (Geist
//    *.woff isn't supported); we stay English-only to keep the function cold
//    start fast and the bundle small
//  - background uses the same lime → green → teal gradient as `bg-gradient-brand`
//    in app/globals.css so the OG card visually matches the live site

export const alt = "Oiko — AI-Powered Web Builder";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px 96px",
          background: "linear-gradient(135deg, #84cc16 0%, #22c55e 50%, #14b8a6 100%)",
          color: "white",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 140,
            fontWeight: 800,
            letterSpacing: "-0.04em",
            lineHeight: 1,
          }}
        >
          Oiko
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 44,
            fontWeight: 600,
            marginTop: 20,
            opacity: 0.95,
            letterSpacing: "-0.01em",
          }}
        >
          AI-Powered Web Builder
        </div>
        <div
          style={{
            display: "flex",
            width: 96,
            height: 5,
            background: "rgba(255,255,255,0.55)",
            marginTop: 44,
            borderRadius: 3,
          }}
        />
        <div
          style={{
            display: "flex",
            fontSize: 30,
            marginTop: 36,
            opacity: 0.88,
            lineHeight: 1.4,
            maxWidth: 880,
          }}
        >
          Describe a site in natural language. Watch multiple AI agents build it, end to end.
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 80,
            fontSize: 20,
            opacity: 0.65,
            fontFamily: "ui-monospace, Menlo, monospace",
          }}
        >
          oiko-murex.vercel.app
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}