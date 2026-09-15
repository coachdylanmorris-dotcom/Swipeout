import { supabase } from "@/lib/supabase";
import type { Role } from "@/lib/types";

// Where a logged-in user should land: their main screen if they've
// finished onboarding, otherwise the onboarding form for their role.
export async function resolveHomePath(
  userId: string,
  role: Role,
): Promise<string> {
  if (role === "agent") {
    const { data } = await supabase
      .from("agent_profiles")
      .select("id")
      .eq("id", userId)
      .maybeSingle();
    return data ? "/agent" : "/agent/onboarding";
  }

  const { data } = await supabase
    .from("buyer_profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();
  return data ? "/buyer" : "/buyer/onboarding";
}
