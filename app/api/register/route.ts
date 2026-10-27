import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { getAssignedTeam } from "@/lib/team-assignments";

const ALLOWED_DOMAIN = ["@intercommerce.com.ph", "@ictechnologies.ph"];
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

  // Team from the preassigned list (null if the email isn't on it)
  const assignedTeam = getAssignedTeam(email);

  // Allowed company domains, plus anyone on the preassigned list
  // (a few listed people use gmail/yahoo addresses)
  const domainAllowed = ALLOWED_DOMAIN.some((domain) => email.endsWith(domain));
  if (!domainAllowed && !assignedTeam) {
    return NextResponse.json(
      {
        error: `Registration is limited to ${ALLOWED_DOMAIN.join(" or ")} email addresses.`,
      },
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
      // The preassigned team wins, and fixes older randomly assigned rows
      const team = assignedTeam ?? existing.team;
      if (assignedTeam && existing.team !== assignedTeam) {
        await supabaseAdmin
          .from("registrations")
          .update({ team: assignedTeam })
          .eq("email", email);
      }

      return NextResponse.json(
        { success: true, team, alreadyRegistered: true },
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

  // Preassigned employee: use their assigned team, no random draw
  if (assignedTeam) {
    const { data: existing, error: existingError } = await supabaseAdmin
      .from("registrations")
      .select("team")
      .eq("email", email)
      .maybeSingle();

    if (existingError) {
      console.error("Supabase lookup error:", existingError);
      return NextResponse.json(
        { error: "Something went wrong. Please try again." },
        { status: 500 }
      );
    }

    if (existing) {
      if (existing.team !== assignedTeam) {
        await supabaseAdmin
          .from("registrations")
          .update({ team: assignedTeam })
          .eq("email", email);
      }
      return NextResponse.json(
        { success: true, team: assignedTeam, alreadyRegistered: true },
        { status: 200 }
      );
    }

    const { error: insertError } = await supabaseAdmin
      .from("registrations")
      .insert({
        name,
        email,
        department,
        nickname,
        team: assignedTeam,
      });

    if (insertError) {
      // 23505 = unique violation: they registered a moment ago in another tab
      if (insertError.code === "23505") {
        return NextResponse.json(
          { success: true, team: assignedTeam, alreadyRegistered: true },
          { status: 200 }
        );
      }
      console.error("Supabase insert error:", insertError);
      return NextResponse.json(
        { error: "Something went wrong. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, team: assignedTeam, alreadyRegistered: false },
      { status: 201 }
    );
  }

  // Not on the preassigned list: fall back to the random team draw
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