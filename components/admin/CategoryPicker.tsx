"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { Category } from "@/lib/posts";

export interface SelectedCategory {
  name: string;
  isPrimary: boolean;
}

// Writable-with-suggestions (input + datalist), not a closed dropdown - typing
// a name that doesn't exist yet is valid, it gets created on save
// (findOrCreateCategoryByName in lib/admin-posts.ts). Multi-select: an article
// can belong to several categories (post_categories, schema.sql's real
// many-to-many set), with exactly one flagged primary - that one drives the
// article's URL (posts.primary_category_id).
export function CategoryPicker({
  availableCategories,
  selected,
  onChange,
}: {
  availableCategories: Category[];
  selected: SelectedCategory[];
  onChange: (next: SelectedCategory[]) => void;
}) {
  const [draft, setDraft] = useState("");

  function addCategory(name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (selected.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
      setDraft("");
      return;
    }
    onChange([...selected, { name: trimmed, isPrimary: selected.length === 0 }]);
    setDraft("");
  }

  function removeCategory(name: string) {
    const next = selected.filter((c) => c.name !== name);
    // Removed the primary one - promote whichever is left first rather than
    // leaving the post with no primary category at all.
    if (next.length && !next.some((c) => c.isPrimary)) next[0].isPrimary = true;
    onChange(next);
  }

  function setPrimary(name: string) {
    onChange(selected.map((c) => ({ ...c, isPrimary: c.name === name })));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addCategory(draft);
    }
  }

  return (
    <div>
      <div className="flex gap-2">
        <input
          type="text"
          list="category-suggestions"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a category, Enter to add…"
          className="flex-1 border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-crimson-700"
        />
        <button
          type="button"
          onClick={() => addCategory(draft)}
          className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-600 border border-slate-300 rounded hover:border-crimson-700 hover:text-crimson-800 transition-colors"
        >
          Add
        </button>
      </div>
      {/* the dropdown-of-existing-options half of "writable, with dropdown as an option" */}
      <datalist id="category-suggestions">
        {availableCategories.map((c) => (
          <option key={c.id} value={c.name} />
        ))}
      </datalist>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selected.map((c) => {
            const isNew = !availableCategories.some((ac) => ac.name.toLowerCase() === c.name.toLowerCase());
            return (
              <span
                key={c.name}
                className={`inline-flex items-center gap-1.5 text-xs font-semibold pl-1 pr-2 py-1 rounded-full border ${
                  c.isPrimary ? "bg-crimson-800 text-white border-crimson-800" : "bg-slate-100 text-slate-700 border-slate-200"
                }`}
              >
                <label className="flex items-center gap-1 cursor-pointer" title="Set as primary - drives the article's URL">
                  <input type="radio" name="primary-category" checked={c.isPrimary} onChange={() => setPrimary(c.name)} />
                  <span>{c.name}</span>
                  {isNew && <span className="opacity-70">(new)</span>}
                </label>
                <button type="button" onClick={() => removeCategory(c.name)} aria-label={`Remove ${c.name}`} className="hover:opacity-70">
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })}
        </div>
      )}
      <p className="text-[11px] text-slate-400 mt-1">
        The category marked <span className="font-bold">primary</span> sets the article&apos;s URL (/category/slug).
      </p>
    </div>
  );
}
