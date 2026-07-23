import { createClient } from "@supabase/supabase-js";
import type { ToolContext } from "@lovable.dev/mcp-js";

export function supabaseForUser(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function assertAdminOrManager(ctx: ToolContext) {
  if (!ctx.isAuthenticated()) return "Not authenticated";
  const client = supabaseForUser(ctx);
  const uid = ctx.getUserId();
  const { data, error } = await client
    .from("user_roles")
    .select("role")
    .eq("user_id", uid);
  if (error) return error.message;
  const roles = (data ?? []).map((r: { role: string }) => r.role);
  if (!roles.includes("admin") && !roles.includes("manager")) {
    return "Forbidden: admin or manager role required";
  }
  return null;
}
