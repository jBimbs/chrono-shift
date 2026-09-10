import { NextRequest, NextResponse } from "next/server";

const ALLOWED_DOMAIN = "@intercommerce.com.ph";
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export async function POST(request: NextRequest) {
  let body: { name?: unknown; email?: unknown };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!name) {
    return NextResponse.json(
      { error: "Full name is required." },
      { status: 400 }
    );
  }

  if (!email || !EMAIL_REGEX.test(email)) {
    return NextResponse.json(
      { error: "A valid email address is required." },
      { status: 400 }
    );
  }

  if (!email.endsWith(ALLOWED_DOMAIN)) {
    return NextResponse.json(
      { error: `Registration is limited to ${ALLOWED_DOMAIN} email addresses.` },
      { status: 403 }
    );
  }

  // TODO: persist the registration once storage is decided (database, sheet, email, etc.)
  // For now, just acknowledge a valid submission.
  console.log("New registration:", { name, email });

  return NextResponse.json({ success: true });
}