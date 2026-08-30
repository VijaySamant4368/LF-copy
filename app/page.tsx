import { getPosts, getCategories } from "@/lib/posts";
import { HeroMagazineGrid } from "@/components/home/HeroMagazineGrid";
import { PopularPostsWidget } from "@/components/home/PopularPostsWidget";
import { FacultySection } from "@/components/home/FacultySection";
import { EditorialSection } from "@/components/home/EditorialSection";
import { SocialFollowWidget } from "@/components/sidebar/SocialFollowWidget";
import { SidebarWidgets } from "@/components/sidebar/SidebarWidgets";

export default async function HomePage() {
  const [allPosts, categories] = await Promise.all([getPosts({ limit: 30 }), getCategories()]);
  const trendingPosts = [...allPosts].sort((a, b) => b.hotScore - a.hotScore);

  return (
    <div className="w-full bg-[#FAFAFA] pb-16">
      <HeroMagazineGrid posts={allPosts} />

      <div className="max-w-[1550px] mx-auto px-4 sm:px-6 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-3">
            <PopularPostsWidget posts={allPosts} />
          </div>

          <div className="lg:col-span-6 space-y-8">
            <FacultySection posts={allPosts} />
            <EditorialSection initialPosts={allPosts} />
          </div>

          <div className="lg:col-span-3 space-y-6">
            <SocialFollowWidget />
            <SidebarWidgets trendingPosts={trendingPosts} categories={categories} />
          </div>
        </div>
      </div>
    </div>
  );
}
