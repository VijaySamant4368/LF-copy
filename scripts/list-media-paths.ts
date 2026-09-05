// Lists every image path the DB actually references, so the rsync'd
// public/wp-content/uploads/ dump (which pulled the WHOLE WP uploads dir —
// originals + every resized variant + unrelated plugin folders) can be pruned
// down to just what's used.
//
// Two sources, both needed:
//   1. media.path       — one row per original upload (461 rows), used for
//                          post cover images (lib/posts.ts WP_UPLOADS_BASE).
//   2. posts.content    — post body HTML often hotlinks *resized variants*
//                          inline (e.g. foo-300x200.jpg) that have no media
//                          row of their own. Regex-scan content for those so
//                          deleting "unreferenced" files doesn't break articles.
//
// Output: one relative path per line (e.g. "2017/11/foo.jpg"), written to
// scripts/media-paths.txt — diff that against the uploads dir to find what's
// safe to delete.
import { config } from "dotenv";
import { writeFileSync } from "node:fs";
import { Pool } from "pg";

config({ path: ".env.local" });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Matches /wp-content/uploads/<path> with or without the domain in front,
// since content HTML may carry either an absolute lawsforum.com URL or a
// bare relative one.
const CONTENT_PATH_RE = /wp-content\/uploads\/([^"'\s)>]+)/g;

async function main() {
  const paths = new Set<string>();

  const { rows: mediaRows } = await pool.query<{ path: string }>(
    `SELECT path FROM media`
  );
  for (const { path } of mediaRows) paths.add(path);

  const { rows: postRows } = await pool.query<{ content: string }>(
    `SELECT content FROM posts WHERE content IS NOT NULL`
  );
  for (const { content } of postRows) {
    for (const match of content.matchAll(CONTENT_PATH_RE)) {
      paths.add(match[1]);
    }
  }

  const sorted = [...paths].sort();
  const outFile = new URL("./media-paths.txt", import.meta.url);
  writeFileSync(outFile, sorted.join("\n") + "\n", "utf8");

  console.log(`${mediaRows.length} media rows, ${postRows.length} posts scanned`);
  console.log(`${sorted.length} unique referenced paths -> scripts/media-paths.txt`);

  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
