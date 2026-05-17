import { Code2, LayoutGrid, Search, ShieldCheck, type LucideIcon } from "lucide-react";
import clsx from "clsx";
import type { AgentStage } from "@/lib/agents";
import { AGENT_META } from "@/lib/agents";

const ICONS: Record<string, LucideIcon> = {
  search: Search,
  "layout-grid": LayoutGrid,
  "code-2": Code2,
  "shield-check": ShieldCheck,
};

type Size = "sm" | "md";

type Props = {
  stage: AgentStage;
  size?: Size;
  showTagline?: boolean;
  className?: string;
};

export function AgentBadge({ stage, size = "md", showTagline = false, className }: Props) {
  const meta = AGENT_META[stage];
  const Icon = ICONS[meta.iconKey];
  const padding = size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm";
  const iconSize = size === "sm" ? 12 : 14;

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        meta.classes.chip,
        meta.classes.chipBorder,
        padding,
        className,
      )}
    >
      <Icon size={iconSize} strokeWidth={2.25} />
      <span>{meta.label} Agent</span>
      {showTagline && <span className="opacity-60 font-normal">· {meta.tagline}</span>}
    </span>
  );
}
