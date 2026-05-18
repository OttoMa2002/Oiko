"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { AgentStage } from "@/lib/agents";
import { MAX_PROJECTS_PER_USER, PROJECT_CAP_ERROR } from "@/lib/limits";
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
export async function createProject(
  initialPrompt?: string | null,
): Promise<{ id: string }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("未登录");

  // Enforce account-level project cap before insert.
  const { count } = await supabase
    .from("projects")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  if ((count ?? 0) >= MAX_PROJECTS_PER_USER) {
    throw new Error(PROJECT_CAP_ERROR);
  }

  const name = `Untitled · ${todayIso()}`;
  const trimmed = initialPrompt?.trim() || null;
  const { data, error } = await supabase
    .from("projects")
    .insert({ user_id: user.id, name, initial_prompt: trimmed })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return { id: data.id };
}

/**
 * Form-action helper: create a new project then redirect into its workspace.
 * On project-cap hit, redirects back to dashboard with an error banner.
 * Reads optional `prompt` field from FormData — used by landing-page example
 * cards to pre-fill the project. Dashboard "新建项目" button passes no FormData
 * and creates an empty project.
 */
export async function startNewProjectAction(formData?: FormData): Promise<never> {
  const prompt = formData?.get("prompt");
  const initialPrompt = typeof prompt === "string" ? prompt : null;

  let newId: string;
  try {
    const result = await createProject(initialPrompt);
    newId = result.id;
  } catch (e) {
    if (e instanceof Error && e.message === PROJECT_CAP_ERROR) {
      redirect("/dashboard?error=project-cap-reached");
    }
    throw e;
  }
  redirect(`/workspace/${newId}`);
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
