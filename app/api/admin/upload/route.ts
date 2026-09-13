import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { insertMedia } from "@/lib/admin-posts";

const ALLOWED_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};
const MAX_BYTES = 8 * 1024 * 1024; // 8MB

export async function POST(req: NextRequest) {
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }
  const ext = ALLOWED_MIME[file.type];
  if (!ext) {
    return NextResponse.json({ error: "Unsupported image type" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image too large (max 8MB)" }, { status: 400 });
  }

  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const relPath = `admin/${safeName}`;
  // Writes into the app's own public/ dir, same convention as the WP media
  // dump (WP_UPLOADS_BASE in lib/posts.ts) so the existing coverImage render
  // path needs zero changes. Works in local dev and on the eventual
  // self-hosted VPS (plan.md's real target) - NOT on Vercel, whose serverless
  // filesystem is read-only outside /tmp. Revisit if this admin panel needs
  // to go live before the VPS cutover happens.
  const uploadsDir = path.join(process.cwd(), "public", "wp-content", "uploads", "admin");
  await mkdir(uploadsDir, { recursive: true });
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadsDir, safeName), bytes);

  const mediaId = await insertMedia({ path: relPath, mime: file.type });
  return NextResponse.json({ ok: true, mediaId, path: relPath, url: `/wp-content/uploads/${relPath}` });
}
