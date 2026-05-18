import { redirect } from "next/navigation";
import { getProject } from "@/app/actions/projects";
import {
  WorkspaceClient,
  type WorkspaceInitialState,
} from "./workspace-client";

export default async function WorkspacePage({
  params,
}: {
  params: { id: string };
}) {
  const project = await getProject(params.id);

  if (!project) {
    redirect("/dashboard?error=project-not-found");
  }

  const initialState: WorkspaceInitialState = {
    projectId: project.id,
    projectName: project.name,
    initialPrompt: project.initial_prompt,
    outputs: project.outputs ?? {},
    agentHistory: project.agent_history ?? [],
    generatedHtml: project.generated_html,
    currentStage: project.current_stage,
    completedStages: project.completed_stages ?? [],
    done: project.done,
    iterations: project.iterations,
  };

  return <WorkspaceClient initialState={initialState} />;
}
