/**
 * Account-level resource caps. Enforced server-side in API routes and
 * server actions; client UI shows usage but cannot bypass.
 */

/** Max lifetime successful /api/chat calls per account (≈ $1 of Anthropic spend). */
export const MAX_API_CALLS_PER_USER = 50;

/** Max active projects per account (UX guard, not cost guard). */
export const MAX_PROJECTS_PER_USER = 5;

/** Sentinel error message thrown by createProject when the project cap is hit. */
export const PROJECT_CAP_ERROR = "PROJECT_CAP_REACHED";
