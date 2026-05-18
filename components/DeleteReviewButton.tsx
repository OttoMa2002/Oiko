"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteReview } from "@/app/actions/reviews";

type Props = {
  reviewId: string;
  url: string;
  /** Where to navigate after a successful delete. */
  redirectTo?: string;
};

export function DeleteReviewButton({ reviewId, url, redirectTo }: Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleClick() {
    if (isPending) return;
    if (!window.confirm(`确定删除审核记录 "${url}"？此操作不可恢复。`)) return;
    startTransition(async () => {
      try {
        await deleteReview(reviewId);
        if (redirectTo) {
          router.push(redirectTo);
          router.refresh();
        }
      } catch (e) {
        window.alert(e instanceof Error ? e.message : "删除失败");
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="inline-flex items-center gap-1 rounded-full border border-zinc-300 bg-white px-3 py-1 text-xs text-zinc-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors disabled:opacity-50"
    >
      <Trash2 size={12} />
      删除
    </button>
  );
}
