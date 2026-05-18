"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Review } from "@/lib/types";

/** Fetch a single review; returns null if not found or not owned. */
export async function getReview(id: string): Promise<Review | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  if (data.user_id !== user.id) return null;

  return data as Review;
}

/** Delete a review (RLS already enforces user_id match). */
export async function deleteReview(id: string): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("未登录");

  const { error } = await supabase
    .from("reviews")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
}
