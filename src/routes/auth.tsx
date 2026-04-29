import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import logo from "@/assets/logo-velicham.png";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  head: () => ({ meta: [{ title: "Sign In — Velicham Admin" }] }),
});

function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate({ to: "/admin", replace: true });
    }
  }, [loading, user, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Signed in");
    // navigation handled by useEffect when auth state updates
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/40 px-4">
      <div className="w-full max-w-md">
        <Link to="/" className="flex justify-center mb-6">
          <img src={logo} alt="Velicham" className="h-14 w-auto" />
        </Link>
        <div className="bg-card border border-border rounded-xl shadow-sm p-8">
          <h1 className="text-2xl font-bold text-center mb-1">Admin Sign In</h1>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Access the Velicham dashboard
          </p>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <input
                value={email} onChange={(e) => setEmail(e.target.value)}
                type="email" required autoComplete="email"
                className="w-full px-3 py-2 rounded-md border border-input bg-background"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Password</label>
              <input
                value={password} onChange={(e) => setPassword(e.target.value)}
                type="password" required minLength={6}
                autoComplete="current-password"
                className="w-full px-3 py-2 rounded-md border border-input bg-background"
              />
            </div>
            <button
              disabled={busy}
              className="w-full bg-brand text-primary-foreground font-medium py-2.5 rounded-md hover:bg-brand-light disabled:opacity-50"
            >
              {busy ? "Please wait…" : "Sign In"}
            </button>
          </form>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-4">
          Restricted area. Only authorized administrators can sign in.
        </p>
      </div>
    </div>
  );
}
