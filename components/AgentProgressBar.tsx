"use client";

import { Check } from "lucide-react";
import clsx from "clsx";
import type { AgentStage } from "@/lib/agents";
import { AGENT_META, BUILD_STAGES } from "@/lib/agents";

type Props = {
  currentStage: AgentStage;
  completedStages: AgentStage[];
  done: boolean;
  /**
   * Called when the user clicks an already-reached stage chip.
   * Workspace decides whether to allow the switch (e.g. ignore during
   * an in-flight agent call). Omit to make the bar read-only.
   */
  onStageClick?: (stage: AgentStage) => void;
};

export function AgentProgressBar({
  currentStage,
  completedStages,
  done,
  onStageClick,
}: Props) {
  return (
    <div className="flex items-center gap-3 md:gap-4 w-full overflow-x-auto py-1.5">
      {BUILD_STAGES.map((stage, idx) => {
        const meta = AGENT_META[stage];
        // Three mutually exclusive visual states.
        // isCurrent wins over isDone — if the user is back on an already-
        // completed stage editing it, the chip should look "active", not
        // "checked off". This makes "where am I right now" unambiguous.
        const isCurrent = !done && stage === currentStage;
        const isDone =
          !isCurrent && (completedStages.includes(stage) || done);
        const isPending = !isCurrent && !isDone;
        const canSwitchTo = isDone && !!onStageClick;

        const chipBody = (
          <>
            <div
              className={clsx(
                "h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300",
                isDone && "bg-zinc-900 text-white",
                isCurrent &&
                  clsx(meta.classes.bar, "text-white ring-4", meta.classes.ring),
                isPending && "bg-zinc-200 text-zinc-500",
              )}
            >
              {isDone ? <Check size={14} strokeWidth={3} /> : idx + 1}
            </div>
            <span
              className={clsx(
                "text-sm font-medium transition-colors duration-300",
                isCurrent && meta.classes.accentText,
                isDone && "text-zinc-900",
                isPending && "text-zinc-400",
              )}
            >
              {meta.label}
            </span>
          </>
        );

        return (
          <div
            key={stage}
            className="flex items-center gap-3 md:gap-4 flex-shrink-0"
          >
            {canSwitchTo ? (
              <button
                type="button"
                onClick={() => onStageClick!(stage)}
                title={`切回 ${meta.label} Agent`}
                className="flex items-center gap-2 bg-transparent border-0 p-0 cursor-pointer hover:opacity-75 transition-opacity"
              >
                {chipBody}
              </button>
            ) : (
              <div className="flex items-center gap-2">{chipBody}</div>
            )}
            {idx < BUILD_STAGES.length - 1 && (
              <div
                className={clsx(
                  "h-px w-8 md:w-16 transition-colors duration-300",
                  isDone ? "bg-zinc-900" : "bg-zinc-200",
                )}
              />
            )}
          </div>
        );
      })}
      <div className="flex items-center gap-3 md:gap-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div
            className={clsx(
              "h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300",
              done ? "bg-zinc-900 text-white" : "bg-zinc-200 text-zinc-500",
            )}
          >
            {done ? <Check size={14} strokeWidth={3} /> : BUILD_STAGES.length + 1}
          </div>
          <span
            className={clsx(
              "text-sm font-medium transition-colors duration-300",
              done ? "text-zinc-900" : "text-zinc-400",
            )}
          >
            完成
          </span>
        </div>
      </div>
    </div>
  );
}