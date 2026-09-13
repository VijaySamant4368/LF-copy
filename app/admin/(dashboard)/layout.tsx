import Link from "next/link";
import { Scale } from "lucide-react";
import { LogoutButton } from "@/components/admin/LogoutButton";

// Route group, not a URL segment - /admin and /admin/new both render inside
// this authed shell, while /admin/login (a sibling outside the group) stays
// bare so a logged-out visitor doesn't see tabs to pages they'll just get
// bounced from by middleware.ts.
export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      <header className="bg-slate-950 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-crimson-800 text-white flex items-center justify-center">
            <Scale className="w-4 h-4" />
          </div>
          <span className="font-serif font-bold text-base">LawsForum Admin</span>
        </div>
        <LogoutButton />
      </header>

      <nav className="bg-white border-b border-slate-200 px-6 flex gap-6">
        <Link
          href="/admin"
          className="py-3 text-sm font-bold text-slate-700 hover:text-crimson-800 border-b-2 border-transparent hover:border-crimson-700 transition-colors"
        >
          Articles
        </Link>
        <Link
          href="/admin/new"
          className="py-3 text-sm font-bold text-slate-700 hover:text-crimson-800 border-b-2 border-transparent hover:border-crimson-700 transition-colors"
        >
          New Article
        </Link>
      </nav>

      <main className="p-6 max-w-6xl mx-auto">{children}</main>
    </div>
  );
}
