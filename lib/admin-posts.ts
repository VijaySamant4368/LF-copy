// Admin-only queries: writes, and reads that need every status (not just
// 'published') or plain author/category lists for form dropdowns. Kept out of
// lib/posts.ts (the public read layer) since these have no public caller and
// most of them mutate.
import { query } from "./db";
import { slugify } from "./slugify";

export interface AdminAuthor {
  id: string;
  name: string;
}

export interface AdminPostRow {
  id: string;
  title: string;
  slug: string;
  status: "published" | "draft" | "private";
  categoryName: string | null;
  categorySlug: string | null;
  authorName: string;
  publishedAt: string | null;
  updatedAt: string;
}

const ADMIN_PAGE_SIZE = 20;

export async function getAdminPosts(page: number): Promise<{ posts: AdminPostRow[]; totalPages: number; total: number }> {
  const offset = (Math.max(1, page) - 1) * ADMIN_PAGE_SIZE;
  const [{ rows }, { rows: countRows }] = await Promise.all([
    query<{
      id: number;
      title: string;
      slug: string;
      status: string;
      category_name: string | null;
      category_slug: string | null;
      author_name: string | null;
      published_at: string | null;
      updated_at: string;
    }>(
      `SELECT p.id, p.title, p.slug, p.status,
              c.name AS category_name, c.slug AS category_slug,
              a.display_name AS author_name, p.published_at, p.updated_at
       FROM posts p
       LEFT JOIN categories c ON c.id = p.primary_category_id
       LEFT JOIN authors a ON a.id = p.author_id
       ORDER BY p.updated_at DESC
       LIMIT $1 OFFSET $2`,
      [ADMIN_PAGE_SIZE, offset]
    ),
    query<{ count: string }>(`SELECT count(*) FROM posts`),
  ]);
  const total = Number(countRows[0]?.count ?? 0);
  return {
    posts: rows.map((r) => ({
      id: String(r.id),
      title: r.title,
      slug: r.slug,
      status: r.status as AdminPostRow["status"],
      categoryName: r.category_name,
      categorySlug: r.category_slug,
      authorName: r.author_name ?? "Unknown",
      publishedAt: r.published_at,
      updatedAt: r.updated_at,
    })),
    totalPages: Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE)),
    total,
  };
}

export async function getAuthorsList(): Promise<AdminAuthor[]> {
  const { rows } = await query<{ id: number; display_name: string }>(
    `SELECT id, display_name FROM authors ORDER BY display_name`
  );
  return rows.map((r) => ({ id: String(r.id), name: r.display_name }));
}

async function uniqueSlug(table: "authors" | "categories", base: string): Promise<string> {
  let candidate = base || "untitled";
  let n = 2;
  // Small table, admin-driven (not a hot path) - a loop is fine over a
  // cleverer single query.
  while ((await query(`SELECT 1 FROM ${table} WHERE slug = $1`, [candidate])).rows.length > 0) {
    candidate = `${base}-${n++}`;
  }
  return candidate;
}

// Author field is writable-with-suggestions (input+datalist in the UI): the
// name typed may already exist, or be brand new. Match case-insensitively so
// re-picking "Jane Doe" from the datalist doesn't spawn a duplicate row.
export async function findOrCreateAuthorByName(name: string): Promise<string> {
  const trimmed = name.trim();
  const { rows } = await query<{ id: number }>(`SELECT id FROM authors WHERE lower(display_name) = lower($1) LIMIT 1`, [
    trimmed,
  ]);
  if (rows[0]) return String(rows[0].id);

  const slug = await uniqueSlug("authors", slugify(trimmed));
  const wpId = -Date.now();
  const { rows: inserted } = await query<{ id: number }>(
    `INSERT INTO authors (wp_id, slug, display_name) VALUES ($1, $2, $3) RETURNING id`,
    [wpId, slug, trimmed]
  );
  return String(inserted[0].id);
}

// Same idea for categories, plus a default pill color since color has no
// WP source (schema.appext.sql - app-owned, editorial choice).
const NEW_CATEGORY_COLOR = "#111827";

export async function findOrCreateCategoryByName(name: string): Promise<{ id: string; slug: string }> {
  const trimmed = name.trim();
  const { rows } = await query<{ id: number; slug: string }>(
    `SELECT id, slug FROM categories WHERE lower(name) = lower($1) LIMIT 1`,
    [trimmed]
  );
  if (rows[0]) return { id: String(rows[0].id), slug: rows[0].slug };

  const slug = await uniqueSlug("categories", slugify(trimmed));
  const wpTermId = -Date.now();
  const { rows: inserted } = await query<{ id: number; slug: string }>(
    `INSERT INTO categories (wp_term_id, slug, name, color) VALUES ($1, $2, $3, $4) RETURNING id, slug`,
    [wpTermId, slug, trimmed, NEW_CATEGORY_COLOR]
  );
  return { id: String(inserted[0].id), slug: inserted[0].slug };
}

// DB only enforces uniqueness among published posts (posts_slug_live, a partial
// index - schema.sql: "slug only needs to be unique among live posts; drafts
// may collide"). Checking against ALL posts here is stricter than the DB
// requires, on purpose: two drafts silently sharing a slug is confusing even
// though Postgres would allow it.
export async function isSlugTaken(slug: string): Promise<boolean> {
  const { rows } = await query(`SELECT 1 FROM posts WHERE slug = $1 LIMIT 1`, [slug]);
  return rows.length > 0;
}

export async function insertMedia(opts: { path: string; mime: string; width?: number; height?: number }): Promise<string> {
  // Real WP media all have positive wp_id (imported from wp_posts.ID); negative
  // epoch-ms guarantees no collision without a second sequence.
  const wpId = -Date.now();
  const { rows } = await query<{ id: number }>(
    `INSERT INTO media (wp_id, path, mime, width, height, uploaded_at)
     VALUES ($1, $2, $3, $4, $5, now())
     RETURNING id`,
    [wpId, opts.path, opts.mime, opts.width ?? null, opts.height ?? null]
  );
  return String(rows[0].id);
}

export async function createPost(opts: {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  status: "published" | "draft";
  authorId: string;
  // Every category this post belongs to (post_categories, the real
  // many-to-many set) - exactly one flagged primary, which becomes
  // posts.primary_category_id and therefore the post's URL prefix.
  categoryIds: string[];
  primaryCategoryId: string;
  featuredMediaId?: string;
}): Promise<{ id: string; slug: string; categorySlug: string }> {
  const wpId = -Date.now();
  const publishedAt = opts.status === "published" ? new Date() : null;
  const { rows } = await query<{ id: number }>(
    `INSERT INTO posts (wp_id, slug, title, excerpt, content, status, author_id, primary_category_id, featured_media_id, published_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     RETURNING id`,
    [
      wpId,
      opts.slug,
      opts.title,
      opts.excerpt || null,
      opts.content,
      opts.status,
      opts.authorId,
      opts.primaryCategoryId,
      opts.featuredMediaId ?? null,
      publishedAt,
    ]
  );
  const postId = rows[0].id;
  // Every selected category goes into the junction table, not just the
  // primary one - this is the actual multi-category assignment. Rendering
  // today only reads primary_category_id (see the comment on getPosts in
  // lib/posts.ts), but the full set is real, queryable data regardless.
  for (const categoryId of opts.categoryIds) {
    await query(`INSERT INTO post_categories (post_id, category_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`, [
      postId,
      categoryId,
    ]);
  }
  const { rows: catRows } = await query<{ slug: string }>(`SELECT slug FROM categories WHERE id = $1`, [
    opts.primaryCategoryId,
  ]);
  return { id: String(postId), slug: opts.slug, categorySlug: catRows[0]?.slug ?? "" };
}
