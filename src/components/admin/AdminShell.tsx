import { Link, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard, FileText, Image as ImageIcon, Megaphone,
  Inbox, LogOut, Menu, PlusCircle, User as UserIcon,
} from "lucide-react";
import logoMark from "@/assets/logo-mark.png";
import { cn } from "@/lib/utils";

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean };
const NAV: NavItem[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/posts", label: "All Posts", icon: FileText },
  { to: "/admin/posts/new", label: "New Post", icon: PlusCircle },
  { to: "/admin/authors", label: "Authors", icon: UserIcon },
  { to: "/admin/slides", label: "Slides", icon: ImageIcon },
  { to: "/admin/announcements", label: "Announcements", icon: Megaphone },
  { to: "/admin/submissions", label: "Submissions", icon: Inbox },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, isEditor, isAdmin, loading, signOut } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user && typeof window !== "undefined") {
      window.location.href = "/auth";
    }
  }, [loading, user]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;
  if (!user) return null;
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-secondary/30">
        <div className="text-center max-w-md bg-card border border-border rounded-xl p-8 shadow-sm">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center text-2xl font-bold">!</div>
          <h1 className="text-2xl font-bold">Access denied</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Your account <span className="font-mono">{user.email}</span> does not have admin permissions.
            The /admin dashboard is restricted to site administrators only.
          </p>
          <div className="flex gap-2 justify-center mt-5">
            <button onClick={signOut} className="px-4 py-2 rounded bg-brand text-primary-foreground hover:bg-brand-light text-sm">Sign out</button>
            <a href="/" className="px-4 py-2 rounded border border-border hover:bg-secondary text-sm">Back to site</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-secondary/30">
      <aside className={cn(
        "bg-sidebar text-sidebar-foreground w-64 flex-shrink-0 flex flex-col fixed inset-y-0 left-0 z-40 h-screen transition-transform lg:sticky lg:top-0",
        open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
      )}>
        <div className="p-4 border-b border-sidebar-border flex items-center gap-3">
          <img src={logoMark} alt="Velicham" className="h-9 w-9 rounded bg-white/10 p-1" />
          <div>
            <p className="font-bold">Velicham</p>
            <p className="text-xs opacity-70">Admin</p>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {NAV.map((item) => {
            const active = item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to as "/admin"}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                  active ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium" : "hover:bg-sidebar-accent",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-sidebar-border">
          <p className="text-xs opacity-70 px-2 mb-2 truncate">{user.email} · Admin</p>
          <Link to="/" className="block w-full text-center mb-2 text-xs py-1.5 rounded bg-sidebar-accent hover:opacity-90">View site</Link>
          <button onClick={signOut} className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-sidebar-accent text-sm">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      {open && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setOpen(false)} />}

      <div className="flex-1 min-w-0">
        <header className="lg:hidden bg-card border-b border-border p-3 flex items-center gap-3 sticky top-0 z-20">
          <button onClick={() => setOpen(true)} aria-label="Open menu" className="p-2"><Menu className="h-5 w-5" /></button>
          <span className="font-semibold">Velicham Admin</span>
        </header>
        <main className="p-4 md:p-8 max-w-7xl mx-auto w-full">{children}</main>
      </div>
    </div>
  );
}
