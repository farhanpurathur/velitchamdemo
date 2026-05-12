import { Link } from "@tanstack/react-router";
import { getCategoryDisplay } from "@/lib/categories";

export interface PostCardData {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  cover_image: string | null;
  author_name: string | null;
  published_at: string | null;
  view_count?: number;
  categories?: { slug: string; name_ml: string | null; name: string } | null;
  authors?: { slug: string } | null;
}

const PLACEHOLDER = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 250'><rect fill='%23e8eef5' width='400' height='250'/><text x='50%25' y='50%25' fill='%2306305a' font-family='serif' font-size='28' text-anchor='middle' dy='.3em'>വെളിച്ചം</text></svg>";

export function PostCard({ post, size = "md" }: { post: PostCardData; size?: "sm" | "md" | "lg" }) {
  const cat = post.categories
    ? { name: post.categories.name, nameMl: post.categories.name_ml ?? post.categories.name }
    : { name: "", nameMl: "" };

  return (
    <div className="group flex flex-col bg-card rounded-lg overflow-hidden border border-border hover:shadow-lg transition-all">
      <Link
        to="/post/$slug"
        params={{ slug: post.slug }}
        className={`relative overflow-hidden ${size === "lg" ? "aspect-[16/10]" : "aspect-[4/3]"}`}
      >
        <img
          src={post.cover_image || PLACEHOLDER}
          alt={post.title}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {cat.name && (
          <span className="absolute top-3 left-3 bg-brand text-primary-foreground text-xs px-2 py-1 rounded uppercase tracking-wide font-semibold">
            {cat.name}
          </span>
        )}
      </Link>
      <div className="p-4 flex-1 flex flex-col">
        <Link to="/post/$slug" params={{ slug: post.slug }}>
          <h3 className={`ml font-bold leading-snug text-foreground group-hover:text-brand transition-colors ${size === "lg" ? "text-xl md:text-2xl" : size === "sm" ? "text-base" : "text-lg"}`}>
            {post.title}
          </h3>
        </Link>
        {post.excerpt && size !== "sm" && (
          <p className="ml mt-2 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {post.excerpt}
          </p>
        )}
        <div className="mt-auto pt-3 flex items-center gap-2 text-xs text-muted-foreground">
          {post.author_name && (
            post.authors?.slug ? (
              <Link to="/author/$slug" params={{ slug: post.authors.slug }} className="ml hover:text-brand hover:underline transition-colors font-medium">
                {post.author_name}
              </Link>
            ) : (
              <span className="ml">{post.author_name}</span>
            )
          )}
          {post.author_name && post.published_at && <span>·</span>}
          {post.published_at && (
            <span>{new Date(post.published_at).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}</span>
          )}
        </div>
      </div>
    </div>
  );
}

export function CategoryHeading({ slug, viewAll = true }: { slug: string; viewAll?: boolean }) {
  const d = getCategoryDisplay(slug);
  return (
    <div className="flex items-end justify-between mb-6 border-b-2 border-brand pb-2">
      <div>
        <h2 className="ml text-2xl md:text-3xl font-bold text-brand">{d.nameMl}</h2>
        <p className="text-xs uppercase tracking-widest text-muted-foreground mt-1">{d.name}</p>
      </div>
      {viewAll && (
        <Link
          to="/category/$slug"
          params={{ slug }}
          className="text-sm text-brand hover:underline font-medium"
        >
          View all →
        </Link>
      )}
    </div>
  );
}
