import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getCategories } from "@/lib/posts";

export const metadata: Metadata = {
  title: {
    template: "%s | LawsForum",
    default: "LawsForum | Legal Digest & Case Law (placeholder)",
  },
  description: "Placeholder Next.js rebuild of a legal-education magazine site — design/layout review only, no real content yet.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const categories = await getCategories();
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen flex flex-col justify-between bg-editorial-bg font-sans">
        <div>
          <Navbar categories={categories} />
          <main className="min-h-[calc(100vh-320px)]">{children}</main>
        </div>
        <Footer categories={categories} />
      </body>
    </html>
  );
}
