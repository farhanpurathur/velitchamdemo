import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/announcements")({
  component: AnnouncementsPage,
});

interface Row { id: string; message: string; link_url: string | null; is_active: boolean; created_at: string; }

function AnnouncementsPage() {
  const [items, setItems] = useState<Row[]>([]);
  const [msg, setMsg] = useState(""); const [link, setLink] = useState("");

  async function load() {
    const { data } = await supabase.from("announcements").select("*").order("created_at", { ascending: false });
    setItems(data ?? []);
  }
  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!msg.trim()) return;
    const { error } = await supabase.from("announcements").insert({ message: msg.trim(), link_url: link.trim() || null, is_active: true });
    if (error) return toast.error(error.message);
    setMsg(""); setLink(""); load(); toast.success("Posted");
  }
  async function toggle(id: string, active: boolean) {
    await supabase.from("announcements").update({ is_active: !active }).eq("id", id);
    load();
  }
  async function del(id: string) {
    if (!confirm("Delete?")) return;
    await supabase.from("announcements").delete().eq("id", id);
    load();
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Announcements</h1>
      <form onSubmit={add} className="bg-card border border-border rounded-lg p-4 space-y-3 mb-6">
        <input value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Announcement message…"
          maxLength={300} required className="w-full ml px-3 py-2 rounded border border-input bg-background" />
        <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="Link URL (optional)"
          className="w-full px-3 py-2 rounded border border-input bg-background text-sm" />
        <button className="inline-flex items-center gap-2 px-4 py-2 rounded bg-brand text-primary-foreground text-sm">
          <Plus className="h-4 w-4" /> Post announcement
        </button>
      </form>
      <div className="space-y-2">
        {items.length === 0 && <p className="text-muted-foreground text-center py-8">No announcements.</p>}
        {items.map((a) => (
          <div key={a.id} className="bg-card border border-border rounded-lg p-3 flex items-center gap-3">
            <span className={`h-2 w-2 rounded-full ${a.is_active ? "bg-green-500" : "bg-gray-400"}`} />
            <p className="ml flex-1">{a.message}</p>
            <button onClick={() => toggle(a.id, a.is_active)} className="text-xs px-2 py-1 hover:bg-muted rounded">{a.is_active ? "Disable" : "Enable"}</button>
            <button onClick={() => del(a.id)} className="p-2 hover:bg-destructive/10 text-destructive rounded"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
