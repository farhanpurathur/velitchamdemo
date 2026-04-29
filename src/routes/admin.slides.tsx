import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";

export const Route = createFileRoute("/admin/slides")({
  component: SlidesPage,
});

interface Row { id: string; display_order: number; posts: { id: string; title: string; cover_image: string | null } | null; }

function SlidesPage() {
  const [slides, setSlides] = useState<Row[]>([]);
  const [posts, setPosts] = useState<{ id: string; title: string }[]>([]);
  const [picking, setPicking] = useState(false);

  async function load() {
    const { data } = await supabase.from("slides").select("id, display_order, posts(id, title, cover_image)").order("display_order");
    setSlides((data as any) ?? []);
  }
  useEffect(() => { load(); }, []);

  async function openPicker() {
    const { data } = await supabase.from("posts").select("id, title").eq("status", "published").order("published_at", { ascending: false }).limit(100);
    setPosts(data ?? []); setPicking(true);
  }
  async function add(postId: string) {
    const order = (slides[slides.length - 1]?.display_order ?? -1) + 1;
    const { error } = await supabase.from("slides").insert({ post_id: postId, display_order: order });
    if (error) return toast.error(error.message);
    setPicking(false); load(); toast.success("Added to slider");
  }
  async function remove(id: string) {
    const { error } = await supabase.from("slides").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  }
  async function move(idx: number, dir: -1 | 1) {
    const j = idx + dir; if (j < 0 || j >= slides.length) return;
    const a = slides[idx], b = slides[j];
    await supabase.from("slides").update({ display_order: b.display_order }).eq("id", a.id);
    await supabase.from("slides").update({ display_order: a.display_order }).eq("id", b.id);
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Hero Slides</h1>
          <p className="text-sm text-muted-foreground">Pick which posts appear in the homepage slider.</p>
        </div>
        <button onClick={openPicker} className="inline-flex items-center gap-2 px-4 py-2 rounded bg-brand text-primary-foreground text-sm">
          <Plus className="h-4 w-4" /> Add slide
        </button>
      </div>
      <div className="space-y-2">
        {slides.length === 0 && <p className="text-muted-foreground text-center py-12">No slides yet.</p>}
        {slides.map((s, i) => (
          <div key={s.id} className="bg-card border border-border rounded-lg p-3 flex items-center gap-3">
            {s.posts?.cover_image && <img src={s.posts.cover_image} className="h-16 w-24 object-cover rounded" />}
            <p className="ml flex-1 font-medium">{s.posts?.title ?? "(missing post)"}</p>
            <button onClick={() => move(i, -1)} disabled={i === 0} className="p-2 hover:bg-muted rounded disabled:opacity-30"><ArrowUp className="h-4 w-4" /></button>
            <button onClick={() => move(i, 1)} disabled={i === slides.length-1} className="p-2 hover:bg-muted rounded disabled:opacity-30"><ArrowDown className="h-4 w-4" /></button>
            <button onClick={() => remove(s.id)} className="p-2 hover:bg-destructive/10 text-destructive rounded"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
      </div>
      {picking && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setPicking(false)}>
          <div className="bg-card rounded-lg p-4 max-w-lg w-full max-h-[80vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold mb-3">Pick a post</h3>
            {posts.map((p) => (
              <button key={p.id} onClick={() => add(p.id)} className="w-full ml text-left px-3 py-2 hover:bg-muted rounded">{p.title}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
