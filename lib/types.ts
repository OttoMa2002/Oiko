import type { AgentStage } from "./agents";

export type ProjectStatus = "draft" | "completed";

export type ChatMessage = {
  role: "user" | "assistant";
  stage: AgentStage;
  content: string;
  created_at: string;
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

export type Project = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  generated_html: string | null;
  agent_history: ChatMessage[];
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