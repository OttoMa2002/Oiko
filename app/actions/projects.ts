"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { AgentStage } from "@/lib/agents";
import type {
  ChatMessage,
  Outputs,
  ProjectRow,
  ProjectStatus,
} from "@/lib/types";

function todayIso() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

/** Create a new project for the current user, returning its id. */
export async function createProject(): Promise<{ id: string }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("未登录");

  const name = `Untitled · ${todayIso()}`;
  const { data, error } = await supabase
    .from("projects")
    .insert({ user_id: user.id, name })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return { id: data.id };
}

/** Read a single project; returns null if not found or not owned. */
export async function getProject(id: string): Promise<ProjectRow | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  // RLS already enforces user_id match, but be defensive.
  if (data.user_id !== user.id) return null;

  return data as ProjectRow;
}

export type ProjectPatch = {
  name?: string;
  initialPrompt?: string | null;
  outputs?: Outputs;
  agentHistory?: ChatMessage[];
  generatedHtml?: string | null;
  currentStage?: AgentStage;
  completedStages?: AgentStage[];
  done?: boolean;
  iterations?: number;
  status?: ProjectStatus;
};

/** Patch a project. Sent from the workspace after each agent interaction. */
export async function updateProject(id: string, patch: ProjectPatch): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("未登录");

  const dbPatch: Record<string, unknown> = {};
  if (patch.name !== undefined) dbPatch.name = patch.name;
  if (patch.initialPrompt !== undefined) dbPatch.initial_prompt = patch.initialPrompt;
  if (patch.outputs !== undefined) dbPatch.outputs = patch.outputs;
  if (patch.agentHistory !== undefined) {
    // Strip transient thinking entries before persisting.
    dbPatch.agent_history = patch.agentHistory.filter((m) => !m.thinking);
  }
  if (patch.generatedHtml !== undefined) dbPatch.generated_html = patch.generatedHtml;
  if (patch.currentStage !== undefined) dbPatch.current_stage = patch.currentStage;
  if (patch.completedStages !== undefined) dbPatch.completed_stages = patch.completedStages;
  if (patch.done !== undefined) {
    dbPatch.done = patch.done;
    dbPatch.status = patch.done ? "completed" : "draft";
  }
  if (patch.iterations !== undefined) dbPatch.iterations = patch.iterations;
  if (patch.status !== undefined) dbPatch.status = patch.status;

  if (Object.keys(dbPatch).length === 0) return;

  const { error } = await supabase
    .from("projects")
    .update(dbPatch)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
}

/** Delete a project (cascade also clears related rows if any). */
export async function deleteProject(id: string): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("未登录");

  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
}
