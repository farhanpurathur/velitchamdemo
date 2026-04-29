import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Announcement {
  id: string;
  message: string;
  link_url: string | null;
}

export function AnnouncementBar() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    supabase
      .from("announcements")
      .select("id, message, link_url")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .then(({ data }) => setItems(data ?? []));
  }, []);

  const visible = items.filter((i) => !dismissed.has(i.id));
  if (visible.length === 0) return null;

  return (
    <div className="bg-brand text-primary-foreground">
      {visible.map((a) => (
        <div key={a.id} className="container mx-auto flex items-center gap-3 px-4 py-2 text-sm">
          <span className="flex-1 ml">
            {a.link_url ? (
              <a href={a.link_url} className="hover:underline">{a.message}</a>
            ) : (
              a.message
            )}
          </span>
          <button
            onClick={() => setDismissed((s) => new Set(s).add(a.id))}
            aria-label="Dismiss"
            className="p-1 hover:bg-white/10 rounded"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
