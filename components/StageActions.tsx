"use client";

import { Check } from "lucide-react";
import clsx from "clsx";
import type { AgentStage } from "@/lib/agents";
import { AGENT_META } from "@/lib/agents";

type Props = {
  stage: AgentStage;
  disabled?: boolean;
  onConfirm: () => void;
};

export function StageActions({ stage, disabled, onConfirm }: Props) {
  const meta = AGENT_META[stage];

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={disabled}
        onClick={onConfirm}
        className={clsx(
          "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium text-white transition-opacity",
          meta.classes.bar,
          disabled ? "opacity-40 cursor-not-allowed" : "hover:opacity-90",
        )}
      >
        <Check size={14} strokeWidth={2.5} />
        确认，进入下一阶段
      </button>
    </div>
  );
}