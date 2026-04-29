import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PostCard, type PostCardData } from "@/components/site/PostCard";

export const Route = createFileRoute("/interview")({
  component: InterviewPage,
  head: () => ({
    meta: [
      { title: "Interview — Velicham" },
      { name: "description", content: "Interviews from Velicham magazine." },
      { property: "og:title", content: "Interview — Velicham" },
      { property: "og:description", content: "Interviews from Velicham magazine." },
    ],
  }),
});

function InterviewPage() {
  const [posts, setPosts] = useState<PostCardData[]>([]);
  useEffect(() => {
    (async () => {
      const { data: cat } = await supabase.from("categories").select("id").eq("slug", "interview").maybeSingle();
      if (!cat) return;
      const { data } = await supabase
        .from("posts")
        .select("id, slug, title, excerpt, cover_image, author_name, published_at, view_count, categories(slug, name, name_ml)")
        .eq("status", "published")
        .eq("category_id", cat.id)
        .order("published_at", { ascending: false });
      setPosts((data as any) ?? []);
    })();
  }, []);
  return (
    <SiteLayout>
      <div className="container mx-auto px-4 py-10">
        <div className="border-b-2 border-brand pb-4 mb-8">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Section</p>
          <h1 className="ml text-3xl md:text-5xl font-bold text-brand mt-1">അഭിമുഖം</h1>
          <p className="text-muted-foreground mt-1">Interview</p>
        </div>
        {posts.length === 0 ? (
          <p className="ml text-center text-muted-foreground py-16">അഭിമുഖങ്ങളൊന്നുമില്ല</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => <PostCard key={p.id} post={p} />)}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
