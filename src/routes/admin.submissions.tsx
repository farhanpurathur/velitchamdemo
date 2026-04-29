import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/submissions")({
  component: SubmissionsPage,
});

interface Row { id: string; name: string; email: string; category_slug: string; title: string; content: string; status: string; created_at: string; }

function SubmissionsPage() {
  const [items, setItems] = useState<Row[]>([]);
  const [open, setOpen] = useState<Row | null>(null);

  async function load() {
    const { data } = await supabase.from("submissions").select("*").order("created_at", { ascending: false });
    setItems(data ?? []);
  }
  useEffect(() => { load(); }, []);

  async function setStatus(id: string, status: string) {
    await supabase.from("submissions").update({ status }).eq("id", id);
    toast.success("Updated"); load();
    if (open?.id === id) setOpen({ ...open, status });
  }

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Submissions</h1>
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left">
            <tr><th className="px-4 py-2.5">From</th><th className="px-4 py-2.5">Title</th><th className="px-4 py-2.5">Category</th><th className="px-4 py-2.5">Status</th><th className="px-4 py-2.5"></th></tr>
          </thead>
          <tbody>
            {items.length === 0 && <tr><td colSpan={5} className="py-12 text-center text-muted-foreground">No submissions.</td></tr>}
            {items.map((s) => (
              <tr key={s.id} className="border-t border-border hover:bg-muted/40">
                <td className="px-4 py-3"><div>{s.name}</div><div className="text-xs text-muted-foreground">{s.email}</div></td>
                <td className="px-4 py-3 ml font-medium max-w-xs truncate">{s.title}</td>
                <td className="px-4 py-3">{s.category_slug}</td>
                <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 rounded bg-secondary">{s.status}</span></td>
                <td className="px-4 py-3 text-right"><button onClick={() => setOpen(s)} className="text-brand hover:underline">View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setOpen(null)}>
          <div className="bg-card rounded-lg p-6 max-w-2xl w-full max-h-[85vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="ml text-2xl font-bold mb-2">{open.title}</h2>
            <p className="text-sm text-muted-foreground mb-4">{open.name} · {open.email} · {open.category_slug}</p>
            <div className="ml prose-velicham whitespace-pre-wrap mb-6 max-h-96 overflow-auto bg-muted/40 p-4 rounded">{open.content}</div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setStatus(open.id, "rejected")} className="px-3 py-2 rounded border border-border text-sm">Reject</button>
              <button onClick={() => setStatus(open.id, "approved")} className="px-3 py-2 rounded bg-brand text-primary-foreground text-sm">Approve</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
