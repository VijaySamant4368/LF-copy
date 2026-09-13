import { NextRequest, NextResponse } from "next/server";
import { isSlugTaken } from "@/lib/admin-posts";

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug")?.trim();
  if (!slug) return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  const taken = await isSlugTaken(slug);
  return NextResponse.json({ taken });
}
