import Link from "next/link";
import { getAdminPosts } from "@/lib/admin-posts";

const STATUS_STYLES: Record<string, string> = {
  published: "bg-emerald-100 text-emerald-700",
  draft: "bg-amber-100 text-amber-700",
  private: "bg-slate-200 text-slate-600",
};

export default async function AdminArticlesPage({ searchParams }: { searchParams: { page?: string } }) {
  const page = Math.max(1, Number(searchParams.page) || 1);
  const { posts, totalPages, total } = await getAdminPosts(page);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-serif text-xl font-bold text-slate-900">Articles</h1>
        <span className="text-xs text-slate-500">{total} total</span>
      </div>

      <div className="bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3 font-bold">Title</th>
                <th className="px-4 py-3 font-bold">Category</th>
                <th className="px-4 py-3 font-bold">Author</th>
                <th className="px-4 py-3 font-bold">Status</th>
                <th className="px-4 py-3 font-bold">Updated</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-900 max-w-md truncate">
                    {p.status === "published" && p.categorySlug ? (
                      <Link href={`/${p.categorySlug}/${p.slug}`} target="_blank" className="hover:text-crimson-800 hover:underline">
                        {p.title}
                      </Link>
                    ) : (
                      p.title
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{p.categoryName ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{p.authorName}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${STATUS_STYLES[p.status] ?? ""}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">
                    {new Date(p.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}
                  </td>
                </tr>
              ))}
              {posts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                    No articles yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-4 text-sm">
          <Link
            href={`/admin?page=${page - 1}`}
            aria-disabled={page <= 1}
            className={`px-3 py-1.5 rounded border border-slate-300 ${page <= 1 ? "pointer-events-none opacity-40" : "hover:border-crimson-700 hover:text-crimson-800"}`}
          >
            Prev
          </Link>
          <span className="text-slate-500">
            Page {page} of {totalPages}
          </span>
          <Link
            href={`/admin?page=${page + 1}`}
            aria-disabled={page >= totalPages}
            className={`px-3 py-1.5 rounded border border-slate-300 ${page >= totalPages ? "pointer-events-none opacity-40" : "hover:border-crimson-700 hover:text-crimson-800"}`}
          >
            Next
          </Link>
        </div>
      )}
    </div>
  );
}
