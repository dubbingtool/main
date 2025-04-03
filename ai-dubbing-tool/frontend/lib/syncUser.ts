import { supabase } from "./supabaseClient";

export async function syncUser(session: any) {
  const email = session?.user?.email;
  const name = session?.user?.name;
  const avatar_url = session?.user?.image;

  if (!email) return;

  const { data, error } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .single();

  if (!data) {
    await supabase.from("users").insert([
      {
        email,
        name,
        avatar_url,
      },
    ]);
  }
}
