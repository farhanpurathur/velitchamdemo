import { useEffect, useState, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ALL_CATEGORY_SLUGS, getCategoryDisplay } from "@/lib/categories";
import { Bold, Italic, List, ListOrdered, Quote, Heading2, Heading3, Link as LinkIcon, Image as ImageIcon, Upload } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9\u0d00-\u0d7f]+/g, "-").replace(/^-|-$/g, "").slice(0, 80) || `post-${Date.now()}`;
}

interface Props {
  postId?: string; // undefined => new
}

export function PostEditor({ postId }: Props) {
  const isNew = !postId || postId === "new";
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState({
    title: "", slug: "", excerpt: "", content: "", cover_image: "",
    category_slug: "religion", status: "draft", author_name: "",
    published_at: new Date().toISOString().split("T")[0],
  });
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isNew) { setLoading(false); return; }
    let cancelled = false;
    (async () => {
      const { data } = await supabase.from("posts").select("*, categories(slug)").eq("id", postId!).maybeSingle();
      if (cancelled) return;
      if (data) {
        setPost({
          title: data.title, slug: data.slug, excerpt: data.excerpt ?? "",
          content: data.content ?? "", cover_image: data.cover_image ?? "",
          category_slug: (data.categories as { slug?: string } | null)?.slug ?? "religion",
          status: data.status, author_name: data.author_name ?? "",
          published_at: data.published_at ? new Date(data.published_at).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
        });
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [postId, isNew]);

  useEffect(() => {
    if (!loading && editorRef.current && post.content && !isNew) {
      if (!editorRef.current.innerHTML) {
        editorRef.current.innerHTML = post.content;
      }
    }
  }, [loading, post.content, isNew]);

  function exec(cmd: string, value?: string) {
    document.execCommand(cmd, false, value);
    editorRef.current?.focus();
  }

  async function uploadImage(file: File): Promise<string | null> {
    const ext = file.name.split(".").pop();
    const path = `${user?.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("post-images").upload(path, file);
    if (error) { toast.error(error.message); return null; }
    return supabase.storage.from("post-images").getPublicUrl(path).data.publicUrl;
  }

  async function onCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return;
    const url = await uploadImage(f);
    if (url) setPost((p) => ({ ...p, cover_image: url }));
  }

  async function onInsertImage() {
    const input = document.createElement("input");
    input.type = "file"; input.accept = "image/*";
    input.onchange = async () => {
      const f = input.files?.[0]; if (!f) return;
      const url = await uploadImage(f);
      if (url) exec("insertHTML", `<img src="${url}" alt="" />`);
    };
    input.click();
  }

  async function save(publish?: boolean) {
    if (!post.title.trim()) { toast.error("Title is required"); return; }
    setSaving(true);
    const { data: cat, error: catErr } = await supabase
      .from("categories").select("id").eq("slug", post.category_slug).maybeSingle();
    if (catErr || !cat) {
      setSaving(false);
      toast.error(`Category "${post.category_slug}" not found in database`);
      return;
    }
    const content = editorRef.current?.innerHTML ?? post.content;
    const status = publish === true ? "published" : (publish === false ? "draft" : post.status);
    const slug = post.slug || slugify(post.title);
    const payload = {
      title: post.title,
      slug,
      excerpt: post.excerpt || null,
      content,
      cover_image: post.cover_image || null,
      category_id: cat.id,
      status,
      author_name: post.author_name || null,
      author_id: user?.id ?? null,
      published_at: status === "published" ? new Date(post.published_at).toISOString() : null,
    };
    const { error } = isNew
      ? await supabase.from("posts").insert(payload)
      : await supabase.from("posts").update(payload).eq("id", postId!);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Saved");
    navigate({ to: "/admin/posts", search: { category: "" } });
  }

  if (loading) return <p className="text-muted-foreground">Loading…</p>;

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">{isNew ? "New Post" : "Edit Post"}</h1>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Title</label>
            <input value={post.title} onChange={(e) => setPost({ ...post, title: e.target.value, slug: post.slug || slugify(e.target.value) })}
              className="w-full ml px-3 py-2.5 text-lg rounded border border-input bg-background" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Slug</label>
            <input value={post.slug} onChange={(e) => setPost({ ...post, slug: e.target.value })}
              className="w-full px-3 py-2 rounded border border-input bg-background font-mono text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Excerpt</label>
            <textarea value={post.excerpt} onChange={(e) => setPost({ ...post, excerpt: e.target.value })} rows={2}
              className="w-full ml px-3 py-2 rounded border border-input bg-background" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Content</label>
            <div className="border border-input rounded bg-background overflow-hidden">
              <div className="flex flex-wrap gap-1 p-2 border-b border-border bg-muted/40">
                <ToolBtn onClick={() => exec("bold")}><Bold className="h-4 w-4" /></ToolBtn>
                <ToolBtn onClick={() => exec("italic")}><Italic className="h-4 w-4" /></ToolBtn>
                <ToolBtn onClick={() => exec("formatBlock", "<h2>")}><Heading2 className="h-4 w-4" /></ToolBtn>
                <ToolBtn onClick={() => exec("formatBlock", "<h3>")}><Heading3 className="h-4 w-4" /></ToolBtn>
                <ToolBtn onClick={() => exec("formatBlock", "<blockquote>")}><Quote className="h-4 w-4" /></ToolBtn>
                <ToolBtn onClick={() => exec("insertUnorderedList")}><List className="h-4 w-4" /></ToolBtn>
                <ToolBtn onClick={() => exec("insertOrderedList")}><ListOrdered className="h-4 w-4" /></ToolBtn>
                <ToolBtn onClick={() => { const u = prompt("URL"); if (u) exec("createLink", u); }}><LinkIcon className="h-4 w-4" /></ToolBtn>
                <ToolBtn onClick={onInsertImage}><ImageIcon className="h-4 w-4" /></ToolBtn>
              </div>
              <div ref={editorRef} contentEditable suppressContentEditableWarning
                className="ml prose-velicham p-4 min-h-[400px] outline-none" />
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-lg p-4 space-y-3 sticky top-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Status</label>
              <select value={post.status} onChange={(e) => setPost({ ...post, status: e.target.value })}
                className="w-full px-3 py-2 rounded border border-input bg-background text-sm">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Category</label>
              <select value={post.category_slug} onChange={(e) => setPost({ ...post, category_slug: e.target.value })}
                className="w-full px-3 py-2 rounded border border-input bg-background text-sm">
                {ALL_CATEGORY_SLUGS.map((s) => {
                  const d = getCategoryDisplay(s);
                  return <option key={s} value={s}>{d.name}</option>;
                })}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Author name</label>
              <input value={post.author_name} onChange={(e) => setPost({ ...post, author_name: e.target.value })}
                className="w-full ml px-3 py-2 rounded border border-input bg-background text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Publish Date</label>
              <input type="date" value={post.published_at} onChange={(e) => setPost({ ...post, published_at: e.target.value })}
                className="w-full px-3 py-2 rounded border border-input bg-background text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Cover image</label>
              {post.cover_image && <img src={post.cover_image} className="w-full h-32 object-cover rounded mb-2" />}
              <label className="flex items-center justify-center gap-2 px-3 py-2 border border-dashed border-border rounded cursor-pointer hover:bg-muted text-sm">
                <Upload className="h-4 w-4" /> Upload image
                <input type="file" accept="image/*" onChange={onCoverUpload} className="hidden" />
              </label>
              {post.cover_image && (
                <button onClick={() => setPost({ ...post, cover_image: "" })} className="text-xs text-destructive mt-2">Remove</button>
              )}
            </div>
            <div className="pt-3 border-t border-border space-y-2">
              <button onClick={() => save(true)} disabled={saving || !post.title}
                className="w-full bg-brand text-primary-foreground py-2 rounded font-medium disabled:opacity-50">
                {saving ? "Saving…" : "Save & Publish"}
              </button>
              <button onClick={() => save(false)} disabled={saving || !post.title}
                className="w-full bg-secondary text-secondary-foreground py-2 rounded font-medium text-sm disabled:opacity-50">
                Save as Draft
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ToolBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="p-2 hover:bg-background rounded text-foreground">{children}</button>;
}
