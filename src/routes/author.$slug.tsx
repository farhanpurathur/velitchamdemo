import { createFileRoute, useParams, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PostCard, type PostCardData } from "@/components/site/PostCard";
import { User, Calendar } from "lucide-react";

export const Route = createFileRoute("/author/$slug")({
  component: AuthorPage,
});

interface AuthorDetails {
  id: string;
  name: string;
  bio: string | null;
  photo_url: string | null;
  slug: string;
}

function AuthorPage() {
  const { slug } = useParams({ from: "/author/$slug" });
  const [author, setAuthor] = useState<AuthorDetails | null>(null);
  const [posts, setPosts] = useState<PostCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: authData } = await supabase
        .from("authors")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (authData) {
        setAuthor(authData);
        const { data: postData } = await supabase
          .from("posts")
          .select("id, slug, title, excerpt, cover_image, author_name, published_at, categories(slug, name, name_ml)")
          .eq("author_profile_id", authData.id)
          .eq("status", "published")
          .order("published_at", { ascending: false });
        
        setPosts((postData as any) ?? []);
      }
      setLoading(false);
    })();
  }, [slug]);

  if (loading) return <SiteLayout><div className="container mx-auto px-4 py-20 text-center text-muted-foreground">Loading author…</div></SiteLayout>;
  if (!author) return <SiteLayout><div className="container mx-auto px-4 py-20 text-center font-bold">Author not found</div></SiteLayout>;

  return (
    <SiteLayout>
      <div className="bg-muted/30 border-b border-border py-12 md:py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
            <div className="h-32 w-32 md:h-44 md:w-44 rounded-full overflow-hidden border-4 border-background shadow-xl bg-muted flex-shrink-0">
              {author.photo_url ? (
                <img src={author.photo_url} alt={author.name} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-muted-foreground bg-muted text-4xl font-bold">
                  {author.name[0]}
                </div>
              )}
            </div>
            <div className="flex-1">
              <h1 className="ml text-3xl md:text-5xl font-bold text-foreground mb-4">{author.name}</h1>
              {author.bio ? (
                <p className="ml text-lg text-muted-foreground leading-relaxed max-w-2xl">{author.bio}</p>
              ) : (
                <p className="text-muted-foreground italic">No bio available for this author.</p>
              )}
              <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-4 text-sm font-medium">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand/10 text-brand">
                  <User className="h-4 w-4" /> Author
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground">
                  {posts.length} {posts.length === 1 ? "Writing" : "Writings"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <h2 className="ml text-2xl font-bold text-brand border-b-2 border-brand pb-2 mb-8">Writings by {author.name}</h2>
        {posts.length === 0 ? (
          <div className="text-center py-20 bg-muted/20 rounded-xl border border-dashed border-border">
            <p className="text-muted-foreground">No posts found for this author.</p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
