import { getCategories } from "@/lib/posts";
import { getAuthorsList } from "@/lib/admin-posts";
import { NewArticleForm } from "@/components/admin/NewArticleForm";

// Otherwise Next prerenders this at build time and the category/author
// dropdowns go stale until the next deploy - an admin form must always see
// current DB state.
export const dynamic = "force-dynamic";

export default async function NewArticlePage() {
  const [categories, authors] = await Promise.all([getCategories(), getAuthorsList()]);
  return <NewArticleForm categories={categories} authors={authors} />;
}
