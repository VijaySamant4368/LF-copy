// Deletes every file listed in unreferenced-media.txt (built by
// list-unreferenced.ts) from public/wp-content/uploads/. Review that file
// first — this script trusts it completely and does not re-check the DB.
//
// Path-traversal guard: resolves each entry against UPLOADS_DIR and refuses
// to touch anything that resolves outside it (defense against a stray "../"
// somehow ending up in the list file).
import { readFileSync, unlinkSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPTS_DIR = fileURLToPath(new URL(".", import.meta.url));
const UPLOADS_DIR = resolve(SCRIPTS_DIR, "..", "public", "wp-content", "uploads");
const LIST_FILE = join(SCRIPTS_DIR, "unreferenced-media.txt");

function main() {
  const entries = readFileSync(LIST_FILE, "utf8")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  let deleted = 0;
  let bytesFreed = 0;
  let skipped = 0;

  for (const rel of entries) {
    const full = resolve(UPLOADS_DIR, rel);
    if (relative(UPLOADS_DIR, full).startsWith("..")) {
      console.warn(`SKIP (escapes uploads dir): ${rel}`);
      skipped++;
      continue;
    }
    try {
      bytesFreed += statSync(full).size;
      unlinkSync(full);
      deleted++;
    } catch (err) {
      console.warn(`SKIP (already gone or unreadable): ${rel}`);
      skipped++;
    }
  }

  console.log(`Deleted ${deleted} files (${(bytesFreed / 1024 / 1024).toFixed(1)} MB freed)`);
  if (skipped) console.log(`Skipped ${skipped}`);
}

main();
