import { createAdminClient } from "./supabase/admin";

/**
 * Read the lifetime /api/chat call count for a user. Returns 0 if the user
 * has no usage row yet. Uses service_role to bypass RLS so we don't need
 * the user's auth context.
 */
export async function getUserCallCount(userId: string): Promise<number> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("user_usage")
    .select("total_calls")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) {
    console.error("getUserCallCount error:", error);
    return 0;
  }
  return data?.total_calls ?? 0;
}

/**
 * Atomically increment a user's lifetime call count by 1. Returns the new
 * total. Uses the `increment_user_calls` Postgres function so concurrent
 * calls can't race past the cap.
 */
export async function incrementUserCalls(userId: string): Promise<number> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("increment_user_calls", {
    p_user_id: userId,
  });
  if (error) throw new Error(error.message);
  return data as number;
}
