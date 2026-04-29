import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from "recharts";
import { FileText, Eye, Users, Inbox } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: Dashboard,
});

function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: string | number }) {
  return (
    <div className="bg-card border border-border rounded-lg p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <Icon className="h-5 w-5 text-brand" />
      </div>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}

function Dashboard() {
  const [stats, setStats] = useState({ posts: 0, views: 0, visitors: 0, submissions: 0 });
  const [daily, setDaily] = useState<{ day: string; views: number }[]>([]);
  const [topPosts, setTopPosts] = useState<{ title: string; views: number }[]>([]);
  const [topReferrers, setTopReferrers] = useState<{ referrer: string; count: number }[]>([]);

  useEffect(() => {
    (async () => {
      const [{ count: posts }, { count: subs }, { data: viewsAgg }] = await Promise.all([
        supabase.from("posts").select("*", { count: "exact", head: true }),
        supabase.from("submissions").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("post_views").select("visitor_id, viewed_at, referrer").gte("viewed_at", new Date(Date.now() - 30*24*3600*1000).toISOString()).limit(5000),
      ]);
      const totalViews = viewsAgg?.length ?? 0;
      const uniques = new Set((viewsAgg ?? []).map((v) => v.visitor_id)).size;
      setStats({ posts: posts ?? 0, views: totalViews, visitors: uniques, submissions: subs ?? 0 });

      const byDay = new Map<string, number>();
      (viewsAgg ?? []).forEach((v) => {
        const d = new Date(v.viewed_at).toISOString().slice(0, 10);
        byDay.set(d, (byDay.get(d) ?? 0) + 1);
      });
      const days: { day: string; views: number }[] = [];
      for (let i = 29; i >= 0; i--) {
        const d = new Date(Date.now() - i*24*3600*1000).toISOString().slice(0, 10);
        days.push({ day: d.slice(5), views: byDay.get(d) ?? 0 });
      }
      setDaily(days);

      const refMap = new Map<string, number>();
      (viewsAgg ?? []).forEach((v) => {
        let r = v.referrer || "(direct)";
        try { if (r.startsWith("http")) r = new URL(r).hostname; } catch {}
        refMap.set(r, (refMap.get(r) ?? 0) + 1);
      });
      setTopReferrers([...refMap.entries()].sort((a,b) => b[1]-a[1]).slice(0, 6).map(([referrer, count]) => ({ referrer, count })));

      const { data: tops } = await supabase.from("posts").select("title, view_count").eq("status", "published").order("view_count", { ascending: false }).limit(8);
      setTopPosts((tops ?? []).map((t) => ({ title: t.title, views: t.view_count })));
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Overview of activity in the last 30 days</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat icon={FileText} label="Total posts" value={stats.posts} />
        <Stat icon={Eye} label="Views (30d)" value={stats.views.toLocaleString()} />
        <Stat icon={Users} label="Unique visitors" value={stats.visitors.toLocaleString()} />
        <Stat icon={Inbox} label="Pending submissions" value={stats.submissions} />
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-5">
          <h3 className="font-semibold mb-3">Views — last 30 days</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={daily}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="views" stroke="var(--brand)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-5">
          <h3 className="font-semibold mb-3">Top posts</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={topPosts} layout="vertical" margin={{ left: 0 }}>
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="title" tick={{ fontSize: 10 }} width={150} />
                <Tooltip />
                <Bar dataKey="views" fill="var(--brand)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="bg-card border border-border rounded-lg p-5">
        <h3 className="font-semibold mb-3">Top referrers</h3>
        <div className="space-y-2">
          {topReferrers.length === 0 && <p className="text-sm text-muted-foreground">No data yet.</p>}
          {topReferrers.map((r) => (
            <div key={r.referrer} className="flex justify-between text-sm py-1.5 border-b border-border last:border-0">
              <span className="truncate">{r.referrer}</span>
              <span className="font-medium">{r.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
