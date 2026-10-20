import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

const ALLOWED_DOMAIN = "@intercommerce.com.ph";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_NICKNAME_LEN = 24;

export async function POST(request: Request) {
  let body: {
    name?: unknown;
    nickname?: unknown;
    email?: unknown;
    department?: unknown;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const department =
    typeof body.department === "string" ? body.department.trim() : "";

  // Collapse repeated whitespace; empty becomes null
  const rawNickname =
    typeof body.nickname === "string"
      ? body.nickname.replace(/\s+/g, " ").trim()
      : "";
  const nickname = rawNickname ? rawNickname : null;

  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 }
    );
  }

  if (!email.endsWith(ALLOWED_DOMAIN)) {
    return NextResponse.json(
      { error: `Registration is limited to ${ALLOWED_DOMAIN} email addresses.` },
      { status: 400 }
    );
  }

  // Lookup mode: only the email was provided (returning registrant)
  if (!name && !department) {
    const { data: existing, error: lookupError } = await supabaseAdmin
      .from("registrations")
      .select("team")
      .eq("email", email)
      .maybeSingle();

    if (lookupError) {
      console.error("Supabase lookup error:", lookupError);
      return NextResponse.json(
        { error: "Something went wrong. Please try again." },
        { status: 500 }
      );
    }

    if (existing?.team) {
      return NextResponse.json(
        { success: true, team: existing.team, alreadyRegistered: true },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        error:
          "We couldn't find a registration for this email. Please fill in all fields to register.",
      },
      { status: 404 }
    );
  }

  // Registration mode: full details required
  if (!name) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }

  if (nickname && nickname.length > MAX_NICKNAME_LEN) {
    return NextResponse.json(
      { error: `Nicknames are limited to ${MAX_NICKNAME_LEN} characters.` },
      { status: 400 }
    );
  }

  if (!department) {
    return NextResponse.json(
      { error: "Please choose your department." },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin.rpc("register_with_random_team", {
    p_name: name,
    p_email: email,
    p_department: department,
    p_nickname: nickname,
  });

  if (error || !data) {
    console.error("Supabase rpc error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }

  const result = data as { team: string; already_registered: boolean };

  return NextResponse.json(
    {
      success: true,
      team: result.team,
      alreadyRegistered: result.already_registered,
    },
    { status: result.already_registered ? 200 : 201 }
  );
}