import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { findEmployee } from "@/lib/employees";
import { REACTIONS } from "@/lib/reactions";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let body: { email?: string; emoji?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const emoji = body.emoji ?? "";
  if (!(REACTIONS as readonly string[]).includes(emoji)) {
    return NextResponse.json({ error: "Invalid reaction." }, { status: 400 });
  }

  const employee = await findEmployee(body.email ?? "");
  if (!employee) {
    return NextResponse.json(
      { error: "Only registered employees can react." },
      { status: 403 }
    );
  }

  const { data: existing } = await supabaseAdmin
    .from("thought_reactions")
    .select("emoji")
    .eq("thought_id", id)
    .eq("email", employee.email)
    .maybeSingle();

  let myReaction: string | null = emoji;

  if (existing && existing.emoji === emoji) {
    // Same emoji again = remove the reaction
    await supabaseAdmin
      .from("thought_reactions")
      .delete()
      .eq("thought_id", id)
      .eq("email", employee.email);
    myReaction = null;
  } else if (existing) {
    await supabaseAdmin
      .from("thought_reactions")
      .update({ emoji })
      .eq("thought_id", id)
      .eq("email", employee.email);
  } else {
    const { error } = await supabaseAdmin
      .from("thought_reactions")
      .insert({ thought_id: id, email: employee.email, emoji });
    if (error) {
      return NextResponse.json(
        { error: "Could not save your reaction." },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ myReaction });
}