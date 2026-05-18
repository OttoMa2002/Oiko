import { createAdminClient } from "./supabase/admin";

type UsageRow = {
  total_calls: number;
  total_reviews: number;
};

async function readUsage(userId: string): Promise<UsageRow> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("user_usage")
    .select("total_calls, total_reviews")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) {
    console.error("readUsage error:", error);
    return { total_calls: 0, total_reviews: 0 };
  }
  return {
    total_calls: data?.total_calls ?? 0,
    total_reviews: data?.total_reviews ?? 0,
  };
}

/** Lifetime /api/chat call count for a user. */
export async function getUserCallCount(userId: string): Promise<number> {
  const { total_calls } = await readUsage(userId);
  return total_calls;
}

/** Lifetime /api/review call count for a user. */
export async function getUserReviewCount(userId: string): Promise<number> {
  const { total_reviews } = await readUsage(userId);
  return total_reviews;
}

/** Read both counters at once (fewer round trips on Dashboard). */
export async function getUserUsage(userId: string): Promise<UsageRow> {
  return readUsage(userId);
}

/** Atomic +1 to the user's lifetime call count. Returns new total. */
export async function incrementUserCalls(userId: string): Promise<number> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("increment_user_calls", {
    p_user_id: userId,
  });
  if (error) throw new Error(error.message);
  return data as number;
}

/** Atomic +1 to the user's lifetime review count. Returns new total. */
export async function incrementUserReviews(userId: string): Promise<number> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("increment_user_reviews", {
    p_user_id: userId,
  });
  if (error) throw new Error(error.message);
  return data as number;
}
