import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { findEmployee } from "@/lib/employees";

export const dynamic = "force-dynamic";

const MAX_COMMENT = 300;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { data, error } = await supabaseAdmin
    .from("thought_comments")
    .select("id, message, author, team, created_at")
    .eq("thought_id", id)
    .order("created_at", { ascending: true })
    .limit(200);

  if (error) {
    return NextResponse.json(
      { error: "Could not load comments." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    comments: (data ?? []).map((c) => ({
      id: c.id,
      message: c.message,
      author: c.author,
      team: c.team,
      createdAt: c.created_at,
    })),
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let body: { email?: string; message?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const message = (body.message ?? "").trim();
  if (!message) {
    return NextResponse.json(
      { error: "Write a comment first." },
      { status: 400 }
    );
  }
  if (message.length > MAX_COMMENT) {
    return NextResponse.json(
      { error: `Keep it under ${MAX_COMMENT} characters.` },
      { status: 400 }
    );
  }

  const employee = await findEmployee(body.email ?? "");
  if (!employee) {
    return NextResponse.json(
      { error: "Only registered employees can comment." },
      { status: 403 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("thought_comments")
    .insert({
      thought_id: id,
      email: employee.email,
      author: employee.author,
      team: employee.team,
      message,
    })
    .select("id, message, author, team, created_at")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Could not post your comment." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    comment: {
      id: data.id,
      message: data.message,
      author: data.author,
      team: data.team,
      createdAt: data.created_at,
    },
  });
}