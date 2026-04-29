import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PostCard, type PostCardData } from "@/components/site/PostCard";
import { getCategoryDisplay } from "@/lib/categories";

export const Route = createFileRoute("/category/$slug")({
  component: CategoryPage,
  head: ({ params }) => {
    const d = getCategoryDisplay(params.slug);
    return {
      meta: [
        { title: `${d.name} — Velicham` },
        { name: "description", content: `Articles in ${d.name} from Velicham magazine.` },
        { property: "og:title", content: `${d.name} — Velicham` },
        { property: "og:description", content: `Articles in ${d.name} (${d.nameMl}) from Velicham magazine.` },
      ],
    };
  },
});

function CategoryPage() {
  const { slug } = useParams({ from: "/category/$slug" });
  const [posts, setPosts] = useState<PostCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const d = getCategoryDisplay(slug);

  useEffect(() => {
    setLoading(true);
    (async () => {
      const { data: cat } = await supabase.from("categories").select("id").eq("slug", slug).maybeSingle();
      if (!cat) { setPosts([]); setLoading(false); return; }
      const { data } = await supabase
        .from("posts")
        .select("id, slug, title, excerpt, cover_image, author_name, published_at, view_count, categories(slug, name, name_ml)")
        .eq("status", "published")
        .eq("category_id", cat.id)
        .order("published_at", { ascending: false });
      setPosts((data as any) ?? []);
      setLoading(false);
    })();
  }, [slug]);

  return (
    <SiteLayout>
      <div className="container mx-auto px-4 py-10">
        <div className="border-b-2 border-brand pb-4 mb-8">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Category</p>
          <h1 className="ml text-3xl md:text-5xl font-bold text-brand mt-1">{d.nameMl}</h1>
          <p className="text-muted-foreground mt-1">{d.name}</p>
        </div>
        {loading ? (
          <p className="text-center text-muted-foreground py-16">Loading…</p>
        ) : posts.length === 0 ? (
          <p className="ml text-center text-muted-foreground py-16">ഈ വിഭാഗത്തിൽ പോസ്റ്റുകളൊന്നുമില്ല</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => <PostCard key={p.id} post={p} />)}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
