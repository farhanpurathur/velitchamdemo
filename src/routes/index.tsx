import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site/SiteLayout";
import { HeroSlider } from "@/components/site/HeroSlider";
import { PostCard, CategoryHeading, type PostCardData } from "@/components/site/PostCard";
import { CategorySlider } from "@/components/site/CategorySlider";
import { NAV_GROUPS } from "@/lib/categories";
import { Link } from "@tanstack/react-router";
import { Send } from "lucide-react";

export const Route = createFileRoute("/")({
  component: HomePage,
});

const POST_FIELDS = "id, slug, title, excerpt, cover_image, author_name, published_at, view_count, categories(slug, name, name_ml)";

function HomePage() {
  const { data: slides = [] } = useQuery({
    queryKey: ["slides"],
    queryFn: async (): Promise<PostCardData[]> => {
      const { data } = await supabase
        .from("slides")
        .select(`display_order, posts!inner(${POST_FIELDS})`)
        .order("display_order");
      return (data ?? [])
        .map((s: any) => s.posts)
        .filter((p: any) => p?.status !== "draft" || true);
    },
  });

  const { data: recent = [] } = useQuery({
    queryKey: ["recent"],
    queryFn: async (): Promise<PostCardData[]> => {
      const { data } = await supabase
        .from("posts")
        .select(POST_FIELDS)
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(6);
      return (data as any) ?? [];
    },
  });

  const { data: popular = [] } = useQuery({
    queryKey: ["popular"],
    queryFn: async (): Promise<PostCardData[]> => {
      const { data } = await supabase
        .from("posts")
        .select(POST_FIELDS)
        .eq("status", "published")
        .order("view_count", { ascending: false })
        .limit(6);
      return (data as any) ?? [];
    },
  });

  return (
    <SiteLayout>
      <HeroSlider slides={slides} />

      {/* Recent posts */}
      <section className="container mx-auto px-4 py-12">
        <CategoryHeading slug="recent" viewAll={false} />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {recent.map((p) => <PostCard key={p.id} post={p} />)}
          {recent.length === 0 && (
            <p className="ml text-muted-foreground col-span-full text-center py-12">പോസ്റ്റുകളൊന്നും ഇല്ല</p>
          )}
        </div>
      </section>

      {/* Popular */}
      {popular.length > 0 && (
        <section className="bg-secondary/40 py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-end justify-between mb-6 border-b-2 border-brand pb-2">
              <div>
                <h2 className="ml text-2xl md:text-3xl font-bold text-brand">ജനപ്രിയം</h2>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mt-1">Popular</p>
              </div>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {popular.map((p) => <PostCard key={p.id} post={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* Per-category sliders */}
      {NAV_GROUPS.flatMap((g) => g.children ? g.children : [{ slug: g.slug, name: g.name, nameMl: g.name }])
        .map((c) => <CategorySliderLazy key={c.slug} slug={c.slug} />)}

      {/* Submit CTA */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-brand rounded-2xl p-8 md:p-12 text-center text-primary-foreground">
          <Send className="h-10 w-10 mx-auto mb-4 opacity-80" />
          <h2 className="ml text-2xl md:text-3xl font-bold mb-3">നിങ്ങളുടെ ലേഖനം ഞങ്ങൾക്കയക്കൂ</h2>
          <p className="ml text-white/80 mb-6 max-w-xl mx-auto">
            Have a story, essay, poem or review to share? Submit your article for consideration.
          </p>
          <Link
            to="/submit"
            className="inline-block bg-white text-brand font-semibold px-8 py-3 rounded-md hover:bg-white/90 transition-colors"
          >
            Submit Article
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}

function CategorySliderLazy({ slug }: { slug: string }) {
  const { data = [] } = useQuery({
    queryKey: ["category-slider", slug],
    queryFn: async (): Promise<PostCardData[]> => {
      const { data: cat } = await supabase.from("categories").select("id").eq("slug", slug).maybeSingle();
      if (!cat) return [];
      const { data } = await supabase
        .from("posts")
        .select(POST_FIELDS)
        .eq("status", "published")
        .eq("category_id", cat.id)
        .order("published_at", { ascending: false })
        .limit(6);
      return (data as any) ?? [];
    },
  });
  if (data.length === 0) return null;
  return <CategorySlider slug={slug} posts={data} />;
}
