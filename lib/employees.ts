import { supabaseAdmin } from "@/lib/supabase-server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type Employee = {
  email: string;
  author: string;
  team: string | null;
};

// Returns the registered employee for an email, or null if not registered
export async function findEmployee(rawEmail: string): Promise<Employee | null> {
  const email = rawEmail.trim().toLowerCase();
  if (!EMAIL_RE.test(email)) return null;

  const { data, error } = await supabaseAdmin
    .from("registrations")
    .select("nickname, name, team")
    .eq("email", email)
    .maybeSingle();

  if (error || !data) return null;

  return {
    email,
    author: data.nickname || data.name || "Anonymous",
    team: data.team ?? null,
  };
}