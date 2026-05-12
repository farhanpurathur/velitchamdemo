import { createFileRoute, useParams, notFound, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PostCard, type PostCardData } from "@/components/site/PostCard";
import { getVisitorId } from "@/lib/visitor";
import { Eye, Calendar, User as UserIcon } from "lucide-react";

export const Route = createFileRoute("/post/$slug")({
  component: PostPage,
  errorComponent: ({ error }) => (
    <SiteLayout>
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Post not found</h1>
        <p className="text-muted-foreground mt-2">{error.message}</p>
        <Link to="/" className="text-brand underline mt-4 inline-block">Go home</Link>
      </div>
    </SiteLayout>
  ),
});

interface FullPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  author_name: string | null;
  published_at: string | null;
  view_count: number;
  category_id: string;
  categories: { slug: string; name: string; name_ml: string | null } | null;
  authors?: { slug: string } | null;
}

function PostPage() {
  const { slug } = useParams({ from: "/post/$slug" });
  const [post, setPost] = useState<FullPost | null>(null);
  const [related, setRelated] = useState<PostCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFoundErr, setNotFoundErr] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFoundErr(false);
    (async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("id, slug, title, excerpt, content, cover_image, author_name, author_profile_id, published_at, view_count, category_id, categories(slug, name, name_ml), authors(slug)")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();
      if (error || !data) { setNotFoundErr(true); setLoading(false); return; }
      setPost(data as any);
      setLoading(false);

      // record view
      const startedAt = Date.now();
      supabase.rpc("increment_post_view", {
        _post_id: data.id,
        _visitor_id: getVisitorId(),
        _referrer: (typeof document !== "undefined" ? document.referrer : "") || "",
        _user_agent: (typeof navigator !== "undefined" ? navigator.userAgent : "") || "",
      });

      // related
      const { data: rel } = await supabase
        .from("posts")
        .select("id, slug, title, excerpt, cover_image, author_name, published_at, categories(slug, name, name_ml)")
        .eq("status", "published")
        .eq("category_id", data.category_id)
        .neq("id", data.id)
        .order("published_at", { ascending: false })
        .limit(3);
      setRelated((rel as any) ?? []);

      // record time on page
      const handleUnload = () => {
        const seconds = Math.round((Date.now() - startedAt) / 1000);
        if (seconds > 1 && seconds < 3600) {
          navigator.sendBeacon?.(
            `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/post_views`,
            new Blob(
              [JSON.stringify({ post_id: data.id, visitor_id: getVisitorId(), time_on_page_seconds: seconds })],
              { type: "application/json" },
            ),
          );
        }
      };
      window.addEventListener("beforeunload", handleUnload);
      return () => window.removeEventListener("beforeunload", handleUnload);
    })();
  }, [slug]);

  if (loading) {
    return <SiteLayout><div className="container mx-auto px-4 py-20 text-center text-muted-foreground">Loading…</div></SiteLayout>;
  }
  if (notFoundErr || !post) {
    return (
      <SiteLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="ml text-3xl font-bold">പോസ്റ്റ് കണ്ടെത്താനായില്ല</h1>
          <Link to="/" className="text-brand underline mt-4 inline-block">Back to home</Link>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <article>
        {post.cover_image && (
          <div className="relative h-[40vh] md:h-[55vh] overflow-hidden">
            <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          </div>
        )}
        <div className="container mx-auto px-4 max-w-4xl -mt-20 relative">
          <div className="bg-card rounded-xl shadow-xl p-6 md:p-12">
            {post.categories && (
              <Link
                to="/category/$slug"
                params={{ slug: post.categories.slug }}
                className="inline-block bg-brand text-primary-foreground text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded mb-4"
              >
                {post.categories.name}
              </Link>
            )}
            <h1 className="ml text-3xl md:text-5xl font-bold leading-tight text-foreground">
              {post.title}
            </h1>
            <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-muted-foreground border-b border-border pb-5">
              {post.author_name && (
                <span className="ml inline-flex items-center gap-1.5">
                  <UserIcon className="h-4 w-4" />
                  {post.authors?.slug ? (
                    <Link to="/author/$slug" params={{ slug: post.authors.slug }} className="hover:text-brand hover:underline transition-colors font-medium">
                      {post.author_name}
                    </Link>
                  ) : (
                    <span>{post.author_name}</span>
                  )}
                </span>
              )}
              {post.published_at && <span className="inline-flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {new Date(post.published_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</span>}
              <span className="inline-flex items-center gap-1.5"><Eye className="h-4 w-4" /> {post.view_count.toLocaleString()} views</span>
            </div>
            <div
              className="prose-velicham mt-8"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>
        </div>
        {related.length > 0 && (
          <section className="container mx-auto px-4 mt-16 max-w-6xl">
            <h2 className="ml text-2xl font-bold text-brand border-b-2 border-brand pb-2 mb-6">സംബന്ധിച്ച ലേഖനങ്ങൾ</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => <PostCard key={p.id} post={p} />)}
            </div>
          </section>
        )}
      </article>
    </SiteLayout>
  );
}
