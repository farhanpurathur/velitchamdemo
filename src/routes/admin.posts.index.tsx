import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Edit, Trash2, Plus, Eye } from "lucide-react";
import { ALL_CATEGORY_SLUGS, getCategoryDisplay } from "@/lib/categories";

export const Route = createFileRoute("/admin/posts/")({
  component: PostsList,
  validateSearch: (s) => ({ category: typeof s.category === "string" ? s.category : "" }),
});

interface Row {
  id: string; slug: string; title: string; status: string; view_count: number;
  published_at: string | null; created_at: string;
  categories: { slug: string; name: string } | null;
}

function PostsList() {
  const { category } = Route.useSearch();
  const [rows, setRows] = useState<Row[]>([]);
  const [filter, setFilter] = useState(category);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  async function load() {
    let q = supabase.from("posts")
      .select("id, slug, title, status, view_count, published_at, created_at, categories(slug, name)")
      .order("created_at", { ascending: false });
    if (filter) {
      const { data: cat } = await supabase.from("categories").select("id").eq("slug", filter).maybeSingle();
      if (cat) q = q.eq("category_id", cat.id);
    }
    if (statusFilter !== "all") q = q.eq("status", statusFilter);
    const { data } = await q;
    setRows((data as any) ?? []);
  }
  useEffect(() => { load(); }, [filter, statusFilter]);

  async function del(id: string) {
    if (!confirm("Delete this post permanently?")) return;
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3 items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Posts</h1>
        <Link to="/admin/posts/new" className="inline-flex items-center gap-2 px-4 py-2 rounded bg-brand text-primary-foreground text-sm font-medium">
          <Plus className="h-4 w-4" /> New post
        </Link>
      </div>
      <div className="flex flex-wrap gap-3 mb-4 bg-card border border-border rounded-lg p-3">
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-3 py-2 rounded border border-input bg-background text-sm">
          <option value="">All categories</option>
          {ALL_CATEGORY_SLUGS.map((s) => {
            const d = getCategoryDisplay(s);
            return <option key={s} value={s}>{d.name}</option>;
          })}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 rounded border border-input bg-background text-sm">
          <option value="all">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left">
            <tr>
              <th className="px-4 py-2.5 font-medium">Title</th>
              <th className="px-4 py-2.5 font-medium hidden md:table-cell">Category</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
              <th className="px-4 py-2.5 font-medium hidden md:table-cell">Views</th>
              <th className="px-4 py-2.5 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={5} className="text-center text-muted-foreground py-12">No posts yet.</td></tr>
            )}
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-border hover:bg-muted/40">
                <td className="px-4 py-3 ml font-medium max-w-md truncate">{r.title}</td>
                <td className="px-4 py-3 hidden md:table-cell">{r.categories?.name ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded ${r.status === "published" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">{r.view_count}</td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex gap-1">
                    <Link to="/post/$slug" params={{ slug: r.slug }} className="p-2 hover:bg-muted rounded" title="View"><Eye className="h-4 w-4" /></Link>
                    <Link to="/admin/posts/$id" params={{ id: r.id }} className="p-2 hover:bg-muted rounded" title="Edit"><Edit className="h-4 w-4" /></Link>
                    <button onClick={() => del(r.id)} className="p-2 hover:bg-destructive/10 hover:text-destructive rounded" title="Delete"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
