// Walks public/wp-content/uploads/ and writes every file NOT present in
// media-paths.txt (built by list-media-paths.ts) to unreferenced-media.txt.
// Read-only — deletes nothing. Review the output file before running
// delete-unreferenced.ts against it.
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPTS_DIR = fileURLToPath(new URL(".", import.meta.url));
const UPLOADS_DIR = join(SCRIPTS_DIR, "..", "public", "wp-content", "uploads");
const REFERENCED_FILE = join(SCRIPTS_DIR, "media-paths.txt");
const OUT_FILE = join(SCRIPTS_DIR, "unreferenced-media.txt");

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      walk(full, out);
    } else {
      out.push(full);
    }
  }
  return out;
}

function main() {
  const referenced = new Set(
    readFileSync(REFERENCED_FILE, "utf8")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
  );

  const onDisk = walk(UPLOADS_DIR);
  const unreferenced = onDisk
    .map((full) => relative(UPLOADS_DIR, full).split("\\").join("/")) // posix-style, matches media-paths.txt
    .filter((rel) => !referenced.has(rel))
    .sort();

  writeFileSync(OUT_FILE, unreferenced.join("\n") + (unreferenced.length ? "\n" : ""), "utf8");

  console.log(`${referenced.size} referenced paths`);
  console.log(`${onDisk.length} files on disk`);
  console.log(`${unreferenced.length} unreferenced -> scripts/unreferenced-media.txt`);
}

main();
