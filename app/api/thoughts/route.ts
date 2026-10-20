import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { findEmployee } from "@/lib/employees";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 15;
const MAX_LEN = 280;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const email = (url.searchParams.get("email") ?? "").trim().toLowerCase();
  const before = url.searchParams.get("before");

  let query = supabaseAdmin
    .from("thoughts")
    .select("id, message, team, author, image_url, created_at")
    .order("created_at", { ascending: false })
    .limit(PAGE_SIZE + 1);

  if (before) query = query.lt("created_at", before);

  const { data: rows, error } = await query;
  if (error) {
    console.error("[thoughts GET] thoughts query failed:", error);
    return NextResponse.json(
      { error: "Could not load the wall." },
      { status: 500 }
    );
  }

  const hasMore = (rows?.length ?? 0) > PAGE_SIZE;
  const page = (rows ?? []).slice(0, PAGE_SIZE);
  const ids = page.map((r) => r.id);

  const reactionsByThought = new Map<string, Record<string, number>>();
  const myReactionByThought = new Map<string, string>();
  const commentCounts = new Map<string, number>();

  if (ids.length > 0) {
    const [reactionsRes, commentsRes] = await Promise.all([
      supabaseAdmin
        .from("thought_reactions")
        .select("thought_id, email, emoji")
        .in("thought_id", ids),
      supabaseAdmin
        .from("thought_comments")
        .select("thought_id")
        .in("thought_id", ids),
    ]);

    if (reactionsRes.error) {
      console.error("[thoughts GET] reactions query failed:", reactionsRes.error);
    }
    if (commentsRes.error) {
      console.error("[thoughts GET] comments query failed:", commentsRes.error);
    }

    for (const r of reactionsRes.data ?? []) {
      const counts = reactionsByThought.get(r.thought_id) ?? {};
      counts[r.emoji] = (counts[r.emoji] ?? 0) + 1;
      reactionsByThought.set(r.thought_id, counts);
      if (email && r.email === email) {
        myReactionByThought.set(r.thought_id, r.emoji);
      }
    }

    for (const c of commentsRes.data ?? []) {
      commentCounts.set(c.thought_id, (commentCounts.get(c.thought_id) ?? 0) + 1);
    }
  }

  const thoughts = page.map((r) => ({
    id: r.id,
    message: r.message,
    team: r.team,
    author: r.author,
    imageUrl: r.image_url ?? null,
    createdAt: r.created_at,
    reactions: reactionsByThought.get(r.id) ?? {},
    myReaction: myReactionByThought.get(r.id) ?? null,
    commentCount: commentCounts.get(r.id) ?? 0,
  }));

  return NextResponse.json({ thoughts, hasMore });
}

export async function POST(req: Request) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = String(form.get("email") ?? "");
  const message = String(form.get("message") ?? "").trim();
  const image = form.get("image");

  if (!message) {
    return NextResponse.json(
      { error: "Write something first." },
      { status: 400 }
    );
  }
  if (message.length > MAX_LEN) {
    return NextResponse.json(
      { error: `Keep it under ${MAX_LEN} characters.` },
      { status: 400 }
    );
  }

  const employee = await findEmployee(email);
  if (!employee) {
    return NextResponse.json(
      { error: "Only registered employees can post." },
      { status: 403 }
    );
  }

  let imageUrl: string | null = null;

  if (image instanceof File && image.size > 0) {
    const ext = IMAGE_TYPES[image.type];
    if (!ext) {
      return NextResponse.json(
        { error: "Images must be JPG, PNG, WEBP or GIF." },
        { status: 400 }
      );
    }
    if (image.size > MAX_IMAGE_BYTES) {
      return NextResponse.json(
        { error: "Image is too large (5MB max)." },
        { status: 400 }
      );
    }

    const path = `${new Date().getFullYear()}/${crypto.randomUUID()}.${ext}`;
    const buffer = Buffer.from(await image.arrayBuffer());

    const { error: uploadError } = await supabaseAdmin.storage
      .from("wall-images")
      .upload(path, buffer, { contentType: image.type, upsert: false });

    if (uploadError) {
      console.error("[thoughts POST] image upload failed:", uploadError);
      return NextResponse.json(
        { error: "Could not upload the image." },
        { status: 500 }
      );
    }

    imageUrl = supabaseAdmin.storage.from("wall-images").getPublicUrl(path)
      .data.publicUrl;
  }

  const { data, error } = await supabaseAdmin
    .from("thoughts")
    .insert({
      message,
      team: employee.team,
      author: employee.author,
      image_url: imageUrl,
    })
    .select("id, message, team, author, image_url, created_at")
    .single();

  if (error || !data) {
    console.error("[thoughts POST] insert failed:", error);
    return NextResponse.json(
      { error: "Could not post your thought." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    thought: {
      id: data.id,
      message: data.message,
      team: data.team,
      author: data.author,
      imageUrl: data.image_url ?? null,
      createdAt: data.created_at,
      reactions: {},
      myReaction: null,
      commentCount: 0,
    },
  });
}