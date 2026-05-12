import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, Edit2, Upload, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/admin/authors")({
  component: AuthorsPage,
});

interface Author {
  id: string;
  name: string;
  slug: string;
  bio: string | null;
  photo_url: string | null;
  created_at: string;
}

function AuthorsPage() {
  const { isAdmin } = useAuth();
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Author> | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    const { data } = await supabase.from("authors").select("*").order("name");
    setAuthors(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function uploadPhoto(file: File): Promise<string | null> {
    const ext = file.name.split(".").pop();
    const path = `authors/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("post-images").upload(path, file);
    if (error) { toast.error(error.message); return null; }
    return supabase.storage.from("post-images").getPublicUrl(path).data.publicUrl;
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!editing?.name?.trim()) return toast.error("Name is required");
    setSaving(true);

    const slug = editing.slug || editing.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
    const payload = {
      name: editing.name.trim(),
      slug,
      bio: editing.bio?.trim() || null,
      photo_url: editing.photo_url || null,
    };

    const { error } = editing.id
      ? await supabase.from("authors").update(payload).eq("id", editing.id)
      : await supabase.from("authors").insert(payload);

    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(editing.id ? "Updated" : "Created");
    setEditing(null);
    load();
  }

  async function del(id: string) {
    if (!confirm("Delete this author? This will not delete their posts, but they will no longer be linked.")) return;
    const { error } = await supabase.from("authors").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  }

  if (!isAdmin) return <p className="text-muted-foreground">Only admins can manage authors.</p>;

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Authors</h1>
        <button
          onClick={() => setEditing({ name: "", bio: "", photo_url: "", slug: "" })}
          className="inline-flex items-center gap-2 px-4 py-2 rounded bg-brand text-primary-foreground text-sm font-medium"
        >
          <Plus className="h-4 w-4" /> Add Author
        </button>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-background border border-border rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="font-bold">{editing.id ? "Edit Author" : "New Author"}</h2>
              <button onClick={() => setEditing(null)} className="p-1 hover:bg-muted rounded-full">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={save} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Name</label>
                <input
                  required
                  value={editing.name || ""}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  className="w-full px-3 py-2 rounded border border-input bg-background"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Slug (optional)</label>
                <input
                  value={editing.slug || ""}
                  onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                  placeholder="auto-generated from name"
                  className="w-full px-3 py-2 rounded border border-input bg-background font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Bio</label>
                <textarea
                  value={editing.bio || ""}
                  onChange={(e) => setEditing({ ...editing, bio: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 rounded border border-input bg-background text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Photo</label>
                <div className="flex items-center gap-4">
                  {editing.photo_url ? (
                    <div className="relative h-16 w-16 rounded-full overflow-hidden border border-border">
                      <img src={editing.photo_url} className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setEditing({ ...editing, photo_url: "" })}
                        className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4 text-white" />
                      </button>
                    </div>
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center border-2 border-dashed border-border">
                      <Upload className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <label className="cursor-pointer text-sm font-medium text-brand hover:underline">
                    {editing.photo_url ? "Change photo" : "Upload photo"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const f = e.target.files?.[0];
                        if (f) {
                          const url = await uploadPhoto(f);
                          if (url) setEditing({ ...editing, photo_url: url });
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-brand text-primary-foreground py-2 rounded font-medium disabled:opacity-50"
                >
                  {saving ? "Saving…" : (editing.id ? "Save Changes" : "Add Author")}
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="flex-1 bg-secondary text-secondary-foreground py-2 rounded font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p className="text-muted-foreground">Loading authors…</p>
        ) : authors.length === 0 ? (
          <p className="text-muted-foreground">No authors added yet.</p>
        ) : (
          authors.map((author) => (
            <div key={author.id} className="bg-card border border-border rounded-xl p-4 flex items-start gap-4">
              <div className="h-12 w-12 rounded-full overflow-hidden bg-muted flex-shrink-0">
                {author.photo_url ? (
                  <img src={author.photo_url} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-muted-foreground font-bold text-lg">
                    {author.name[0]}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold truncate">{author.name}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{author.bio || "No bio added."}</p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => setEditing(author)}
                    className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
                    title="Edit"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => del(author.id)}
                    className="p-1.5 hover:bg-destructive/10 rounded text-muted-foreground hover:text-destructive"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
