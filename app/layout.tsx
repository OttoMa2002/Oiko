import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { NavigationProgress } from "@/components/NavigationProgress";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://oiko-murex.vercel.app"),
  title: {
    default: "Oiko — AI-Powered Web Builder",
    template: "%s · Oiko",
  },
  description: "描述一个想法，看几个 AI Agent 帮你把它做成网站。多 Agent 协作 · 端到端建站。",
  keywords: ["AI", "Web Builder", "Agent", "Anthropic", "Claude", "No-code", "建站", "AI 建站"],
  openGraph: {
    title: "Oiko — AI-Powered Web Builder",
    description: "描述一个想法，看几个 AI Agent 帮你把它做成网站。",
    url: "https://oiko-murex.vercel.app",
    siteName: "Oiko",
    type: "website",
    locale: "zh_CN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Oiko — AI-Powered Web Builder",
    description: "描述一个想法，看几个 AI Agent 帮你把它做成网站。",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-zinc-50 text-zinc-900">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-zinc-50 text-zinc-900`}
      >
        <NavigationProgress />
        {children}
      </body>
    </html>
  );
}
