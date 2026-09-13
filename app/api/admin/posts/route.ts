import { NextRequest, NextResponse } from "next/server";
import { createPost, isSlugTaken, findOrCreateAuthorByName, findOrCreateCategoryByName } from "@/lib/admin-posts";

interface CategoryInput {
  name: string;
  isPrimary: boolean;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const { title, slug, excerpt, content, status, authorName, categories, featuredMediaId } = body;
  if (
    typeof title !== "string" || !title.trim() ||
    typeof slug !== "string" || !slug.trim() ||
    typeof content !== "string" || !content.trim() ||
    typeof authorName !== "string" || !authorName.trim() ||
    !Array.isArray(categories) || categories.length === 0
  ) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  const cats = categories as CategoryInput[];
  if (!cats.every((c) => typeof c?.name === "string" && c.name.trim())) {
    return NextResponse.json({ error: "Every category needs a name" }, { status: 400 });
  }
  const primaryCats = cats.filter((c) => c.isPrimary);
  if (primaryCats.length !== 1) {
    return NextResponse.json({ error: "Exactly one category must be marked primary" }, { status: 400 });
  }
  if (status !== "published" && status !== "draft") {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }
  // Re-check server-side - the client's own check (debounced, best-effort) is
  // just UX; this is what actually prevents a race between two conflicting saves.
  if (await isSlugTaken(slug)) {
    return NextResponse.json({ error: "Slug already in use" }, { status: 409 });
  }

  // Resolve typed names to real rows, creating them if they don't exist yet -
  // the admin form's author/category fields are writable-with-suggestions,
  // not a closed dropdown, so either can be a brand-new value.
  const authorId = await findOrCreateAuthorByName(authorName);
  const resolvedByName = new Map<string, { id: string; slug: string }>();
  for (const c of cats) {
    const key = c.name.trim().toLowerCase();
    if (!resolvedByName.has(key)) {
      resolvedByName.set(key, await findOrCreateCategoryByName(c.name));
    }
  }
  const categoryIds = [...new Set(cats.map((c) => resolvedByName.get(c.name.trim().toLowerCase())!.id))];
  const primaryCategoryId = resolvedByName.get(primaryCats[0].name.trim().toLowerCase())!.id;

  const post = await createPost({
    title: title.trim(),
    slug: slug.trim(),
    excerpt: typeof excerpt === "string" ? excerpt.trim() : undefined,
    content,
    status,
    authorId,
    categoryIds,
    primaryCategoryId,
    featuredMediaId: featuredMediaId ? String(featuredMediaId) : undefined,
  });
  return NextResponse.json({ ok: true, post });
}
