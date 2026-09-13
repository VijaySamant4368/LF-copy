"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { UploadCloud, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { slugify } from "@/lib/slugify";
import { RichTextEditor } from "./RichTextEditor";
import { CategoryPicker, type SelectedCategory } from "./CategoryPicker";
import type { Category } from "@/lib/posts";
import type { AdminAuthor } from "@/lib/admin-posts";

type SlugStatus = "idle" | "checking" | "available" | "taken";

export function NewArticleForm({ categories, authors }: { categories: Category[]; authors: AdminAuthor[] }) {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEditedManually, setSlugEditedManually] = useState(false);
  const [slugStatus, setSlugStatus] = useState<SlugStatus>("idle");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<SelectedCategory[]>(
    categories[0] ? [{ name: categories[0].name, isPrimary: true }] : []
  );
  const [authorName, setAuthorName] = useState(authors[0]?.name ?? "");
  const [status, setStatus] = useState<"draft" | "published">("draft");

  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverMediaId, setCoverMediaId] = useState<string | null>(null);
  const [coverUploading, setCoverUploading] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Debounced slug-conflict check - fires on every slug change, whether it came
  // from typing the title (auto-slug) or editing the slug field directly.
  const slugCheckSeq = useRef(0);
  useEffect(() => {
    if (!slug) {
      setSlugStatus("idle");
      return;
    }
    setSlugStatus("checking");
    const seq = ++slugCheckSeq.current;
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/admin/slug-check?slug=${encodeURIComponent(slug)}`);
        const data = await res.json();
        if (seq === slugCheckSeq.current) setSlugStatus(data.taken ? "taken" : "available");
      } catch {
        if (seq === slugCheckSeq.current) setSlugStatus("idle");
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [slug]);

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugEditedManually) setSlug(slugify(value));
  }

  function handleSlugChange(value: string) {
    setSlugEditedManually(true);
    setSlug(slugify(value));
  }

  async function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverPreview(URL.createObjectURL(file));
    setCoverUploading(true);
    setFormError("");
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setCoverMediaId(data.mediaId);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Cover image upload failed");
      setCoverPreview(null);
    } finally {
      setCoverUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");

    if (!title.trim()) return setFormError("Title is required.");
    if (!slug.trim()) return setFormError("Slug is required.");
    if (slugStatus === "taken") return setFormError("That slug is already in use - change it before saving.");
    if (!content.trim()) return setFormError("Article content can't be empty.");
    if (selectedCategories.length === 0) return setFormError("Add at least one category.");
    if (!authorName.trim()) return setFormError("Author is required.");

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          excerpt,
          content,
          status,
          authorName,
          categories: selectedCategories,
          featuredMediaId: coverMediaId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save article");
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save article");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <h1 className="font-serif text-xl font-bold text-slate-900">New Article</h1>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          required
          className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-crimson-700"
        />
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Slug</label>
        <div className="relative">
          <input
            type="text"
            value={slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            required
            className="w-full border border-slate-300 rounded px-3 py-2 pr-9 text-sm font-mono focus:outline-none focus:border-crimson-700"
          />
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2">
            {slugStatus === "checking" && <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />}
            {slugStatus === "available" && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
            {slugStatus === "taken" && <XCircle className="w-4 h-4 text-red-600" />}
          </span>
        </div>
        {slugStatus === "taken" && <p className="text-xs text-red-600 mt-1">Already used by another article.</p>}
        {(() => {
          const primary = selectedCategories.find((c) => c.isPrimary);
          if (!primary) return null;
          const existing = categories.find((c) => c.name.toLowerCase() === primary.name.toLowerCase());
          return (
            <p className="text-xs text-slate-400 mt-1 font-mono">
              /{existing?.slug ?? slugify(primary.name)}/{slug || "…"}
            </p>
          );
        })()}
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Categories</label>
        <CategoryPicker availableCategories={categories} selected={selectedCategories} onChange={setSelectedCategories} />
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Author</label>
        <input
          type="text"
          list="author-suggestions"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          placeholder="Type or pick an author"
          required
          className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-crimson-700"
        />
        {/* the dropdown-of-existing-options half of "writable, with dropdown as an option" */}
        <datalist id="author-suggestions">
          {authors.map((a) => (
            <option key={a.id} value={a.name} />
          ))}
        </datalist>
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Excerpt (optional)</label>
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={2}
          placeholder="Short summary shown on cards and in search results"
          className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-crimson-700"
        />
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Cover Image</label>
        <div className="flex items-center gap-4">
          <div className="relative w-40 h-28 rounded border border-dashed border-slate-300 bg-slate-50 overflow-hidden flex items-center justify-center flex-shrink-0">
            {coverPreview ? (
              <Image src={coverPreview} alt="Cover preview" fill className="object-cover" unoptimized />
            ) : (
              <UploadCloud className="w-6 h-6 text-slate-300" />
            )}
            {coverUploading && (
              <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-crimson-800 animate-spin" />
              </div>
            )}
          </div>
          <label className="text-xs font-bold text-crimson-800 hover:underline cursor-pointer">
            {coverPreview ? "Replace image" : "Choose image"}
            <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleCoverChange} className="hidden" />
          </label>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Content</label>
        <RichTextEditor content={content} onChange={setContent} />
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-200">
        <div className="flex items-center gap-3 text-sm">
          <label className="flex items-center gap-1.5">
            <input type="radio" checked={status === "draft"} onChange={() => setStatus("draft")} />
            Save as draft
          </label>
          <label className="flex items-center gap-1.5">
            <input type="radio" checked={status === "published"} onChange={() => setStatus("published")} />
            Publish now
          </label>
        </div>

        <div className="flex items-center gap-3">
          {formError && <span className="text-xs text-red-600">{formError}</span>}
          <button
            type="submit"
            disabled={submitting || coverUploading || slugStatus === "checking"}
            className="bg-crimson-800 hover:bg-crimson-700 text-white text-sm font-bold px-6 py-2.5 rounded transition-colors disabled:opacity-50"
          >
            {submitting ? "Saving…" : status === "published" ? "Publish" : "Save Draft"}
          </button>
        </div>
      </div>
    </form>
  );
}
