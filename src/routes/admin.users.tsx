import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/admin/users")({
  component: UsersPage,
});

interface Profile { id: string; display_name: string | null; }
interface RoleRow { user_id: string; role: string; }

function UsersPage() {
  const { isAdmin } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [roles, setRoles] = useState<RoleRow[]>([]);

  async function load() {
    const { data: p } = await supabase.from("profiles").select("id, display_name");
    const { data: r } = await supabase.from("user_roles").select("user_id, role");
    setProfiles(p ?? []); setRoles(r ?? []);
  }
  useEffect(() => { load(); }, []);

  async function setRole(uid: string, role: "admin" | "editor" | "user") {
    await supabase.from("user_roles").delete().eq("user_id", uid);
    const { error } = await supabase.from("user_roles").insert({ user_id: uid, role });
    if (error) return toast.error(error.message);
    toast.success("Updated"); load();
  }

  if (!isAdmin) return <p className="text-muted-foreground">Only admins can manage users.</p>;

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Users & Roles</h1>
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left">
            <tr><th className="px-4 py-2.5">Name</th><th className="px-4 py-2.5">User ID</th><th className="px-4 py-2.5">Role</th></tr>
          </thead>
          <tbody>
            {profiles.map((p) => {
              const r = roles.find((x) => x.user_id === p.id)?.role ?? "user";
              return (
                <tr key={p.id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium">{p.display_name ?? "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs">{p.id.slice(0, 8)}…</td>
                  <td className="px-4 py-3">
                    <select value={r} onChange={(e) => setRole(p.id, e.target.value as any)}
                      className="px-2 py-1 rounded border border-input bg-background text-sm">
                      <option value="user">user</option>
                      <option value="editor">editor</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground mt-4">Tip: the very first admin must be set in the database directly. Sign up an account, then use the database tools to insert a row in <code>user_roles</code> with role = 'admin'.</p>
    </div>
  );
}
