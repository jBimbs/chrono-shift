import { NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "crypto";
import { supabaseAdmin } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

const EARLY_BIRD_COUNT = 10;

function safeEqual(a: string, b: string) {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export async function POST(request: Request) {
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD is not configured on the server." },
      { status: 500 }
    );
  }

  let body: { password?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const password = typeof body.password === "string" ? body.password : "";

  if (!safeEqual(password, adminPassword)) {
    // small delay slows down password guessing
    await new Promise((resolve) => setTimeout(resolve, 800));
    return NextResponse.json({ error: "Wrong password." }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("registrations")
    .select("name, nickname, email, department, team, created_at")
    .order("created_at", { ascending: true })
    .limit(EARLY_BIRD_COUNT);

  const { count } = await supabaseAdmin
    .from("registrations")
    .select("id", { count: "exact", head: true });

  if (error) {
    console.error("Early birds error:", error);
    return NextResponse.json(
      { error: "Could not load registrations." },
      { status: 500 }
    );
  }

  return NextResponse.json({ earlyBirds: data, total: count ?? data.length });
}