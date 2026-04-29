import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ALL_CATEGORY_SLUGS, getCategoryDisplay } from "@/lib/categories";

export const Route = createFileRoute("/submit")({
  component: SubmitPage,
  head: () => ({
    meta: [
      { title: "Submit Article — Velicham" },
      { name: "description", content: "Submit your article, poem, story or review for consideration in Velicham magazine." },
      { property: "og:title", content: "Submit Article — Velicham" },
      { property: "og:description", content: "Submit your work to Velicham magazine." },
    ],
  }),
});

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  category_slug: z.enum(ALL_CATEGORY_SLUGS as [string, ...string[]]),
  title: z.string().trim().min(3).max(300),
  content: z.string().trim().min(50).max(20000),
});

function SubmitPage() {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse(Object.fromEntries(fd));
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("submissions").insert(parsed.data);
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    setDone(true);
    toast.success("Submission received");
  }

  return (
    <SiteLayout>
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <h1 className="ml text-3xl md:text-4xl font-bold text-brand">ലേഖനം സമർപ്പിക്കുക</h1>
        <p className="text-muted-foreground mt-2 mb-8">Submit your article for editorial review.</p>
        {done ? (
          <div className="bg-secondary p-8 rounded-lg text-center">
            <h2 className="text-xl font-semibold mb-2">Thank you!</h2>
            <p className="text-muted-foreground">Our editorial team will review your submission and get back to you.</p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-5">
            <Field label="Your Name" name="name" required maxLength={100} />
            <Field label="Email" name="email" type="email" required maxLength={255} />
            <div>
              <label className="block text-sm font-medium mb-1.5">Category <span className="text-destructive">*</span></label>
              <select name="category_slug" required className="w-full px-3 py-2 rounded-md border border-input bg-background">
                <option value="">Select a category</option>
                {ALL_CATEGORY_SLUGS.map((s) => {
                  const d = getCategoryDisplay(s);
                  return <option key={s} value={s}>{d.name} — {d.nameMl}</option>;
                })}
              </select>
            </div>
            <Field label="Title" name="title" required maxLength={300} />
            <div>
              <label className="block text-sm font-medium mb-1.5">Content <span className="text-destructive">*</span></label>
              <textarea
                name="content"
                required
                minLength={50}
                maxLength={20000}
                rows={12}
                className="ml w-full px-3 py-2 rounded-md border border-input bg-background"
                placeholder="Paste or write your article here…"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-brand text-primary-foreground font-medium py-3 rounded-md hover:bg-brand-light transition disabled:opacity-50"
            >
              {submitting ? "Submitting…" : "Submit Article"}
            </button>
          </form>
        )}
      </div>
    </SiteLayout>
  );
}

function Field({ label, name, type = "text", required = false, maxLength }: { label: string; name: string; type?: string; required?: boolean; maxLength?: number }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label} {required && <span className="text-destructive">*</span>}</label>
      <input
        name={name}
        type={type}
        required={required}
        maxLength={maxLength}
        className="w-full px-3 py-2 rounded-md border border-input bg-background"
      />
    </div>
  );
}
