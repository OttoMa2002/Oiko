import type { AgentStage } from "./agents";

export type ProjectStatus = "draft" | "completed";

export type Outputs = Partial<Record<AgentStage, string>>;

/**
 * Chat message used both for live UI and as the serialized shape inside
 * the `agent_history` jsonb column. `thinking` is transient and never
 * persisted (we strip thinking-true entries before saving).
 */
export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  stage: AgentStage;
  content: string;
  thinking?: boolean;
};

export type ArchitectureSpec = {
  sections: string[];
  navigation: string[];
  color_scheme: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
  style: string;
};

/** Mirror of the public.projects row in Supabase. */
export type ProjectRow = {
  id: string;
  user_id: string;
  name: string;
  initial_prompt: string | null;
  outputs: Outputs;
  agent_history: ChatMessage[];
  generated_html: string | null;
  current_stage: AgentStage;
  completed_stages: AgentStage[];
  done: boolean;
  iterations: number;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
};

export type ReviewContext = {
  direction: string;
  audience: string;
  goals: string;
};

export type ReviewReport = {
  overall_score: number;
  structure: { score: number; feedback: string };
  content: { score: number; feedback: string };
  ux: { score: number; feedback: string };
  seo: { score: number; feedback: string };
  improvements: string[];
};

export type Review = {
  id: string;
  user_id: string;
  url: string;
  context: ReviewContext;
  report: ReviewReport;
  created_at: string;
};
