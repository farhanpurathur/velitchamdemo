import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PostCard, type PostCardData } from "@/components/site/PostCard";

export const Route = createFileRoute("/search")({
  component: SearchPage,
  validateSearch: (s) => ({ q: typeof s.q === "string" ? s.q : "" }),
  head: () => ({
    meta: [
      { title: "Search — Velicham" },
      { name: "description", content: "Search articles in Velicham magazine." },
    ],
  }),
});

function SearchPage() {
  const { q } = Route.useSearch();
  const [posts, setPosts] = useState<PostCardData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!q) return;
    setLoading(true);
    supabase
      .from("posts")
      .select("id, slug, title, excerpt, cover_image, author_name, published_at, view_count, categories(slug, name, name_ml)")
      .eq("status", "published")
      .or(`title.ilike.%${q}%,excerpt.ilike.%${q}%`)
      .order("published_at", { ascending: false })
      .limit(50)
      .then(({ data }) => { setPosts((data as any) ?? []); setLoading(false); });
  }, [q]);

  return (
    <SiteLayout>
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-2">Search results</h1>
        <p className="text-muted-foreground mb-8">{q ? <>For "<strong>{q}</strong>" — {posts.length} result(s)</> : "Type a query in the search bar."}</p>
        {loading ? (
          <p className="text-center text-muted-foreground py-12">Searching…</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => <PostCard key={p.id} post={p} />)}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
