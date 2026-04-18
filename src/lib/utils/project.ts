import { SupabaseClient } from "@supabase/supabase-js";

export async function getProjectForUser(supabase: SupabaseClient) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("projects")
    .select("*")
    .eq("client_id", user.id)
    .single();

  return data ?? null;
}
