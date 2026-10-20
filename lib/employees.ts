import { supabaseAdmin } from "@/lib/supabase-server";

const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@intercommerce\.com\.ph$/i;

export function isCompanyEmail(email: string) {
  return EMAIL_RE.test(email);
}

export type Employee = {
  email: string;
  author: string;
  team: string | null;
};

// Returns the registered employee for an email, or null if not registered
export async function findEmployee(rawEmail: string): Promise<Employee | null> {
  const email = rawEmail.trim().toLowerCase();
  if (!isCompanyEmail(email)) return null;

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